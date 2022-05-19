import { Button, Box, keyframes, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import Io from "../utils/socket";
import { DynamicKeyIntegerPair } from "../styles/globalTypes";

interface NavInterface {
  username: string;
  createRoom: string;
  setCreateRoom: (value: React.SetStateAction<string>) => void;
  setCurrentRoom: (value: React.SetStateAction<string>) => void;
  currentRoom: string;
  notifications: DynamicKeyIntegerPair;
  setNotifications: React.Dispatch<React.SetStateAction<DynamicKeyIntegerPair>>;
  chatrooms: {
    joinedRoom: string;
    chatUsers: { username: string; online: boolean }[];
  }[];
  updateView: boolean;
  setUpdateView: (value: React.SetStateAction<boolean>) => void;
  showChatroom: boolean;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
  joinRoom: () => void;
  setShowRoomSettings: React.Dispatch<React.SetStateAction<boolean>>;
  chatContainer: React.RefObject<HTMLDivElement>;
  chatroomScrollLocations: DynamicKeyIntegerPair;
  setChatroomScrollLocations: React.Dispatch<
    React.SetStateAction<DynamicKeyIntegerPair>
  >;
  joinRoomError: string;
}

const hideChatsList = keyframes`
from {transform: translateX(0%)},
to {transform: translateX(-100%)},
`;

const displayChatsList = keyframes`
from {transform: translateX(-100%)},
to {transform: translateX(0%)},
`;

const Nav = ({
  username,
  createRoom,
  setCreateRoom,
  setCurrentRoom,
  notifications,
  setNotifications,
  currentRoom,
  chatrooms,
  updateView,
  setUpdateView,
  setShowChatroom,
  showChatroom,
  joinRoom,
  setShowRoomSettings,
  chatContainer,
  chatroomScrollLocations,
  setChatroomScrollLocations,
  joinRoomError,
}: NavInterface) => {
  const navigate = useNavigate();
  const [filterRooms, setFilterRooms] = useState("");

  return (
    <Box
      display="flex"
      flexDirection="column"
      minWidth="max-content"
      width="25%"
      height="100%"
      sx={{
        border: "1px solid black",
        borderColor: "primary.light",
        ["@media (max-width:850px)"]: {
          width: "100%",
          animation: `${
            showChatroom ? hideChatsList : displayChatsList
          } 0.2s linear forwards`,
        },
      }}
      padding="1rem 1rem"
      boxSizing="border-box"
    >
      <Typography variant="h4" component="h2" marginBottom="1rem">
        Rooms
      </Typography>
      <Box display="flex">
        <TextField
          label="Room ID"
          value={createRoom}
          fullWidth={true}
          sx={{ height: "max-content", margin: "auto 2rem auto 0" }}
          onChange={(e) => setCreateRoom(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CreateOutlinedIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          error={joinRoomError ? true : false}
          helperText={joinRoomError}
        />

        <Button
          variant="contained"
          endIcon={<PersonAddAltOutlinedIcon />}
          onClick={joinRoom}
        >
          Join
        </Button>
      </Box>
      <TextField
        sx={{ marginTop: "1rem" }}
        label="Search My Rooms"
        value={filterRooms}
        onChange={(e) => setFilterRooms(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon />
            </InputAdornment>
          ),
        }}
        variant="standard"
      />
      <Box
        height="64%"
        overflow="auto"
        marginTop="1rem"
        borderRadius="3px"
        sx={{
          border: `1px solid black`,
          borderColor: "primary.light",
        }}
      >
        {chatrooms
          .filter((room) =>
            room.joinedRoom.toLowerCase().includes(filterRooms.toLowerCase())
          )
          .map((room) => (
            <Box
              width="100%"
              key={room.joinedRoom}
              sx={{
                padding: "1rem",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid black`,
                borderColor: "primary.light",
                ":hover": {
                  cursor: "pointer",
                },
                backgroundColor:
                  currentRoom === room.joinedRoom ? "primary.light" : "white",
              }}
              onClick={() => {
                if (chatContainer.current) {
                  const refScrollPosition = chatContainer.current.scrollTop;
                  let chatroomScrollLocationsCopy = {
                    ...chatroomScrollLocations,
                  };
                  chatroomScrollLocationsCopy[currentRoom] = refScrollPosition;
                  setChatroomScrollLocations(chatroomScrollLocationsCopy);
                }
                setCurrentRoom(room.joinedRoom);
                setUpdateView(!updateView);
                setShowChatroom(!showChatroom);
                setShowRoomSettings(false);
                if (notifications[room.joinedRoom]) {
                  let oldNotifications = { ...notifications };
                  oldNotifications[room.joinedRoom] = 0;
                  setNotifications(oldNotifications);
                  Io.socket.emit("delete-notifications", {
                    username,
                    chatroom: room.joinedRoom,
                  });
                }
              }}
            >
              <MeetingRoomOutlinedIcon sx={{ marginRight: "0.5rem" }} />{" "}
              {room.joinedRoom}{" "}
              {notifications[room.joinedRoom] > 0 && (
                <Box
                  sx={{
                    marginLeft: "auto",
                    padding: "0.25rem",
                    width: "1.1rem",
                    height: "1.1rem",
                    textAlign: "center",
                    borderRadius: "50%",
                    backgroundColor: "primary.light",
                  }}
                >
                  {notifications[room.joinedRoom]}
                </Box>
              )}
            </Box>
          ))}
      </Box>
      <Button
        variant="contained"
        onClick={() => {
          sessionStorage.removeItem("token");
          Io.socket.emit("offline", { message: "offline" });
          Io.socket.disconnect();
          navigate("/login");
        }}
        sx={{ marginTop: "auto", width: "max-content" }}
        startIcon={<LogoutOutlinedIcon />}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Nav;
