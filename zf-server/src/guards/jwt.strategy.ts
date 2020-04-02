import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import {AuthService} from "./auth.service";
import {UserService} from "../user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    // At this point, the token itself and the expiry have already been checked by Passport.

    // However, the user may have logged out or been deactivated.

    const user = await this.userService.findActiveUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token does not identify an active user.');
    }

    // if (user.passwordChangeRequired) {
    //   throw new UnauthorizedException('Password change required.');
    // }

    if (!this.authService.isLoggedIn(user)) {
      throw new UnauthorizedException('Token does not identify a logged in user.');
    }

    // passport will stick the user in the request object for us.
    return user;
  }
}
