export const GUEST_ROLE = 'guest';
export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';

export class ZFRoles {
  private static _roles: { [name: string]: number } = {
  'admin': 0,
  'user': 5,
  'guest': 13,
 }

 static getRoles(): string[] {
    return Object.keys(this._roles);
 }
}
