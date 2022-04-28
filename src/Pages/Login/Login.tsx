import "./Login.scss";
import requests from "../../utils/requests";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface AxiosAuth {
  error: Array<{
    location?: string;
    msg: string;
    param: string;
    value?: string;
  }>;
  success: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<AxiosAuth["error"]>([]);

  const login = async () => {
    setErrors([]);
    if (location.pathname === "/login") {
      const requestLogin: AxiosAuth = await requests.login({
        username,
        password,
      });
      if ("error" in requestLogin) {
        setErrors(requestLogin.error);
      }
      if ("success" in requestLogin) {
        sessionStorage.setItem("token", requestLogin.success);
        navigate("/home");
      }
    } else {
      const requestSignup: AxiosAuth = await requests.signup({
        username,
        password,
        confirmPassword,
      });
      if ("error" in requestSignup) {
        setErrors(requestSignup.error);
        return;
      }
      navigate("/login");
    }
  };

  const renderErrors = (filter: string) => {
    const filteredErrors = errors.filter((err) => err.param === filter);
    return filteredErrors.map((item) => <p key={item.msg}>{item.msg}</p>);
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
          {errors ? renderErrors("username") : null}
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          {errors ? renderErrors("password") : null}
          {location.pathname === "/signup" ? (
            <>
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></input>
              {errors ? renderErrors("confirmPassword") : null}
            </>
          ) : null}

          <button>Test</button>
        </form>
      </section>
    </div>
  );
};

export default Login;
