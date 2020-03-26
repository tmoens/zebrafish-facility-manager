import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import {UserDTO} from "../common/user/UserDTO";

@UseInterceptors(ClassSerializerInterceptor)
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
