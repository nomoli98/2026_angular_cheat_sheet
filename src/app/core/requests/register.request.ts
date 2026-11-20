import { GenderEnum } from '@core/enums/gender.enum';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    birthdate: string;
    height: number;
    gender: GenderEnum;
    subscription: 'free' | 'premium';
    agreeToTerms: boolean;
}
