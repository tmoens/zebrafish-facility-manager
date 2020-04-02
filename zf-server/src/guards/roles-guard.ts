import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {User} from "../user/user.entity";
import {Reflector} from "@nestjs/core";
import {ZFRoles} from "../common/auth/zf-roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permittedRole = this.reflector.get<string>('role', context.getHandler());
    console.log('permitted role: ' + permittedRole);
    if (!permittedRole) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    return ZFRoles.isAuthorized(user.role, permittedRole);
  }
}
