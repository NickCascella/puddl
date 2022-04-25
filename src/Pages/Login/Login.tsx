import "./Login.scss";
import requests from "../../utils/requests";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  let navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const response = await requests.login({ username, password });
    console.log(response.data);
    sessionStorage.setItem("token", response.data.token);
    navigate("/home");
  };

  return (
    <div className="login-page-wrapper">
      <section className="login-page">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
          className="login-page__form"
        >
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          ></input>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          <button>Test</button>
        </form>
      </section>
    </div>
  );
};

export default Login;
