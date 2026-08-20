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
    getOrdersList: async (clientId?: string, page = 1, pageSize = 50, sortColumn?: string, sortDirection?: string, filters?: Record<string, string>) => {
        let url = `/orders?page=${page}&pageSize=${pageSize}`;
        if (clientId) url += `&clientId=${clientId}`;
        if (sortColumn) url += `&sortColumn=${sortColumn}`;
        if (sortDirection) url += `&sortDirection=${sortDirection}`;
        
        if (filters) {
            let i = 0;
            for (const [key, value] of Object.entries(filters)) {
                if (value) {
                    url += `&Filters[${i}].Key=${encodeURIComponent(key)}&Filters[${i}].Value=${encodeURIComponent(value)}`;
                    i++;
                }
            }
        }
        return $api.get(url);
    },
    createCart: async (clientId?: string) => {
        const payload = clientId ? { clientId } : {};
        return $api.post(`/orders/cart`, payload);
    },
    checkout: async (payload: any) => {
        return $api.post(`/orders/checkout`, payload);
    },
    updateOrderDetails: async (id: string, payload: any, isAdmin?: boolean) => {
        const url = isAdmin ? `/orders/admin/${id}` : `/orders/${id}`;
        return $api.put(url, payload);
    },
    updateOrderStatus: async (id: string, newStatus: number) => {
        return $api.put(`/orders/${id}/status`, { newStatus });
    },
    cancelOrder: async (id: string) => {
        return $api.post(`/orders/${id}/cancel`);
    },
    getDeliveryMethods: async () => {
        return $api.get(`/deliverymethods/active`);
    },
    getDeliveryMethodOptions: async () => {
        return $api.get(`/deliverymethods/options`);
    },
    getPaymentMethods: async () => {
        return $api.get(`/paymentmethods/active`);
    },
    getPaymentMethodOptions: async () => {
        return $api.get(`/paymentmethods/options`);
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

    async updateQuantity(orderId: string, orderItemId: string, newQuantity: number, isAdmin?: boolean) {
        const url = isAdmin ? `/orderitems/admin/update-quantity` : `/orderitems/update-quantity`;
        return await $api.put(url, {
            orderId,
            orderItemId,
            newQuantity
        });
    },

    async removeItem(orderId: string, orderItemId: string, isAdmin?: boolean) {
        const url = isAdmin ? `/orderitems/admin/remove` : `/orderitems/remove`;
        return await $api.post(url, {
            orderId,
            orderItemId
        });
    }
};
