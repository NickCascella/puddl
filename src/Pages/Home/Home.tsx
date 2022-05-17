import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";
import Io from "../../utils/socket";
import { Box } from "@mui/material";
import Nav from "../../components/Nav";
import Chatroom from "../../components/ChatRoom";
import {
  Token,
  NoToken,
  ReceivedMessage,
  ChatroomDataInterface,
  priorMessages,
  Notifications,
} from "../../styles/globalTypes";

const Home = () => {
  const navigate = useNavigate();
  const chatContainer = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Global");
  const [createRoom, setCreateRoom] = useState("Global");
  const [chatrooms, setChatrooms] = useState<ChatroomDataInterface[]>([]);
  const [updateView, setUpdateView] = useState(true);
  const [showChatroom, setShowChatroom] = useState(false);
  const [allMessages, setAllMessages] = useState<Array<ReceivedMessage>>([]);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notifications>({});
  const [paginationRef, setPaginationRef] = useState<Notifications>({});
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
    if (username) {
      joinRoom();
    }
  }, [username]);

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [updateView]);

  useEffect(() => {
    const fetchUserChat = (data: ChatroomDataInterface[]) => {
      setChatrooms(data);
      Io.socket.emit("retrieve-prior-messages", {
        chatrooms: data.map((room) => room.joinedRoom),
      });
      Io.socket.emit("get-old-notifications", {
        username,
      });
    };

    const retrievedPriorMessages = (data: priorMessages) => {
      const messages = [...allMessages];
      let newMessageList = messages.concat(data.allMessages);
      setAllMessages(newMessageList);
      setUpdateView(!updateView);
    };

    const retrievedPriorNotifications = (data: Notifications) => {
      console.log(data);
      setNotifications(data);
    };

    const fetchedAdditionalMessages = (data: ReceivedMessage[]) => {
      if (data.length) {
        let allMessagesCopy = [...allMessages];
        allMessagesCopy = allMessagesCopy.concat(data);
        setAllMessages(allMessagesCopy);
        if (chatContainer.current) {
          chatContainer.current.scrollTop =
            chatContainer.current.scrollHeight * 0.15;
        }
      }
    };

    const displayNewMessage = (data: ReceivedMessage) => {
      let chatMessages = [...allMessages];
      chatMessages.push(data);

      if (currentRoom !== data.chatroom && data.username !== username) {
        let oldNotifications = { ...notifications };

        oldNotifications[data.chatroom]
          ? oldNotifications[data.chatroom]++
          : (oldNotifications[data.chatroom] = 1);
        Io.socket.emit("log-notification", {
          username: username,
          chatroom: data.chatroom,
          notifications: oldNotifications[data.chatroom],
        });
        setNotifications(oldNotifications);
      }

      setAllMessages(chatMessages);
      if (data.chatroom === currentRoom) {
        setUpdateView(!updateView);
      }
    };

    const joinedRoom = (data: ChatroomDataInterface) => {
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

      if (data.username === username || username === "") {
        Io.socket.emit("send-message", {
          message: `${data.username} has joined ${data.joinedRoom}!`,
          username: "Puddl",
          chatroom: data.joinedRoom,
          timestamp: JSON.stringify(Date.now()),
        });
      }
      Io.socket.emit("retrieve-prior-messages", {
        chatrooms: [data.joinedRoom],
      });
    };

    const leftChat = (data: { username: string; chatroom: string }) => {
      Io.socket.emit("send-message", {
        message: `${data.username} has left ${data.chatroom}!`,
        username: "Puddl",
        chatroom: data.chatroom,
        timestamp: JSON.stringify(Date.now()),
      });
      let myChats = chatrooms.filter(
        (room) => room.joinedRoom !== data.chatroom
      );
      setCurrentRoom("Global");
      setChatrooms(myChats);
    };

    const otherUserLeftChat = (data: {
      username: string;
      chatroom: string;
    }) => {
      let myChats = [...chatrooms];
      let chatIndex = myChats.findIndex(
        (room) => room.joinedRoom === data.chatroom
      );
      let updatedChat = myChats.find(
        (room) => room.joinedRoom === data.chatroom
      );
      if (updatedChat) {
        updatedChat.chatUsers = updatedChat.chatUsers.filter(
          (user) => user.username !== data.username
        );
        myChats[chatIndex] = updatedChat;
        setCurrentRoom(data.chatroom);
        setChatrooms(myChats);
      }
    };

    const otherUserStatus = (data: any) => {
      let myChats = [...chatrooms];
      myChats.forEach((chat) => {
        chat.chatUsers.forEach((user) => {
          if (user.username === data.username) {
            user.online = data.online;
          }
        });
      });
      setChatrooms(myChats);
    };

    Io.socket.on("retrieved-prior-messages", retrievedPriorMessages);
    Io.socket.on("fetched-additional-messages", fetchedAdditionalMessages);
    Io.socket.on("retrieved-prior-notifications", retrievedPriorNotifications);
    Io.socket.on("fetch-user-chat", fetchUserChat);
    Io.socket.on("joined-room", joinedRoom);
    Io.socket.on("left-chat", leftChat);
    Io.socket.on("other-user-left", otherUserLeftChat);
    Io.socket.on("other-user-status", otherUserStatus);
    Io.socket.on("display-message", displayNewMessage);

    return () => {
      Io.socket.off("fetch-user-chat", fetchUserChat);
      Io.socket.off("retrieved-prior-messages", retrievedPriorMessages);
      Io.socket.off(
        "retrieved-prior-notifications",
        retrievedPriorNotifications
      );
      Io.socket.off("fetched-additional-messages", fetchedAdditionalMessages);
      Io.socket.off("joined-room", joinedRoom);
      Io.socket.off("left-chat", leftChat);
      Io.socket.off("other-user-left", otherUserLeftChat);
      Io.socket.off("other-user-status", otherUserStatus);
      Io.socket.off("display-message", displayNewMessage);
    };
  }, [chatrooms, allMessages, notifications, currentRoom]);

  const joinRoom = () => {
    if (
      createRoom.length < 1 ||
      createRoom.length > 15 ||
      !username ||
      chatrooms.find((room) => room.joinedRoom === createRoom)
    ) {
      console.log("NOT A VALID ROOM");
      return;
    }
    Io.socket.emit("join-room", {
      chatroom: createRoom,
      username: username,
      timestamp: JSON.stringify(Date.now()),
    });
  };

  const onScroll = () => {
    if (chatContainer.current) {
      const scrollY = window.scrollY;
      const refScrollPosition = chatContainer.current.scrollTop;
      if (scrollY === refScrollPosition) {
        let paginationRefCopy = { ...paginationRef };
        paginationRefCopy[currentRoom]
          ? (paginationRefCopy[currentRoom] += 10)
          : (paginationRefCopy[currentRoom] = 10);

        Io.socket.emit("fetch-additional-messages", {
          chatroom: currentRoom,
          offset: paginationRefCopy[currentRoom],
        });
        setPaginationRef(paginationRefCopy);
      }
    }
  };

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
          username={username}
          createRoom={createRoom}
          setCreateRoom={setCreateRoom}
          setCurrentRoom={setCurrentRoom}
          currentRoom={currentRoom}
          notifications={notifications}
          setNotifications={setNotifications}
          chatrooms={chatrooms}
          updateView={updateView}
          setUpdateView={setUpdateView}
          setShowChatroom={setShowChatroom}
          showChatroom={showChatroom}
          joinRoom={joinRoom}
          setShowRoomSettings={setShowRoomSettings}
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
          showRoomSettings={showRoomSettings}
          setShowRoomSettings={setShowRoomSettings}
          onScroll={onScroll}
        />
      </Box>
    </Box>
  );
};

export default Home;
