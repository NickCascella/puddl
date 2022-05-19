export interface Token {
  user: string;
  iat: number;
  exp: number;
}

export interface NoToken {
  error: string;
}

export interface ReceivedMessage {
  message: string;
  username: string;
  chatroom: string;
  timestamp: number;
}

export interface ChatroomDataInterface {
  joinedRoom: string;
  chatUsers: { username: string; online: boolean }[];
  username: string;
}

export interface PriorMessages {
  allMessages: ReceivedMessage[];
}

export interface DynamicKeyIntegerPair {
  [key: string]: number;
}
export interface UserChatroomPair {
  username: string;
  chatroom: string;
}
