import {
  Typography,
  Button,
  Box,
  keyframes,
  TextField,
  styled,
} from "@mui/material";
import { useState } from "react";
// import Socket from "../utils/socket";
import Io from "../utils/socket";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import RoomSettingsScreen from "./RoomSettingsScreen";
import { InputAdornment } from "@mui/material";

interface ReceivedMessage {
  message: string;
  username: string;
  chatroom: string;
  timestamp: string;
}

interface ChatroomInterface {
  currentRoom: string;
  chatrooms: {
    joinedRoom: string;
    chatUsers: { username: string; online: boolean }[];
  }[];
  username: string;
  chatContainer: React.RefObject<HTMLDivElement>;
  showChatroom: boolean;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
  updateView: boolean;
  setUpdateView: (value: React.SetStateAction<boolean>) => void;
  allMessages: ReceivedMessage[];
  setAllMessages: React.Dispatch<React.SetStateAction<ReceivedMessage[]>>;
}

const ChatBubble = styled("div")({
  color: "white",
  backgroundColor: "blue",
  padding: "0.5rem",
  borderRadius: 4,
  marginBottom: "1rem",
  maxWidth: "70%",
  width: "max-content",
});

const ServerMessage = styled("div")({
  color: "white",
  backgroundColor: "grey",
  padding: "0.5rem",
  borderRadius: 4,
  margin: "0 auto",
  marginBottom: "1rem",
  textAlign: "center",
  width: "70%",
});

const displayChatroom = keyframes`
from {transform: translateX(100%)},
to {transform: translateX(0%)},
`;

const hideChatroom = keyframes`
from {transform: translateX(0%)},
to {transform: translateX(100%)},
`;

const Chatroom = ({
  currentRoom,
  username,
  chatContainer,
  showChatroom,
  setShowChatroom,
  updateView,
  setUpdateView,
  chatrooms,
  allMessages,
  setAllMessages,
}: ChatroomInterface) => {
  const [message, setMessage] = useState("");
  const [showRoomSettings, setShowRoomSettings] = useState(false);

  Io.socket.on("display-message", (data: ReceivedMessage) => {
    let chatMessages = [...allMessages];
    chatMessages.push(data);
    setAllMessages(chatMessages);
    if (data.chatroom === currentRoom) {
      setUpdateView(!updateView);
    }
  });

  const sendMessage = () => {
    Io.socket.emit("send-message", {
      message: message,
      username: username,
      chatroom: currentRoom,
      timestamp: JSON.stringify(Date.now()),
    });
    setMessage("");
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="75%"
      padding="1rem 1rem 2rem"
      boxSizing="border-box"
      position="relative"
      sx={{
        border: "2px solid rgb(202, 203, 204)",
        borderLeft: "none",
        ["@media (max-width:850px)"]: {
          position: "absolute",
          width: "100%",
          height: "100%",
          maxHeight: "100vh",
          transform: "translateX(100%)",
          animation: `${
            showChatroom ? displayChatroom : hideChatroom
          } 0.2s linear forwards`,
        },
      }}
    >
      <Box display="flex">
        <Button
          onClick={() => {
            setShowChatroom(!showChatroom);
            setShowRoomSettings(false);
          }}
          startIcon={<ArrowBackIcon />}
          sx={{
            display: "none",
            padding: "0",
            ["@media (max-width:850px)"]: {
              display: "inline-flex",
            },
          }}
        ></Button>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography marginBottom="auto" variant="h4" component="h2">
            {currentRoom}
          </Typography>{" "}
          <Button
            onClick={() => setShowRoomSettings(!showRoomSettings)}
            variant="contained"
            endIcon={<RoomPreferencesIcon />}
          >
            Room settings
          </Button>
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        width="100%"
        height="100%"
        position="relative"
      >
        {showRoomSettings && (
          <RoomSettingsScreen
            chatrooms={chatrooms}
            currentRoom={currentRoom}
            username={username}
            setShowChatroom={setShowChatroom}
          />
        )}
        <Box
          overflow="auto"
          padding="0.5rem 0"
          boxSizing="border-box"
          ref={chatContainer}
          height="80%"
          sx={{
            scrollBehavior: "smooth",
            margin: "auto 0",
          }}
        >
          {allMessages.length
            ? allMessages
                .filter((data) => data.chatroom === currentRoom)
                .map((data) => (
                  <Box key={data.timestamp}>
                    {data.username === "Puddl" ? (
                      <ServerMessage>{data.message}</ServerMessage>
                    ) : (
                      <ChatBubble
                        sx={{
                          marginLeft: data.username === username ? "0" : "auto",
                          backgroundColor:
                            data.username === username ? "blue" : "green",
                        }}
                      >
                        <Typography>{data.username}</Typography>
                        <Typography
                          sx={{
                            wordBreak: "break-word",
                            wordWrap: "break-word",
                          }}
                        >
                          {data.message}
                        </Typography>
                        <Typography>
                          {new Date(
                            parseInt(data.timestamp)
                          ).toLocaleTimeString()}
                        </Typography>
                      </ChatBubble>
                    )}
                  </Box>
                ))
            : null}
        </Box>
        <Box display="flex">
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            label="Message"
            fullWidth={true}
            sx={{ marginRight: "2rem" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreateOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            onClick={() => {
              sendMessage();
            }}
            variant="contained"
            endIcon={<SendOutlinedIcon />}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Chatroom;
