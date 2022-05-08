import {
  Typography,
  Button,
  Box,
  keyframes,
  TextField,
  styled,
} from "@mui/material";
import { useState } from "react";
import Io from "../utils/socket";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import RoomSettingsScreen from "./RoomSettingsScreen";
import { InputAdornment } from "@mui/material";
import { ChatroomDataInterface, ReceivedMessage } from "../styles/globalTypes";
import myTheme from "../common/theme";

interface ChatroomComponentInterface {
  currentRoom: string;
  chatrooms: ChatroomDataInterface[];
  username: string;
  chatContainer: React.RefObject<HTMLDivElement>;
  showChatroom: boolean;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
  updateView: boolean;
  setUpdateView: (value: React.SetStateAction<boolean>) => void;
  allMessages: ReceivedMessage[];
  setAllMessages: React.Dispatch<React.SetStateAction<ReceivedMessage[]>>;
  showRoomSettings: boolean;
  setShowRoomSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const renderMessage = keyframes`
from {
  transform: translateY(40%);
  opacity: 0.5
},
to {transform: translateY(0%);
  opacity: 1 },
`;

const ChatBubble = styled("div")(({ theme }) => ({
  color: "white",
  backgroundColor: theme.palette.primary.main,
  padding: "0.5rem",
  borderRadius: 4,
  boxSizing: "border-box",
  marginBottom: "1rem",
  maxWidth: "70%",
  width: "fit-content",
  animation: `${renderMessage} 0.4s ease-out forwards`,
}));

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
  showRoomSettings,
  setShowRoomSettings,
}: ChatroomComponentInterface) => {
  const [message, setMessage] = useState("");

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

  const renderDate = (unixTime: number): string => {
    var date = new Date(unixTime);
    const hours = date.getHours();
    const hourFormat = hours < 13 ? hours : hours - 12;
    const minutes = date.getMinutes();
    const minuteFormat = minutes < 10 ? "0" + minutes : minutes;
    const formattedTime =
      hourFormat + ":" + minuteFormat + ` ${hours < 13 ? "am" : "pm"}`;

    return formattedTime;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="75%"
      padding="1rem 0 2rem"
      boxSizing="border-box"
      position="relative"
      sx={{
        border: `1px solid ${myTheme.palette.primary.light}`,
        borderLeft: "none",
        ["@media (max-width:850px)"]: {
          position: "absolute",
          width: "100%",
          height: "100%",
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
          boxSizing="border-box"
          padding="0 1rem"
          sx={{
            ["@media (max-width:850px)"]: {
              padding: "0 1rem 0 0",
            },
          }}
        >
          <Typography
            marginBottom="auto"
            variant="h4"
            component="h2"
            noWrap
            paddingRight="2rem"
          >
            {currentRoom}
          </Typography>{" "}
          <Button
            onClick={() => setShowRoomSettings(!showRoomSettings)}
            variant="contained"
            sx={{
              ["@media (max-width:500px)"]: {
                width: "0.3rem",
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                ["@media (max-width:500px)"]: {
                  display: "none",
                },
              }}
            >
              {showRoomSettings ? "Chat" : "Room details"}
            </Typography>
            <RoomPreferencesIcon
              sx={{
                marginLeft: "0.75rem",
                ["@media (max-width:500px)"]: {
                  marginLeft: "0",
                },
              }}
            />
          </Button>
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        height="98%"
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
          padding="1rem"
          boxSizing="border-box"
          ref={chatContainer}
          height="85%"
          maxHeight="85%"
          margin="1rem 0"
          sx={{
            scrollBehavior: "smooth",
            borderTop: `1px solid ${myTheme.palette.primary.light}`,
            borderBottom: `1px solid ${myTheme.palette.primary.light}`,
          }}
        >
          {allMessages.length &&
            allMessages
              .filter((data) => data.chatroom === currentRoom)
              .map((data) => (
                <Box key={data.timestamp}>
                  {data.username === "Puddl" ? (
                    <ServerMessage>{data.message}</ServerMessage>
                  ) : (
                    <ChatBubble
                      sx={{
                        marginLeft: data.username !== username ? "0" : "auto",
                        backgroundColor:
                          data.username === username ? "blue" : "green",
                      }}
                    >
                      {data.username !== username && (
                        <Typography>{data.username}</Typography>
                      )}
                      <Typography>{data.message}</Typography>
                      <Typography>
                        {renderDate(Number(data.timestamp))}
                      </Typography>
                    </ChatBubble>
                  )}
                </Box>
              ))}
        </Box>
        <Box display="flex" padding="0.5rem 1rem">
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
            variant="standard"
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
