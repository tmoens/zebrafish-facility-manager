export class UserDTO {
  id?: string;
  email?: string;
  isActive?: boolean;
  isLoggedIn?: boolean;
  name?: string;
  passwordChangeRequired?: boolean;
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
