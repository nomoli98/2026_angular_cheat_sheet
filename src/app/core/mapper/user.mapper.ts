import { UserResponse } from '@core/responses/user.response';
import { UserEntity } from '@core/entities/user.entity';

export function UserMapper(user: UserEntity): UserResponse {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        birthdate: user.birthdate,
        height: user.height,
        gender: user.gender,
        subscription: user.subscription,
        role: user.role,
    };
}
