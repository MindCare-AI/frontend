import { BaseConversation, BaseMessage } from './commons';

export interface GroupMessage extends BaseMessage {
  conversation: string | number;
}

export interface GroupConversation extends BaseConversation {
  is_group: true;
  name: string;
  description: string;
  moderators: Array<string | number>;
  is_private: boolean;
  archived: boolean;
  archive_date: string | null;
  messages?: GroupMessage[];
}
