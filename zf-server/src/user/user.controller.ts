import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import {UserDTO} from "../common/user/UserDTO";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
  ) {
  }
  @Get()
  async findAll(): Promise<User[]> {
    return await this.service.findAll();
  }

  @Post()
  async create(@Body() dto: UserDTO): Promise<User> {
    return this.service.create(dto);
  }

}
