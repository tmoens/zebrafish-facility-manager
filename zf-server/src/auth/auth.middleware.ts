import {Injectable, NestMiddleware, UnauthorizedException} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

/**
 * This middleware is responsible for allowing a user to stay logged in as long
 * as they have used the client in the last period, where period is determined
 * by the server configuration for token expiry period.
 *
 * It works like this:
 * for any route that uses this middleware,
 * if the request contains a valid bearer token,
 * put a new token in the "token" header of the response.
 *
 * The new token will have the appropriate expiry in it.
 *
 * TODO deal with not staying logged in forever.
 * TODO the exception message are not being sent.
 */

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {

  }

  async use(req: Request, res: Response, next: Function) {

    // get the bearer token from the request header
    const token: string = <string>req.headers['authorization'].slice(7);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    // the rest of the checks are self-explanatory
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(error);
    }

    if (!payload) {
      throw new UnauthorizedException('Invalid bearer token 1');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid bearer token 2');
    }

    if (!this.authService.isWhitelisted(payload.sub, token)) {
      throw new UnauthorizedException('Invalid bearer token 3');
    }

    // we could build the new token from the old payload, but if we
    // did that, any recent changes to the user would not be picked up.
    // So we lookup the user and build a new token.
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid bearer token');
    }
    const newToken = this.authService.buildToken(user);

    req.user = user;

    console.log("b" + JSON.stringify(req.user));
    res.setHeader("token", newToken);

    next();
  }
}
