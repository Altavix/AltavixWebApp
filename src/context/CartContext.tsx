import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CartService, OrderService } from '../services/CartService';
import type { OrderItemVm } from '../services/CartService';
import { useAuth } from '../hooks/useAuth';
import { useFetching } from '../hooks/useFetching';

interface CartContextType {
    orderId: string | null;
    orderNumber: number | null;
    items: OrderItemVm[];
    isCartOpen: boolean;
    toggleCart: () => void;
    addToCart: (productId: string, quantity?: number) => Promise<boolean>;
    updateQuantity: (orderItemId: string, newQuantity: number) => Promise<void>;
    removeFromCart: (orderItemId: string) => Promise<void>;
    clearCart: () => void;
    totalPrice: number;
    totalQuantity: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [orderId, setOrderId] = useState<string | null>(localStorage.getItem('cartOrderId'));
    const [orderNumber, setOrderNumber] = useState<number | null>(null);
    const [items, setItems] = useState<OrderItemVm[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // API calls wrapped with useFetching
    const [fetchGetCartItems, isLoadingCartItems] = useFetching<OrderItemVm[]>(CartService.getCartItems);
    const [fetchGetOrder, isLoadingOrder] = useFetching<any>(OrderService.getOrderById);
    const [fetchCreateCart, isCreatingCart] = useFetching<string>(OrderService.createCart);
    const [fetchAddItem, isAddingItem] = useFetching<string>(CartService.addItem);
    const [fetchUpdateQuantity, isUpdatingQuantity] = useFetching<boolean>(CartService.updateQuantity);
    const [fetchRemoveItem, isRemovingItem] = useFetching<boolean>(CartService.removeItem);

    useEffect(() => {
        if (orderId) {
            loadCartItems(orderId);
        }
    }, [orderId]);

    const loadCartItems = async (id: string) => {
        const result = await fetchGetCartItems(id);
        if (result.messageType === 'success' && result.data) {
            setItems(result.data);
            
            // Fetch order details to get the generated order number
            const orderResult = await fetchGetOrder(id);
            if (orderResult.messageType === 'success' && orderResult.data) {
                setOrderNumber(orderResult.data.number);
            }
        } else if (result.messageType === 'error') {
            // If the order was already checked out or doesn't exist, clear it
            clearCart();
        }
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const getOrCreateCart = async (): Promise<string> => {
        if (orderId) return orderId;
        
        const result = await fetchCreateCart(user?.id);
        if (result.messageType === 'success' && result.data) {
            const newOrderId = result.data;
            setOrderId(newOrderId);
            localStorage.setItem('cartOrderId', newOrderId);
            return newOrderId;
        }
        throw new Error("Failed to create cart");
    };

    const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
        try {
            let id = await getOrCreateCart();
            
            // Check if item already exists locally, just update quantity if so
            const existingItem = items.find(i => i.productId === productId);
            if (existingItem) {
                await updateQuantity(existingItem.id, existingItem.quantity + quantity);
                setIsCartOpen(true);
                return true;
            }

            const addResult = await fetchAddItem(id, productId, quantity);
            
            if (addResult.messageType === 'error') {
                // If it fails (e.g. 500 because the old cart ID in local storage doesn't exist in DB anymore),
                // clear the local cart and create a new one.
                clearCart();
                const newIdResult = await fetchCreateCart(user?.id);
                if (newIdResult.messageType === 'success' && newIdResult.data) {
                    const newId = newIdResult.data;
                    setOrderId(newId);
                    localStorage.setItem('cartOrderId', newId);
                    
                    const retryAddResult = await fetchAddItem(newId, productId, quantity);
                    if (retryAddResult.messageType === 'error') return false;
                    id = newId;
                } else {
                    return false;
                }
            }

            await loadCartItems(id);
            setIsCartOpen(true); // Open cart automatically
            return true;
        } catch (error) {
            console.error("Failed to add to cart", error);
            return false;
        }
    };

    const updateQuantity = async (orderItemId: string, newQuantity: number) => {
        if (!orderId) return;
        if (newQuantity <= 0) {
            await removeFromCart(orderItemId);
            return;
        }
        
        // Optimistic update
        const previousItems = [...items];
        setItems(items.map(item => item.id === orderItemId ? { ...item, quantity: newQuantity } : item));
        
        const result = await fetchUpdateQuantity(orderId, orderItemId, newQuantity);
        if (result.messageType === 'error') {
            setItems(previousItems); // Revert on failure
        }
    };

    const removeFromCart = async (orderItemId: string) => {
        if (!orderId) return;
        
        // Optimistic update
        const previousItems = [...items];
        setItems(items.filter(item => item.id !== orderItemId));
        
        const result = await fetchRemoveItem(orderId, orderItemId);
        if (result.messageType === 'error') {
            setItems(previousItems); // Revert on failure
        }
    };

    const clearCart = () => {
        setOrderId(null);
        setOrderNumber(null);
        setItems([]);
        localStorage.removeItem('cartOrderId');
    };

    const totalPrice = items.reduce((sum, item) => sum + (item.unitPrice + (item.unitPriceCoin / 100)) * item.quantity, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const isLoading = isLoadingCartItems || isCreatingCart || isAddingItem || isUpdatingQuantity || isRemovingItem || isLoadingOrder;

    return (
        <CartContext.Provider value={{
            orderId, orderNumber, items, isCartOpen, toggleCart, addToCart, updateQuantity, removeFromCart, clearCart, totalPrice, totalQuantity, isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
