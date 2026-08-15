import type { ApiResponseDto } from '../types/api';
import { $api } from '../config/api';

export interface CreateCartResponse {
    value: string;
}

export interface OrderItemVm {
    id: string;
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    unitPriceCoin: number;
}

export interface DeliveryMethodVm {
    id: string;
    title: string;
    description: string | null;
    price: number;
    type: number;
    isActive: boolean;
}

export interface PaymentMethodVm {
    id: string;
    title: string;
    type: number;
    isActive: boolean;
}

// Removed API_ENDPOINTS

export const OrderService = {
    getOrderById: async (id: string) => {
        return $api.get(`/orders/${id}`);
    },
    createCart: async (clientId?: string) => {
        const payload = clientId ? { clientId } : {};
        return $api.post(`/orders/cart`, payload);
    },
    checkout: async (payload: any) => {
        return $api.post(`/orders/checkout`, payload);
    },
    getDeliveryMethods: async () => {
        return $api.get(`/deliverymethods/active`);
    },
    getPaymentMethods: async () => {
        return $api.get(`/paymentmethods/active`);
    }
};

export const CartService = {
    async getCartItems(orderId: string) {
        return await $api.get(`/orderitems/order/${orderId}`);
    },

    async addItem(orderId: string, productId: string, quantity: number) {
        return await $api.post(`/orderitems/add`, {
            orderId,
            productId,
            quantity
        });
    },

    async updateQuantity(orderId: string, orderItemId: string, newQuantity: number) {
        return await $api.put(`/orderitems/update-quantity`, {
            orderId,
            orderItemId,
            newQuantity
        });
    },

    async removeItem(orderId: string, orderItemId: string) {
        return await $api.post(`/orderitems/remove`, {
            orderId,
            orderItemId
        });
    }
};
