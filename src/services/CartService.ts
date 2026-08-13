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

export const OrderService = {
    async createCart(clientId?: string) {
        return await $api.post(`/orders/cart`, { clientId });
    },

    async checkout(orderId: string, checkoutData: any) {
        return await $api.post(`/orders/checkout`, {
            orderId,
            ...checkoutData
        });
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
