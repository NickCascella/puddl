import { Typography, Button } from "@mui/material";
import { Box } from "@mui/system";
// import socket from "../utils/socket";
import Io from "../utils/socket";

interface RoomSettingsScreenInterface {
  currentRoom: string;
  chatrooms: {
    joinedRoom: string;
    chatUsers: { username: string; online: boolean }[];
  }[];
  username: string;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
}

const RoomSettingsScreen = ({
  chatrooms,
  currentRoom,
  username,
  setShowChatroom,
}: RoomSettingsScreenInterface) => {
  const leaveChat = () => {
    Io.socket.emit("leave-chat", {
      username: username,
      chatroom: currentRoom,
    });
    setShowChatroom(false);
  };

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      top={0}
      left={0}
      sx={{
        background: "white",
        zIndex: 2,
      }}
    >
      <Typography>Users:</Typography>
      {chatrooms.length &&
        currentRoom &&
        chatrooms
          .filter((room) => room.joinedRoom === currentRoom)[0]
          .chatUsers.map((user) => (
            <Box key={user.username} display="flex">
              <Typography marginRight="1rem">
                {user.online ? "Online" : "Offline"}
              </Typography>
              <Typography>{user.username}</Typography>
            </Box>
          ))}
      {currentRoom !== "Global" && (
        <Button onClick={leaveChat}>Leave Chat</Button>
      )}
    </Box>
  );
};

export default RoomSettingsScreen;
