import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
const crypto = require('crypto');

/**
 * TODO put time of last login into the token and eventually force logout.
 */
@Injectable()
export class AuthService {
  whitelist: {[userId: string]: string } = {};
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    console.log("username: " + username + " pass: " + pass);
    const user = await this.usersService.findByUserName(username);
    if (user && user.password === crypto.scryptSync(pass, user.salt, 64, {N: 1024}).toString('hex')) {
      // Note we return the user with encrypted password and salt. We could remove those here.
      // However, the user is ultimately returned with ClassSerializerInterceptor which applies
      // the @Exclude annotation on these fields.  So bottom line, they do not get exported.
      return user;
    }
    return null;
  }

  async login(user: User): Promise<{ access_token: string }>{
    return {
      access_token: this.buildToken(user),
    };
  }

  async logout(userId: string): Promise<boolean> {
    const user: User = await this.usersService.findOne(userId);
    if (user) {
      delete this.whitelist[user.id];
    }
    return true;
  }

  buildToken(user: User): string {
    console.log('buildToken');
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    this.whitelist[user.id] = token;
    return token;
  }

  isWhitelisted(userId: string, token: string): boolean {
    return this.whitelist[userId] === token;
  }
}
