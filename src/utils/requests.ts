import axios from "axios";
const API = "http://localhost:8080";

type AuthScreen = {
  username: string;
  password: string;
};

const requests = {
  signup: async ({ username, password }: AuthScreen) => {
    try {
      const response = await axios.post(`${API}/auth/signup`, {
        username,
        password,
      });
      return response;
    } catch (err: any) {
      return err;
    }
  },
  login: async ({ username, password }: AuthScreen) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });
      return response;
    } catch (err: any) {
      return err;
    }
  },
};

export default requests;
