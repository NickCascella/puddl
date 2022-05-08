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
  timestamp: string;
}

export interface ChatroomDataInterface {
  joinedRoom: string;
  chatUsers: { username: string; online: boolean }[];
  username: string;
}

export interface priorMessages {
  allMessages: ReceivedMessage[];
}
