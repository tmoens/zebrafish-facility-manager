import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete,
  Get,
  Param,
  Post, Put, Query, Request, UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {UserService} from './user.service';
import {User} from './user.entity';
import {ResetPasswordDTO, UserDTO, UserPasswordChangeDTO} from "../common/user/UserDTO";
import {AuthService} from "../auth/auth.service";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {JwtAuthGuard2} from "../guards/jwt-auth.guard2";
import {Role} from "../guards/role.decorator";
import {ADMIN_ROLE, USER_ROLE} from "../common/auth/zf-roles";
import {RoleGuard} from "../guards/role-guard.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly authService: AuthService,
  ) {
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findFiltered(@Query('filter') filter): Promise<User[]> {
    return await this.service.findFiltered(filter);
  }


  @UseGuards(JwtAuthGuard)
  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() dto: UserDTO): Promise<User> {
    return this.service.create(dto);
  }

  // Note the special AuthGuard, it doe not check for the "requiresPasswordChange" state.
  @UseGuards(JwtAuthGuard2)
  @Put('changePassword')
  async changePassword(@Request() req, @Body() dto: UserPasswordChangeDTO): Promise<any> {
    return {accessToken: this.authService.buildToken(await this.service.changePassword(req.user, dto))};
  }

  // This one is strange the way it is now, anyone anywhere could reset anyone else's password by knowing
  // another user's username.  Seems wrong.  But we cannot guard it with a normal JwtAuthGuard because
  // then the user would have to log in in order to be able to reset their forgotten password.
  @Put('resetPassword')
  async resetPassword(@Body() dto: ResetPasswordDTO): Promise<User> {
    return this.service.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Role(ADMIN_ROLE)
  @UseGuards(RoleGuard)
  @Put()
  async update(@Body() dto: UserDTO): Promise<User> {
    return this.service.update(dto);
  }


  @UseGuards(JwtAuthGuard)
  @Role(ADMIN_ROLE)
  @UseGuards(RoleGuard)
  @Delete()
  async delete(@Body() dto: UserDTO): Promise<User> {
    return this.service.delete(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id')  id: string): Promise<User> {
    return await this.service.findOne(id);
  }

}
