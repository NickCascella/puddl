import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";
import Socket from "../../utils/socket";
import { Box } from "@mui/material";
import Nav from "../../components/Nav";
import Chatroom from "../../components/ChatRoom";

interface Token {
  user: string;
  iat: number;
  exp: number;
}

interface NoToken {
  error: string;
}

const Home = () => {
  const navigate = useNavigate();
  const chatContainer = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Global");
  const [createRoom, setCreateRoom] = useState("Global");
  const [chatUserTracker, setChatUserTracker] = useState([]);
  const [joinedRoom, setJoinedRooms] = useState<string[]>([]);
  const [updateView, setUpdateView] = useState(true);
  const [showChatroom, setShowChatroom] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      const token = sessionStorage.getItem("token");
      const response: Token | NoToken = await requests.verifyToken(token);
      if ("error" in response) {
        navigate("/login");
        return;
      }
      setUsername(response.user);
    };
    verifyUser();
  }, []);

  useEffect(() => {
    joinRoom();
  }, [username]);

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [updateView]);

  //functions

  const joinRoom = () => {
    if (
      createRoom.length < 1 ||
      createRoom.length > 15 ||
      joinedRoom.includes(createRoom) ||
      !username
    ) {
      return;
    }
    Socket.emit("join-room", { chatroom: createRoom, username: username });
    setCurrentRoom(createRoom);
    setCreateRoom("");
  };
  Socket.on("joined-room", (data) => {
    let joinedRoomsNew = [...joinedRoom];
    joinedRoomsNew.push(data.joinedRoom);
    setJoinedRooms(joinedRoomsNew);
  });

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Box
        display="flex"
        height="100vh"
        maxWidth="1400px"
        width="100%"
        overflow="hidden"
        position="relative"
      >
        <Nav
          createRoom={createRoom}
          setCreateRoom={setCreateRoom}
          setCurrentRoom={setCurrentRoom}
          joinedRoom={joinedRoom}
          updateView={updateView}
          setUpdateView={setUpdateView}
          setShowChatroom={setShowChatroom}
          showChatroom={showChatroom}
          joinRoom={joinRoom}
        />
        <Chatroom
          currentRoom={currentRoom}
          username={username}
          chatContainer={chatContainer}
          showChatroom={showChatroom}
          setShowChatroom={setShowChatroom}
          updateView={updateView}
          setUpdateView={setUpdateView}
        />
      </Box>
    </Box>
  );
};

export default Home;
