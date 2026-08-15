import { $api } from '../config/api';

export interface UserProfileDto {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phoneNumber: string;
}

export const UserService = {
    getUserProfile: async (id: string) => {
        return $api.get(`/user/${id}`);
    },
    
    updateUserProfile: async (data: UserProfileDto) => {
        return $api.put('/user/profile', data);
    }
};
