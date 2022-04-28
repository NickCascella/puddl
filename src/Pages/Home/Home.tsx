import "./Home.scss";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";
import Socket from "../../utils/socket";
import { Typography, Button, Box, Container, TextField } from "@mui/material";

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
}

const Home = () => {
  const navigate = useNavigate();
  const chatContainer = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Global");
  const [createRoom, setCreateRoom] = useState("Global");
  const [joinedRoom, setJoinedRooms] = useState<string[]>([]);
  const [message, setMessage] = useState("");
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
    if (chatContainer.current) {
      console.log(chatContainer.current.scrollHeight);
      chatContainer.current.scrollTop =
        chatContainer.current.scrollHeight + 160;
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
              <Box onClick={() => setCurrentRoom(room)}>{room}</Box>
            ))}
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            minWidth="max-content"
            flexGrow={1}
            padding="1rem 1rem 2rem"
            sx={{ border: "2px solid black", borderLeft: "none" }}
          >
            <Typography marginBottom="auto" variant="h4" component="h2">
              Current room {currentRoom}
            </Typography>

            <Box
              height="100%"
              overflow="auto"
              padding="1rem 0"
              boxSizing="border-box"
              // display="flex"
              // flexDirection="column"
              // justifyContent="end"
              ref={chatContainer}
            >
              {allMessages.length
                ? allMessages
                    .filter((data) => data.chatroom === currentRoom)
                    .map((data) => (
                      <Box
                        sx={{
                          backgroundColor:
                            data.username === username
                              ? "yellow"
                              : "light blue",
                          textAlign:
                            data.username === username ? "right" : "left",
                          scrollBehavior: "smooth",
                        }}
                        marginTop="1rem"
                      >
                        {data.message} by {data.username}
                      </Box>
                    ))
                : null}
            </Box>
            <Box display="flex">
              <TextField
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                label="Message"
                sx={{ flexGrow: 1 }}
              />

              <Button
                onClick={() => {
                  Socket.emit("send-message", {
                    message: message,
                    username: username,
                    chatroom: currentRoom,
                  });
                  // if (chatContainer.current) {
                  //   chatContainer.current.scrollTop =
                  //     chatContainer.current.scrollHeight;
                  // }
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
