import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  birthdate: string;
  height: number;
  gender: GenderEnum;
  subscription: SubscriptionEnum;
  role: RoleEnum;
}
