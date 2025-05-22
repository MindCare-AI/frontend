import { BaseConversation, BaseMessage, OtherParticipant } from './commons';

export interface OneToOneMessage extends BaseMessage {
  conversation: string | number;
}

export interface OneToOneConversation extends BaseConversation {
  is_group: false;
  other_participant: OtherParticipant;
  other_user_name: string;
  messages?: OneToOneMessage[];
}
