import { Typography, Button } from "@mui/material";
import { Box } from "@mui/system";
import socket from "../utils/socket";

interface RoomSettingsScreenInterface {
  currentRoom: string;
  userList: { joinedRoom: string; chatUsers: string[] }[];
  username: string;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
}

const RoomSettingsScreen = ({
  userList,
  currentRoom,
  username,
  setShowChatroom,
}: RoomSettingsScreenInterface) => {
  const leaveChat = () => {
    socket.emit("leave-chat", {
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
      {userList.length &&
        currentRoom &&
        userList
          .filter((room) => room.joinedRoom === currentRoom)[0]
          .chatUsers.map((user) => <Typography key={user}>{user}</Typography>)}
      {currentRoom !== "Global" && (
        <Button onClick={leaveChat}>Leave Chat</Button>
      )}
    </Box>
  );
};

export default RoomSettingsScreen;
