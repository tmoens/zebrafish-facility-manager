import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import {passportJwtSecret} from "jwks-rsa";
import {ConfigService} from "../config/config.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${configService.auth0Config.domain}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.auth0Config.audience,
      issuer: `https://${configService.auth0Config.domain}/`,
      algorithms: ['RS256'],
    });
    console.log('Extract...:' + ExtractJwt.fromAuthHeaderAsBearerToken());
    console.log(`jwksUri: https://${configService.auth0Config.domain}/.well-known/jwks.json`);
    console.log(`audience: ${configService.auth0Config.audience}`);
    console.log(`issuer: https://${configService.auth0Config.domain}/`);
  }

  validate(payload: any) {
    return payload;
  }

}

