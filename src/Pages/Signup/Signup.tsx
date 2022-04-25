import "./Signup.scss";
import requests from "../../utils/requests";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();
  const signup = async () => {
    const response = await requests.signup({
      username,
      password,
    });
    console.log(response);
    // navigate("/login");
  };

  return (
    <div className="signup-page-wrapper">
      <section className="signup-page">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signup();
          }}
          className="signup-page__form"
        >
          <label htmlFor="username">Username</label>
          <input
            name="username"
            autoComplete="none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          ></input>
          <label htmlFor="password">Password</label>
          <input
            name="password"
            autoComplete="none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          <button>Signup</button>
        </form>
      </section>
    </div>
  );
};

export default Signup;
