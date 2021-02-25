export class UserDTO {
  id = '';
  email = '';
  isActive = true;
  isLoggedIn = false;
  name = '';
  passwordChangeRequired = false;
  phone = '';
  role = '';
  username = '';
  isPrimaryInvestigator = false;
  isResearcher = true;
  initials = '';
  isDeletable = true;
}

export class ResetPasswordDTO{
  usernameOrEmail: string
}

export class UserPasswordChangeDTO {
  currentPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}
