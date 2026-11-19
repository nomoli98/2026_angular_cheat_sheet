import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';

export interface UserInterface {
  name: string;
  email: string;
  password: string;
  birthdate: Date;
  height: number;
  gender: GenderEnum;
  subscription: SubscriptionEnum;
  agreeToTerms: boolean;
}
