import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { MeetService } from './meet.service';
import { userInfo } from 'os';
import { GetMeetDto } from './dto/getmeet.dto';
import { CreateMeetDto } from './dto/createmeet.dto';
import { UpdateMeetDto } from './dto/updatemeet.dto';

@Controller('meet')
export class MeetController {
  private readonly logger = new Logger(MeetService.name);

  constructor(private readonly service: MeetService) {}

  @Get()
  async getUser(@Request() req) {
    const { userId } = req?.user;

    const result = await this.service.getMeetsByUser(userId);
    console.log(result);
    return result.map(
      (m) =>
        ({
          id: m._id.toString(),
          name: m.name,
          color: m.color,
          link: m.link,
        }) as GetMeetDto,
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createMeet(@Request() req, @Body() dto: CreateMeetDto) {
    const { userId } = req?.user;
    await this.service.createMeet(userId, dto);
  }

  @Delete(':id')
  async deleteMeet(@Request() req, @Param() params) {
    const { userId } = req?.user;
    const { id } = params;

    await this.service.deleteMeetByUser(userId, id);
  }

  @Get('objects/:id')
  async getObjectsByMeetId(@Request() req, @Param() params) {
    const { userId } = req?.user;
    const { id } = params;

    return await this.service.getMeetObjects(id, userId);
  }

  @Put(':id')
  async updateMeet(
    @Request() req,
    @Param() params,
    @Body() dto: UpdateMeetDto,
  ) {
    const { userId } = req?.user;
    const { id } = params;

    await this.service.update(id, userId, dto);
  }
}
