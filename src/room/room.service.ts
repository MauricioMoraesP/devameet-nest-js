import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { Meet, MeetDocument } from 'src/meet/schemas/meet.schema';
import {
  MeetObject,
  MeetObjectDocument,
} from 'src/meet/schemas/meetobject.schema';
import { Position, PostionDocument } from './schemas/postion.schema';
import { UserService } from 'src/user/user.service';
import { RoomMessagesHelper } from './helpers/roommessages';
import { UpdatePosition } from './dtos/updateposition.dto';
import { UpdateUserDto } from 'src/user/dtos/updateuser.dto';
import { TogleMuteDTO } from './dtos/toglemute.dto';

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name);
  constructor(
    @InjectModel(Meet.name) private readonly meetModel: Model<MeetDocument>,
    @InjectModel(MeetObject.name)
    private readonly objectModel: Model<MeetObjectDocument>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<PostionDocument>,
    private readonly userService: UserService,
  ) {}

  async getRoom(link: string) {
    this.logger.debug(`getRoom - ${link}`);
    const meet = await this._getMeet(link);

    const objects = await this.objectModel.find({ meet });

    return {
      link,
      name: meet.name,
      color: meet.color,
      objects,
    };
  }

  async _getMeet(link: string) {
    const meet = await this.meetModel.findOne({ link });
    if (!meet) {
      throw new BadRequestException(RoomMessagesHelper.JOIN_LINK_NOT_VALID);
    }
    return meet;
  }

  async listUserPositionByLink(link: string) {
    this.logger.debug(`ListUserPositionByLink - ${link}`);
    const meet = await this._getMeet(link);

    return await this.positionModel.find({ meet });
  }

  async deleteUserPosition(clientId: string): Promise<DeleteResult> {
    this.logger.debug(`deleteUserPosition - ${clientId}`);
    return await this.positionModel.deleteMany({ clientId });
  }

  async updateUserPosition(clientId: string, dto: UpdatePosition) {
    this.logger.debug(`updateUserPosition - ${dto.link}`);
    const meet = await this._getMeet(dto.link);
    const user = await this.userService.getUserById(dto.userId);
    if (!user) {
      throw new BadRequestException(RoomMessagesHelper.JOIN_USER_NOT_VALID);
    }

    const position = {
      ...dto,
      clientId,
      user,
      meet,
      name: user.name,
      avatar: user.avatar,
    };

    const userInRoom = await this.positionModel.find({ meet });

    const loogedUserInRoom = userInRoom.find((u) => {
      u.user.toString() === user._id.toString() || u.clientId === clientId;
    });
    if (loogedUserInRoom) {
      await this.positionModel.findByIdAndUpdate(
        { _id: loogedUserInRoom },
        position,
      );
    } else {
      if (userInRoom && userInRoom.length > 10) {
        throw new BadRequestException(RoomMessagesHelper.ROOM_MAX_USERS);
      }
      await this.positionModel.create(position);
    }
  }

  async updateUserMute(dto: TogleMuteDTO) {
    this.logger.debug(`updateUserMute - ${dto.link}- ${dto.userId}`);
    const meet = await this._getMeet(dto.link);
    const user = await this.userService.getUserById(dto.userId);
    await this.positionModel.updateMany({ user, meet }, { muted: dto.muted });
  }
}
