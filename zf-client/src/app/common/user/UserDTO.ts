export class UserDTO {
  id?: string;
  email?: string;
  isActive?: boolean;
  name?: string;
  password?: string;
  phone?: string;
  role?: string;
  username?: string;
}

export class ResetPasswordDTO{
  usernameOrEmail: string
}

export class UserPasswordChangeDTO {
  currentPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}
