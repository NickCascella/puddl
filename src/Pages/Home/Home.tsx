import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";
// import Socket from "../../utils/socket";
import Io from "../../utils/socket";
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

interface ReceivedMessage {
  message: string;
  username: string;
  chatroom: string;
  timestamp: string;
}

const Home = () => {
  const navigate = useNavigate();
  const chatContainer = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Global");
  const [createRoom, setCreateRoom] = useState("Global");
  const [chatrooms, setChatrooms] = useState<
    { joinedRoom: string; chatUsers: { username: string; online: boolean }[] }[]
  >([]);
  const [updateView, setUpdateView] = useState(true);
  const [showChatroom, setShowChatroom] = useState(false);
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
      Io.socket.connect();
      Io.socket.emit("online", {
        username: response.user,
      });
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

  useEffect(() => {
    const fetchUserChat = (
      data: {
        joinedRoom: string;
        chatUsers: { username: string; online: boolean }[];
      }[]
    ) => {
      setChatrooms(data);
      console.log("hi");
      Io.socket.emit("retrieve-prior-messages", {
        chatrooms: data.map((room) => room.joinedRoom),
      });
    };

    const retrievedPriorMessages = (data: any) => {
      setAllMessages(data.allMessages);
      setUpdateView(!updateView);
    };

    const joinedRoom = (data: any) => {
      let joinedRoomsNew = [...chatrooms];
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
      setChatrooms(joinedRoomsNew);
      setCurrentRoom(data.joinedRoom);
      setCreateRoom("");
      Io.socket.emit("retrieve-prior-messages", {
        chatrooms: [data.joinedRoom],
      });
    };

    Io.socket.on("retrieved-prior-messages", retrievedPriorMessages);
    Io.socket.on("fetch-user-chat", fetchUserChat);
    Io.socket.on("joined-room", joinedRoom);

    return () => {
      Io.socket.off("fetch-user-chat", fetchUserChat);
      Io.socket.off("retrieved-prior-messages", retrievedPriorMessages);
      Io.socket.off("joined-room", joinedRoom);
    };
  }, [chatrooms, allMessages]);

  const joinRoom = () => {
    if (
      createRoom.length < 1 ||
      createRoom.length > 15 ||
      !username ||
      chatrooms.filter((room) => room.joinedRoom === createRoom).length
    ) {
      return;
    }
    Io.socket.emit("join-room", {
      chatroom: createRoom,
      username: username,
      timestamp: JSON.stringify(Date.now()),
    });
  };

  Io.socket.on("left-chat", (data: any) => {
    let myChats = chatrooms.filter((room) => room.joinedRoom !== data.chatroom);
    setCurrentRoom("Global");
    setChatrooms(myChats);
  });

  Io.socket.on("other-user-left", (data: any) => {
    let myChats = [...chatrooms];
    let chatIndex = myChats.findIndex(
      (room) => room.joinedRoom === data.joinedRoom
    );
    let updatedChat = myChats.find((room) => room.joinedRoom === data.chatroom);
    if (updatedChat) {
      updatedChat.chatUsers = updatedChat.chatUsers.filter(
        (user) => user.username !== data.username
      );
      myChats[chatIndex] = updatedChat;
      setChatrooms(myChats);
      setCurrentRoom(data.chatroom);
    }
  });

  Io.socket.on("other-user-offline", (data: any) => {
    let myChats = [...chatrooms];
    myChats.forEach((chat) => {
      chat.chatUsers.forEach((user) => {
        if (user.username === data.username) {
          user.online = false;
        }
      });
    });
    setChatrooms(myChats);
  });

  Io.socket.on("other-user-online", (data: any) => {
    let myChats = [...chatrooms];

    myChats.forEach((chat) => {
      chat.chatUsers.forEach((user) => {
        if (user.username === data.username) {
          user.online = true;
        }
      });
    });
    setChatrooms(myChats);
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
          chatrooms={chatrooms}
          updateView={updateView}
          setUpdateView={setUpdateView}
          setShowChatroom={setShowChatroom}
          showChatroom={showChatroom}
          joinRoom={joinRoom}
        />
        <Chatroom
          currentRoom={currentRoom}
          chatrooms={chatrooms}
          username={username}
          chatContainer={chatContainer}
          showChatroom={showChatroom}
          setShowChatroom={setShowChatroom}
          updateView={updateView}
          setUpdateView={setUpdateView}
          allMessages={allMessages}
          setAllMessages={setAllMessages}
        />
      </Box>
    </Box>
  );
};

export default Home;
