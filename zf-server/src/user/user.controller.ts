import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {UserService} from './user.service';
import {User} from './user.entity';
import {ResetPasswordDTO, UserDTO, UserPasswordChangeDTO} from "../common/user/UserDTO";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {JwtAuthGuard2} from "../guards/jwt-auth.guard2";
import {Role} from "../guards/role.decorator";
import {ADMIN_ROLE} from "../common/auth/zf-roles";
import {RoleGuard} from "../guards/role-guard.service";
import {LocalAuthGuard} from "../guards/local-auth.guard";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
  ) {
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('filtered')
  async findAll(): Promise<User[]> {
    console.log('nofilter');
    return await this.service.findFiltered();
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('filtered/:filter')
  async findFiltered(@Param('filter') filter: string): Promise<User[]> {
    console.log('user filter at controller: ' + filter);
    return await this.service.findFiltered(filter);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('isUsernameInUse/:username')
  async doesUsernameExist(@Param('username')  username: string): Promise<boolean> {
    return await this.service.doesUsernameExist(username);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('isEmailInUse/:email')
  async doesEmailExist(@Param('email')  email: string): Promise<boolean> {
    return await this.service.doesEmailExist(email);
  }

  // This one is strange the way it is now, anyone anywhere could reset anyone else's password by knowing
  // another user's username.  Seems wrong.  But we cannot guard it with a normal JwtAuthGuard because
  // then the user would have to log in in order to be able to reset their forgotten password.
  @Put('resetPassword')
  async resetPassword(@Body() dto: ResetPasswordDTO): Promise<User> {
    return this.service.resetPassword(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  async create(@Body() dto: UserDTO): Promise<User> {
    console.log(JSON.stringify(dto));
    return this.service.create(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put()
  async update(@Body() dto: UserDTO): Promise<User> {
    return this.service.update(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('activate')
  async activate(@Body() dto: UserDTO): Promise<User> {
    return this.service.activate(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('deactivate')
  async deactivate(@Body() dto: UserDTO): Promise<User> {
    return this.service.deactivate(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('forceLogout')
  async forceLogout(@Body() dto: UserDTO): Promise<User> {
    return this.service.forceLogout(dto);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  async delete(@Param('id')  id: string): Promise<User> {
    return this.service.delete(id);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  async getById(@Param('id')  id: string): Promise<User> {
    return await this.service.findOne(id);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<{ access_token: string }> {
    // Don't forget, Ted, that the LocalAuthGuard
    // handles the Request and sticks the whole validated user in it.
    return {access_token: await this.service.login(req.user)};
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req): Promise<boolean> {
    // Remember, the JwtAuthGuard looks up the user based on info in the
    // token and pushes the user object into the request.
    return await this.service.logout(req.user);
  }

  // Note the special AuthGuard, it does not check for the "requiresPasswordChange" state.
  @UseGuards(JwtAuthGuard2)
  @Put('changePassword')
  async changePassword(@Request() req, @Body() dto: UserPasswordChangeDTO): Promise<{ access_token: string }> {
    return {access_token: await this.service.changePassword(req.user, dto)};
  }
}
