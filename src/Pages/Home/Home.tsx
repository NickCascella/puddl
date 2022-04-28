import "./Home.scss";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";
import Socket from "../../utils/socket";
import {
  Typography,
  Button,
  Box,
  Container,
  TextField,
  styled,
} from "@mui/material";

interface Token {
  user: string;
  iat: number;
  exp: number;
}

interface NoToken {
  error: string;
}

interface ReceivedMessage {
  message: string;
  username: string;
  chatroom: string;
  timestamp: string;
}

const ChatBubbleWrapper = styled("div")({
  position: "relative",
});

const ChatBubble = styled("div")({
  color: "white",
  backgroundColor: "blue",
  padding: "1rem",
  borderRadius: 4,
  position: "relative",
  marginBottom: "1rem",
  maxWidth: "70%",
  width: "max-content",
  // ":after": {
  //   content: "''",
  //   top: "1px",
  //   transform: "scaleX(-1)",
  //   position: "absolute",
  //   border: "0px solid",
  //   display: "block",
  //   width: "20px",
  //   height: "15px",
  //   backgroundColor: "transparent",
  //   borderBottomLeftRadius: "50%",
  //   borderBottomRightRadius: "50%",
  //   boxShadow: "-21px 9px 0px 8px pink",
  // },
});

const ChatBubbleTail = styled("div")({
  color: "yellow",
  backgroundColor: "blue",
  width: "max-content",
  padding: 8,
  borderRadius: 4,
});

const Home = () => {
  const navigate = useNavigate();
  const chatContainer = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Global");
  const [createRoom, setCreateRoom] = useState("Global");
  const [joinedRoom, setJoinedRooms] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [updateView, setUpdateView] = useState(true);
  const [allMessages, setAllMessages] = useState<Array<ReceivedMessage>>([]);

  useEffect(() => {
    const verifyUser = async () => {
      const token = sessionStorage.getItem("token");
      const response: Token | NoToken = await requests.verifyToken(token);
      if ("error" in response) {
        navigate("/login");
        return;
      }
      setUsername(response.user);
      joinRoom();
    };
    verifyUser();
  }, []);

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [updateView]);

  const joinRoom = () => {
    Socket.emit("join-room", { chatroom: createRoom });
    setCurrentRoom(createRoom);
    setCreateRoom("");
    Socket.on("joined-room", (data) => {
      let joinedRoomsNew = [...joinedRoom];
      joinedRoomsNew.push(data.joinedRoom);
      setJoinedRooms(joinedRoomsNew);
    });
  };

  Socket.on("display-message", (data: ReceivedMessage) => {
    let chatMessages = [...allMessages];
    chatMessages.push(data);
    setAllMessages(chatMessages);
    if (data.chatroom === currentRoom) {
      setUpdateView(!updateView);
    }
  });

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Container>
        <Box display="flex" height="100vh">
          <Box
            display="flex"
            flexDirection="column"
            minWidth="max-content"
            width="20%"
            sx={{ border: "2px solid black" }}
            padding="1rem 1rem"
            boxSizing="border-box"
          >
            <Box display="flex" justifyContent="space-between">
              {/* <Button
                variant="contained"
                onClick={() => {
                  sessionStorage.removeItem("token");
                  navigate("/login");
                }}
                >
                Logout
              </Button> */}
            </Box>

            <Typography variant="h4" component="h2">
              Join Room
            </Typography>
            <TextField
              label="Room ID"
              value={createRoom}
              onChange={(e) => setCreateRoom(e.target.value)}
            />
            <Button variant="contained" onClick={joinRoom}>
              Join
            </Button>
            <Typography variant="h4" component="h2">
              Chats
            </Typography>
            {joinedRoom.map((room) => (
              <Box
                onClick={() => {
                  setCurrentRoom(room);
                  setUpdateView(!updateView);
                }}
              >
                {room}
              </Box>
            ))}
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            // minWidth="max-content"
            width="80%"
            padding="1rem 1rem 2rem"
            sx={{ border: "2px solid black", borderLeft: "none" }}
          >
            <Typography marginBottom="auto" variant="h4" component="h2">
              Current room {currentRoom}
            </Typography>

            <Box
              overflow="auto"
              padding="1rem 0"
              boxSizing="border-box"
              ref={chatContainer}
              sx={{
                scrollBehavior: "smooth",
              }}
            >
              {allMessages.length
                ? allMessages
                    .filter((data) => data.chatroom === currentRoom)
                    .map((data) => (
                      <ChatBubble key={data.timestamp}>
                        {" "}
                        <Typography>{data.username}</Typography>
                        <Typography sx={{ wordBreak: "break-word" }}>
                          {data.message}
                        </Typography>
                        <Typography>
                          {" "}
                          {new Date(
                            parseInt(data.timestamp)
                          ).toLocaleTimeString()}
                        </Typography>
                      </ChatBubble>
                      // <Box
                      //   sx={{
                      //     backgroundColor:
                      //       data.username === username
                      //         ? "yellow"
                      //         : "light blue",
                      //     textAlign:
                      //       data.username === username ? "right" : "left",
                      //   }}
                      //   marginTop="1rem"
                      // >
                      //   {data.message} by {data.username}
                      // </Box>
                    ))
                : null}
            </Box>
            <Box display="flex">
              <TextField
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                label="Message"
                sx={{ flexGrow: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    Socket.emit("send-message", {
                      message: message,
                      username: username,
                      chatroom: currentRoom,
                      timestamp: JSON.stringify(Date.now()),
                    });
                  }
                }}
              />

              <Button
                onClick={() => {
                  Socket.emit("send-message", {
                    message: message,
                    username: username,
                    chatroom: currentRoom,
                    timestamp: JSON.stringify(Date.now()),
                  });
                }}
                variant="contained"
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Home;
