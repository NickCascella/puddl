import {
  Typography,
  Button,
  Box,
  keyframes,
  TextField,
  styled,
} from "@mui/material";
import { useState } from "react";
import Socket from "../utils/socket";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

interface ReceivedMessage {
  message: string;
  username: string;
  chatroom: string;
  timestamp: string;
}

interface ChatroomInterface {
  currentRoom: string;
  username: string;
  chatContainer: React.RefObject<HTMLDivElement>;
  showChatroom: boolean;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
  updateView: boolean;
  setUpdateView: (value: React.SetStateAction<boolean>) => void;
}

const ChatBubble = styled("div")({
  color: "white",
  backgroundColor: "blue",
  padding: "0.5rem",
  borderRadius: 4,
  position: "relative",
  marginBottom: "1rem",
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
  updateView,
  setUpdateView,
}: ChatroomInterface) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<Array<ReceivedMessage>>([]);

  Socket.on("display-message", (data: ReceivedMessage) => {
    let chatMessages = [...allMessages];
    chatMessages.push(data);
    setAllMessages(chatMessages);
    if (data.chatroom === currentRoom) {
      setUpdateView(!updateView);
    }
  });

  const sendMessage = () => {
    Socket.emit("send-message", {
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
      justifyContent="flex-end"
      width="75%"
      padding="1rem 1rem 2rem"
      boxSizing="border-box"
      sx={{
        border: "2px solid black",
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
          onClick={() => setShowChatroom(!showChatroom)}
          startIcon={<ArrowBackIcon />}
          sx={{
            display: "none",
            padding: "0",
            ["@media (max-width:850px)"]: {
              display: "inline-flex",
            },
          }}
        ></Button>
        <Typography marginBottom="auto" variant="h4" component="h2">
          {currentRoom}
        </Typography>
      </Box>
      <Box
        overflow="auto"
        padding="1rem 0"
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
                <ChatBubble
                  key={data.timestamp}
                  sx={{
                    marginLeft: data.username === username ? "0" : "auto",
                    backgroundColor:
                      data.username === username ? "blue" : "green",
                  }}
                >
                  {" "}
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
                    {" "}
                    {new Date(parseInt(data.timestamp)).toLocaleTimeString()}
                  </Typography>
                </ChatBubble>
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
  );
};

export default Chatroom;
