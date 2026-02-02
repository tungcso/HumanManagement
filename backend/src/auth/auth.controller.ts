import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from './decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'duong@gmail.com',
        },
        password: {
          type: 'string',
          example: '123123',
        },
      },
      required: ['username', 'password'],
    },
  })
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
    });

    return { message: 'Đăng xuất thành công' };
  }
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới token' })
  refresh(@Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(res);
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin profile' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}
