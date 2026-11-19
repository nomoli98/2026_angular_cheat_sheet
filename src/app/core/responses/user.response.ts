import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';

export interface UserResponse {
  id: number; // json-server gives every person an id
  name: string;
  email: string;
  birthdate: string;
  height: number;
  gender: GenderEnum;
  subscription: SubscriptionEnum;
  agreeToTerms: boolean;
}
