import { Typography, Button } from "@mui/material";
import { Box } from "@mui/system";
import Io from "../utils/socket";
import myTheme from "../common/theme";

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
      boxSizing="border-box"
      top={58}
      left={0}
      margin="1rem 0"
      padding="0 1rem"
      sx={{
        borderTop: `1px solid ${myTheme.palette.primary.light}`,
        background: "white",
        zIndex: 2,
        ["@media (max-width:850px)"]: {
          padding: "0 4rem",
        },
      }}
    >
      <Typography
        marginBottom="auto"
        variant="h5"
        component="h3"
        marginTop="0.5rem"
      >
        Users
      </Typography>
      {chatrooms.length &&
        currentRoom &&
        chatrooms
          .filter((room) => room.joinedRoom === currentRoom)[0]
          .chatUsers.sort((a, b) =>
            a.online === b.online ? 0 : a.online ? -1 : 1
          )
          .map((user) => {
            if (user.username !== "Puddl") {
              return (
                <Box key={user.username} display="flex" marginLeft="1rem">
                  <Typography
                    marginRight="1rem"
                    sx={{
                      color: user.online ? "green" : "red",
                    }}
                  >
                    {user.online ? "Online" : "Offline"}
                  </Typography>
                  <Typography>{user.username}</Typography>
                </Box>
              );
            }
          })}
      {currentRoom !== "Global" && (
        <Button
          onClick={leaveChat}
          fullWidth
          variant="contained"
          sx={{ marginTop: "1rem" }}
        >
          Leave Chat
        </Button>
      )}
    </Box>
  );
};

export default RoomSettingsScreen;
