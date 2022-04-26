import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../../utils/requests";

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
  const [username, setUsername] = useState("");

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

  return (
    <div>
      Hello world
      <button
        onClick={() => {
          sessionStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
