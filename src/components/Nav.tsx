import { Button, Box, keyframes, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
// import Socket from "../utils/socket";
import Io from "../utils/socket";

interface NavInterface {
  createRoom: string;
  setCreateRoom: (value: React.SetStateAction<string>) => void;
  setCurrentRoom: (value: React.SetStateAction<string>) => void;
  chatrooms: {
    joinedRoom: string;
    chatUsers: { username: string; online: boolean }[];
  }[];
  updateView: boolean;
  setUpdateView: (value: React.SetStateAction<boolean>) => void;
  showChatroom: boolean;
  setShowChatroom: (value: React.SetStateAction<boolean>) => void;
  joinRoom: () => void;
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
  createRoom,
  setCreateRoom,
  setCurrentRoom,
  chatrooms,
  updateView,
  setUpdateView,
  setShowChatroom,
  showChatroom,
  joinRoom,
}: NavInterface) => {
  const navigate = useNavigate();
  const [filterRooms, setFilterRooms] = useState("");

  return (
    <Box
      display="flex"
      flexDirection="column"
      minWidth="max-content"
      width="25%"
      height="100vh"
      sx={{
        border: "1px solid rgb(202, 203, 204)",
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
      <Box display="flex">
        <TextField
          label="Room ID"
          value={createRoom}
          fullWidth={true}
          sx={{ marginRight: "2rem" }}
          onChange={(e) => setCreateRoom(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CreateOutlinedIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          endIcon={<PersonAddAltOutlinedIcon />}
          onClick={joinRoom}
        >
          Join
        </Button>
      </Box>
      <Typography variant="h4" component="h2" marginTop="1rem">
        Rooms
      </Typography>
      <TextField
        sx={{ marginTop: "1rem" }}
        label="Search Rooms"
        value={filterRooms}
        onChange={(e) => setFilterRooms(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon />
            </InputAdornment>
          ),
        }}
      />
      <Box
        height="60%"
        overflow="auto"
        marginTop="1rem"
        border="1px solid rgb(202, 203, 204)"
        borderRadius="3px"
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
                borderBottom: "1px solid rgb(202, 203, 204)",
                ":hover": {
                  cursor: "pointer",
                },
              }}
              onClick={() => {
                setCurrentRoom(room.joinedRoom);
                setUpdateView(!updateView);
                setShowChatroom(!showChatroom);
              }}
            >
              <MeetingRoomOutlinedIcon sx={{ marginRight: "0.5rem" }} />{" "}
              {room.joinedRoom}
            </Box>
          ))}
      </Box>
      <Button
        variant="contained"
        onClick={() => {
          sessionStorage.removeItem("token");
          Io.socket.emit("disconnet", { message: "offline" });
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
