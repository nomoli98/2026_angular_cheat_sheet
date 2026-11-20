import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

export interface UserEntity {
    id: number;
    name: string;
    email: string;
    password: string;
    birthdate: string;
    height: number;
    gender: GenderEnum;
    subscription: SubscriptionEnum;
    agreeToTerms: boolean;
    role: RoleEnum;
}
