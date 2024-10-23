import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDTO } from './dtos/register.dto';
import * as CryptoJs from 'crypto-js';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
  ) {}

  async create(dto: RegisterDTO) {
    dto.password = CryptoJs.AES.encrypt(
      dto.password,
      process.env.USER_CYPHER_SECRET_KEY,
    );
    const createdUser = new this.UserModel(dto);
    await createdUser.save();
  }

  async existsEmail(email: string): Promise<boolean> {
    const result = await this.UserModel.findOne({ email });
    if (result) {
      return true;
    }
    return false;
  }
}
