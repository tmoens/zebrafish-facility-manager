import {
  ClassSerializerInterceptor, Controller,
  Get, Param, Post, Request,
  UseGuards, UseInterceptors
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    console.log('auth/login');
    // Born in the 50's.  Don't forget, Ted, that the LocalAuthGuard
    // handles the Request and sticks the whole validated user in it.
    return this.authService.login(req.user);
  }

  @Post('auth/logout/:id')
  async logout(@Param('id')  id: string) {
    console.log('auth/logout');
    return this.authService.logout(id);
  }

  @Get('profile/:id')
  getProfile(@Request() req) {
    // Born in the 50's.  Don't forget, Ted, that the auth middleware
    // handles the Request and sticks the whole validated user in it.
    console.log('profile');
    console.log('user: ' + req.user);
    console.log('user: ' + JSON.stringify(req.user));
    return req.user;
  }
}
