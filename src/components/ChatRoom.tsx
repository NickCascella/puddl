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

import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import RoomSettingsScreen from "./RoomSettingsScreen";

import { ChatroomDataInterface, ReceivedMessage } from "../styles/globalTypes";
import LoadingAnimation from "../components/Loading";

interface ChatroomComponentInterface {
  currentRoom: string;
  chatrooms: ChatroomDataInterface[];
  username: string;
  chatContainer: React.RefObject<HTMLDivElement>;
  showChatroom: boolean;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
  allMessages: ReceivedMessage[];
  showRoomSettings: boolean;
  setShowRoomSettings: React.Dispatch<React.SetStateAction<boolean>>;
  onScroll: () => void;
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
  padding: "0.5rem",
  borderRadius: 4,
  boxSizing: "border-box",
  marginBottom: "1.5rem",
  maxWidth: "70%",
  width: "fit-content",
  animation: `${renderMessage} 0.4s ease-out forwards`,
  position: "relative",
  wordWrap: "break-word",
}));

const ServerMessage = styled("div")({
  color: "white",
  backgroundColor: "grey",
  padding: "0.5rem",
  borderRadius: 4,
  margin: "0 auto",
  marginBottom: "1rem",
  textAlign: "center",
  maxWidth: "70%",
  width: "max-content",
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
  chatrooms,
  allMessages,
  showRoomSettings,
  setShowRoomSettings,
  onScroll,
}: ChatroomComponentInterface) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    Io.socket.emit("send-message", {
      message: message,
      username: username,
      chatroom: currentRoom,
      timestamp: Date.now(),
    });
    setMessage("");
  };

  const renderDate = (unixTime: number): string => {
    const date = new Date(unixTime);
    const hours = date.getHours();
    const hourFormat = hours < 13 ? hours : hours - 12;
    const minutes = date.getMinutes();
    const minuteFormat = minutes < 10 ? "0" + minutes : minutes;
    const formattedTime =
      hourFormat + ":" + minuteFormat + ` ${hours < 13 ? "am" : "pm"}`;

    return formattedTime;
  };

  const renderChatMessages = () => {
    const specificChatMessages = allMessages
      .filter((data: ReceivedMessage) => data.chatroom === currentRoom)
      .sort((a, b) => a.timestamp - b.timestamp);

    return specificChatMessages.map((data: ReceivedMessage, i) => {
      let datedMessage = null;

      if (i > 0) {
        if (
          specificChatMessages[i].timestamp -
            specificChatMessages[i - 1].timestamp >=
          86400000
        ) {
          const date = new Date(specificChatMessages[i].timestamp);
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const month = months[date.getMonth()];
          const day = date.getDate();
          datedMessage = {
            chatroom: data.chatroom,
            message: "New message on a new day",
            timestamp: `${month} ${day}`,
            username: "Puddl",
          };
        }
      }
      return (
        <Box key={data.timestamp}>
          {data.username === "Puddl" ? (
            <>
              {datedMessage && (
                <ServerMessage>{datedMessage.timestamp}</ServerMessage>
              )}
              <ServerMessage>{data.message}</ServerMessage>
            </>
          ) : (
            <>
              {datedMessage && (
                <ServerMessage>{datedMessage.timestamp}</ServerMessage>
              )}
              <ChatBubble
                sx={{
                  marginLeft: data.username !== username ? "0" : "auto",
                  backgroundColor:
                    data.username === username
                      ? "primary.dark"
                      : "secondary.dark",
                  "&:before": {
                    content: "''",
                    width: "0px",
                    height: "0px",
                    position: "absolute",
                    borderLeft: "10px solid",
                    borderTop: "10px solid",
                    borderColor:
                      data.username === username
                        ? "primary.dark"
                        : "secondary.dark",
                    borderRight: "10px solid transparent",
                    borderBottom: "10px solid transparent",
                    right:
                      data.username === username ? "0px" : "calc(100% - 20px)",
                    bottom: "-16px",
                    transform: data.username === username ? "scaleX(-1)" : "",
                  },
                }}
              >
                {data.username !== username && (
                  <Typography sx={{ fontSize: "0.85rem" }}>
                    {data.username}
                  </Typography>
                )}
                <Typography>{data.message}</Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    width: "max-content",
                    margin:
                      data.username === username ? "0 0 0 auto" : "0 auto 0 0",
                  }}
                >
                  {renderDate(data.timestamp)}
                </Typography>
              </ChatBubble>
            </>
          )}
        </Box>
      );
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="75%"
      padding="1rem 0 1rem"
      boxSizing="border-box"
      position="relative"
      sx={{
        border: `1px solid black`,
        borderColor: "primary.light",
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
            endIcon={<RoomPreferencesIcon />}
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
            {/* <RoomPreferencesIcon
              sx={{
                marginLeft: "0.75rem",

                ["@media (max-width:500px)"]: {
                  marginLeft: "0",
                },
              }}
            /> */}
          </Button>
        </Box>
      </Box>
      {showRoomSettings && (
        <RoomSettingsScreen
          chatrooms={chatrooms}
          currentRoom={currentRoom}
          username={username}
          setShowChatroom={setShowChatroom}
          setShowRoomSettings={setShowRoomSettings}
        />
      )}
      <Box
        overflow="auto"
        padding="1rem"
        boxSizing="border-box"
        height="100%"
        ref={chatContainer}
        margin="1rem 0"
        sx={{
          borderTop: `1px solid black`,
          borderBottom: `1px solid black`,
          borderColor: "primary.light",
        }}
        onScroll={onScroll}
      >
        {allMessages.length && renderChatMessages()}

        {!allMessages.length && (
          <Box
            width="100%"
            marginTop="5rem"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {" "}
            <LoadingAnimation />{" "}
          </Box>
        )}
      </Box>
      <Box display="flex" padding="0.5rem 1rem">
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value.trim())}
          label="Message"
          fullWidth={true}
          name="Message"
          sx={{
            marginRight: "2rem",
            border: "1px solid primary.main",
            height: "100%",
          }}
          multiline={true}
          onKeyDown={(e) => {
            if (e.key === "Enter" && chatContainer.current) {
              chatContainer.current.scrollTop =
                chatContainer.current.scrollHeight;
            }
          }}
          minRows={1}
          maxRows={5}
          variant="outlined"
        />

        <Button
          onClick={() => {
            if (message.trim().length > 0) {
              sendMessage();
            }
          }}
          sx={{
            height: "max-content",
            margin: "auto 0",
          }}
          variant="contained"
          endIcon={<SendOutlinedIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chatroom;
