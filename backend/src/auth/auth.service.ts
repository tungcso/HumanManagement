import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Record<string, unknown> | null> {
    const user = await this.usersService.findByUsername(username);

    if (
      user &&
      (await this.usersService.validatePassword(password, user.password))
    ) {
      const { password: _, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(user: any, res: Response) {
    const payload = {
      username: user.username,
      sub: user._id,
      role: user.role,
    };

    const refreshToken = this.jwtService.sign(
      {
        username: user.username,
        sub: user._id,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        hoTen: user.hoTen,
        email: user.email,
        role: user.role,
      },
    };
  }

  refresh(res: Response) {
    try {
      const refreshToken = res.req.cookies['refresh_token'];

      const verified = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const payload = {
        username: verified.username,
        sub: verified.sub,
        role: verified.role,
      };

      const accessToken = this.jwtService.sign(payload);
      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.CAN_BO,
    });

    const { password: _, ...result } = (user as any).toObject();
    return result;
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
