import "./Home.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";
import Socket from "../../utils/socket";

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
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Global");
  const [createRoom, setCreateRoom] = useState("test");
  const [joinedRoom, setJoinedRooms] = useState<string[]>(["Global"]);
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
      let socket = Socket;
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
    console.log(data);
    let chatMessages = [...allMessages];
    chatMessages.push(data);
    setAllMessages(chatMessages);
  });

  if (!username) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {" "}
      <button
        onClick={() => {
          sessionStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Logout
      </button>
      <div className="chat-ui">
        <section className="chat-ui__list">
          <h2>Welcome {username}</h2>
          <div>Join room:</div>
          <input
            value={createRoom}
            onChange={(e) => setCreateRoom(e.target.value)}
          ></input>
          <button onClick={joinRoom}></button>
          {joinedRoom.map((room) => (
            <div onClick={() => setCurrentRoom(room)}>{room}</div>
          ))}
        </section>
        <section className="chat-ui__current-chat">
          <h2>Current room {currentRoom}</h2>
          <ul className="chat-ui__messages">
            {allMessages.length
              ? allMessages
                  .filter((data) => data.chatroom === currentRoom)
                  .map((data) => (
                    <li>
                      {data.message} by {data.username}
                    </li>
                  ))
              : null}
          </ul>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></input>
          <button
            onClick={() => {
              Socket.emit("send-message", {
                message: message,
                username: username,
                chatroom: currentRoom,
              });
            }}
          >
            Send Message
          </button>
        </section>
      </div>
    </>
  );
};

export default Home;
