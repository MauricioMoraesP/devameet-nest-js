import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meet, MeetDocument } from './schemas/meet.schema';
import mongoose, { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CreateMeetDto } from './dto/createmeet.dto';
import { generateLink } from './helpers/linkgenerator.helper';
import { DeleteResult } from 'mongoose';
import { MeetObject, MeetObjectDocument } from './schemas/meetobject.schema';
import { UpdateMeetDto } from './dto/updatemeet.dto';
import { MeetMessagesHelper } from './helpers/meetmessages.helper';
@Injectable()
export class MeetService {
  private readonly logger = new Logger(MeetService.name);
  constructor(
    @InjectModel(Meet.name) private readonly model: Model<MeetDocument>,
    @InjectModel(MeetObject.name)
    private readonly objectModel: Model<MeetObjectDocument>,
    private readonly userService: UserService,
  ) {}

  async getMeetsByUser(userId: String) {
    this.logger.debug('getMeetsByUser - ' + userId);
    return await this.model.find({ user: userId });
  }

  async createMeet(userId: string, dto: CreateMeetDto) {
    this.logger.debug('createMeet - ' + userId);

    const user = await this.userService.getUserById(userId);

    const meet = {
      ...dto,
      user,
      link: generateLink(),
    };

    const createdMeet = new this.model(meet);
    return await createdMeet.save();
  }

  async deleteMeetByUser(userId: String, meetId: string) {
    this.logger.debug(`deleteMeetByUser - ${userId} - ${meetId}`);
    return await this.model.deleteOne({ user: userId, _id: meetId });
  }

  async getMeetObjects(meetId: string, userId: string) {
    this.logger.debug(`getMeetObjects - ${userId} - ${meetId}`);
    const user = await this.userService.getUserById(userId);
    const meet = await this.model.findOne({
      user,
      _id: meetId,
    });
    return await this.objectModel.find({
      meet,
    });
  }

  async update(meetId: string, userId: string, dto: UpdateMeetDto) {
    this.logger.debug(`update - ${userId} - ${meetId}`);
    const user = await this.userService.getUserById(userId);
    const meet = await this.model.findOne({
      user,
      _id: meetId,
    });
    if (!meet) {
      throw new BadRequestException(MeetMessagesHelper.UPDATE_MEET_NOT_FOUND);
    }

    meet.name = dto.name;
    meet.color = dto.color;
    await this.model.findByIdAndUpdate({ _id: meetId }, meet);

    await this.objectModel.deleteMany({ meet });

    let objectPayload;

    for (const element of dto.objects) {
      objectPayload = {
        meet,
        ...element,
      };

      await this.objectModel.create(objectPayload);
    }
  }
}
