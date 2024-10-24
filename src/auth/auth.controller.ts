import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDTO } from 'src/user/dtos/register.dto';
import { isPublic } from './decorators/ispublic.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @isPublic()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @isPublic()
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }
}
