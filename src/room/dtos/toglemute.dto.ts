import { IsBoolean, IsString } from 'class-validator';
import { JoinRoomDto } from './joinroom.dto';
import { MeetMessagesHelper } from 'src/meet/helpers/meetmessages.helper';
import { RoomMessagesHelper } from '../helpers/roommessages';

export class TogleMuteDTO extends JoinRoomDto {
  @IsBoolean({ message: RoomMessagesHelper.MUTE_NOT_VALID })
  muted: boolean;
}
