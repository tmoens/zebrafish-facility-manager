import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UserService} from "../user/user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.userService.validateUserByPassword(username, password);
    if (!user) {
      throw new UnauthorizedException("Invalid username and password.");
    }
    if (!user.isActive) {
      throw new UnauthorizedException("User is not active.");
    }
    return user;
  }
}
