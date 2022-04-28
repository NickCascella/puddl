import requests from "../../utils/requests";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { styled } from "@mui/system";
import { TextField, Button, Typography, Box } from "@mui/material";

interface AxiosAuth {
  error: Array<{
    location?: string;
    msg: string;
    param: string;
    value?: string;
  }>;
  success: string;
}

const AuthPage = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
});

const AuthModal = styled("form")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: "1rem",
  borderRadius: "5%",
});

const Auth = () => {
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
    return filteredErrors.map((item) => <span key={item.msg}>{item.msg}</span>);
  };

  const checkError = (filter: string) => {
    const filteredErrors = errors.filter((err) => err.param === filter);
    return filteredErrors.length > 0 ? true : false;
  };

  return (
    <AuthPage>
      <AuthModal
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <Typography variant="h4" component="h1">
          PUDDL
        </Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={checkError("username")}
          helperText={renderErrors("username")}
          margin={"normal"}
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={checkError("password")}
          helperText={renderErrors("password")}
          margin={"normal"}
        />
        {location.pathname === "/signup" ? (
          <TextField
            margin={"normal"}
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={checkError("confirmPassword")}
            helperText={renderErrors("confirmPassword")}
          />
        ) : null}
        <Box display="flex" gap="1rem" marginTop="1rem">
          <Button type="submit" variant="contained">
            {location.pathname === "/login" ? "Login" : "Signup"}
          </Button>

          <Button
            variant="contained"
            type="button"
            onClick={() =>
              location.pathname === "/login"
                ? navigate("/signup")
                : navigate("/login")
            }
          >
            {location.pathname === "/login" ? "Register" : "Home"}
          </Button>
        </Box>
      </AuthModal>
    </AuthPage>
  );
};

export default Auth;
