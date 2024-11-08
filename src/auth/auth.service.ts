import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { MessagesHelper } from './helpers/messages.helper';
import { RegisterDTO } from 'src/user/dtos/register.dto';
import { UserService } from 'src/user/user.service';
import { UserMessagesHelper } from 'src/user/helpers/messages.helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    this.logger.debug('login - started');

    const user = await this.userService.getUerByLoginPassword(
      dto.login,
      dto.password,
    );
    if (user == null) {
      throw new BadRequestException(
        MessagesHelper.AUTH_PASSWORD_OR_LOGIN_NOT_FOUNT,
      );
    }

    const tokenPayload = { email: user.email, sub: user._id };
    return {
      email: user.email,
      name: user.name,
      token: this.jwtService.sign(tokenPayload, {
        secret: process.env.USER_CYPHER_SECRET_KEY,
      }),
    };
  }

  async register(dto: RegisterDTO) {
    this.logger.debug('register - started');
    if (await this.userService.existsEmail(dto.email)) {
      throw new BadRequestException(
        UserMessagesHelper.REGISTER_EXIST_EMAIL_ACCOUNT,
      );
    }
    await this.userService.create(dto);
  }
}
