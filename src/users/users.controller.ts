import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserWithProfileDto } from './dto/create-user-with-profile.dto';
import { User } from './entities/user.entity';
import { RequestWithUser } from 'src/auth/types/types';
import { QueryUsersDto } from './dto/query-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(
    @Body() dto: CreateUserWithProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<User> {
    if (typeof dto.profile === 'string') {
      dto.profile = JSON.parse(dto.profile);
    }

    return this.userService.createUser(dto, avatar);
  }

  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
     console.log('REQ USER:', req.user);
    return req.user; 
  }


  // ✅ GET /users/:id - Lấy thông tin user theo ID
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  // ✅ GET /users?search=abc&page=1&limit=10 - Lấy danh sách user (có phân trang + tìm kiếm)
  @Get()
   async getAllUsers(@Query() query: QueryUsersDto) {
    return this.userService.getAllUsers(query);
  }

  // ✅ PATCH /users/:id - Cập nhật email hoặc mật khẩu
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  // ✅ DELETE /users/:id - Người dùng tự xoá
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }

  // ✅ DELETE /users/admin/:id - Admin xoá user
  @Delete('admin/:id')
  async deleteUserByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUserByAdmin(id);
  }

}
