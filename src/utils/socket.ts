import { io } from "socket.io-client";
// const socket = io("ws://localhost:8080");
class Io {
  socket: any;
  constructor(socket: any) {
    this.socket = socket;
  }
}
export default new Io(io("ws://localhost:8080"));
