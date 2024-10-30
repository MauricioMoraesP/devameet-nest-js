import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDTO } from './dtos/register.dto';
import * as CryptoJs from 'crypto-js';
import { UpdateUserDto } from './dtos/updateuser.dto';
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

  async getUerByLoginPassword(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = (await this.UserModel.findOne({ email })) as UserDocument;

    if (user) {
      const bytes = CryptoJs.AES.decrypt(
        user.password,
        process.env.USER_CYPHER_SECRET_KEY,
      );

      const savedPassword = bytes.toString(CryptoJs.enc.Utf8);

      if (password == savedPassword) {
        return user;
      }
    } else {
      return null;
    }
  }

  async getUserById(id: string) {
    return await this.UserModel.findById(id);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return await this.UserModel.findByIdAndUpdate(id, dto);
  }
}
