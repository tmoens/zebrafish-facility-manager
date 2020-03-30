import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
const crypto = require('crypto');

@Injectable()
export class AuthService {
  private _loggedIn: { [userId: string]: string } = {};
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUserByPassword(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findByUserName(username);
    if (user && user.password === crypto.scryptSync(pass, user.salt, 64, {N: 1024}).toString('hex')) {
      // Note we return the user with encrypted password and salt. We could remove those here.
      // However, the user is ultimately returned with ClassSerializerInterceptor which applies
      // the @Exclude annotation on these fields.  So bottom line, they do not get exported.
      return user;
    }
    return null;
  }

  login(user: User): string {
    const token = this.buildToken(user);
    this._loggedIn[user.id] = token;
    return token;
  }

  async logout(user: User): Promise<boolean> {
    delete this._loggedIn[user.id];
    return true;
  }

  buildToken(user: User): string {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return token;
  }

  isLoggedIn(user: User) {
    return !!(this._loggedIn[user.id]);
  }
}
