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
  const [joinedRoom, setJoinedRooms] = useState<
    { joinedRoom: string; chatUsers: string[] }[]
  >([]);
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
      Socket.connect();
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

  const joinRoom = async () => {
    if (
      createRoom.length < 1 ||
      createRoom.length > 15 ||
      !username ||
      joinedRoom.filter((room) => room.joinedRoom === createRoom).length
    ) {
      return;
    }
    Socket.emit("join-room", {
      chatroom: createRoom,
      username: username,
      timestamp: JSON.stringify(Date.now()),
    });
  };

  Socket.on("joined-room", (data) => {
    let joinedRoomsNew = [...joinedRoom];
    let checkUpdateGroup = joinedRoomsNew.filter(
      (room) => room.joinedRoom === data.joinedRoom
    );
    if (checkUpdateGroup.length) {
      joinedRoomsNew = joinedRoomsNew.map((room) =>
        room.joinedRoom === data.joinedRoom ? data : room
      );
    } else {
      joinedRoomsNew.push(data);
    }
    setJoinedRooms(joinedRoomsNew);
    setCurrentRoom(data.joinedRoom);
    setCreateRoom("");
  });

  Socket.on("left-chat", (data) => {
    let myChats = joinedRoom.filter(
      (room) => room.joinedRoom !== data.chatroom
    );
    setCurrentRoom("Global");
    setJoinedRooms(myChats);
  });

  Socket.on("other-user-left", (data) => {
    let myChats = [...joinedRoom];
    let chatIndex = myChats.findIndex(
      (room) => room.joinedRoom === data.joinedRoom
    );
    let updatedChat = myChats.find((room) => room.joinedRoom === data.chatroom);
    if (updatedChat) {
      updatedChat.chatUsers = updatedChat.chatUsers.filter(
        (user) => user !== data.username
      );
      myChats[chatIndex] = updatedChat;
      setJoinedRooms(myChats);
      setCurrentRoom(data.chatroom);
    }
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
          userList={joinedRoom}
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
