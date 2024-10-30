import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MeetModule } from 'src/meet/meet.module';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PostionSchema } from './schemas/postion.schema';

@Module({
  imports: [
    MeetModule,
    UserModule,
    MongooseModule.forFeature([{ name: Position.name, schema: PostionSchema }]),
  ],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
