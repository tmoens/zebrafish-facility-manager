import { Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private _loggedIn: { [userId: string]: string } = {};
  constructor(
    private jwtService: JwtService,
  ) {}


  login(user: User): string {
    const token = this.buildToken(user);
    return token;
  }

  async logout(user: User): Promise<boolean> {
    delete this._loggedIn[user.id];
    return true;
  }

  buildToken(user: User): string {
    const payload = { username: user.username, sub: user.id, role: user.role, passwordChangeRequired: user.passwordChangeRequired};
    const token = this.jwtService.sign(payload);
    this._loggedIn[user.id] = token;
    return token;
  }

  isLoggedIn(user: User) {
    return !!(this._loggedIn[user.id]);
  }
}
