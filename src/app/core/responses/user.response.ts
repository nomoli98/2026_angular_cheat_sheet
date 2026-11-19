import { GenderEnum } from '../enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';

export interface UserResponse {
  name: string;
  email: string;
  birthdate: string;
  height: number;
  gender: GenderEnum;
  subscription: SubscriptionEnum;
  agreeToTerms: boolean;
}
