import { useMemo } from 'react';
import { Message } from '../../types/chat';

interface MessageGroup {
  id: string;
  messages: Message[];
  senderId: string;
  timestamp: string;
}

export const useMessageGroups = (messages: Message[]) => {
  const groups = useMemo(() => {
    if (!messages.length) return [];

    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    messages.forEach((message) => {
      const shouldStartNewGroup = !currentGroup ||
        currentGroup.senderId !== message.sender.id ||
        shouldSplitGroup(currentGroup.messages[currentGroup.messages.length - 1], message);

      if (shouldStartNewGroup) {
        currentGroup = {
          id: `group-${message.id}`,
          messages: [message],
          senderId: message.sender.id,
          timestamp: message.timestamp,
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  return {
    groups,
    getGroupKey: (group: MessageGroup) => group.id,
    isFirstGroup: (index: number) => index === groups.length - 1,
    isLastGroup: (index: number) => index === 0,
  };
};

const shouldSplitGroup = (lastMessage: Message, newMessage: Message) => {
  // Split if messages are more than 5 minutes apart
  const timeDiff = new Date(newMessage.timestamp).getTime() -
    new Date(lastMessage.timestamp).getTime();
  return Math.abs(timeDiff) > 5 * 60 * 1000;
};

export default useMessageGroups;