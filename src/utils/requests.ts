import axios from "axios";
const API = "http://localhost:8080";

interface AuthScreen {
  username: string;
  password: string;
  confirmPassword?: string;
}

const requests = {
  signup: async ({ username, password, confirmPassword }: AuthScreen) => {
    try {
      const response = await axios.post(`${API}/auth/signup`, {
        username,
        password,
        confirmPassword,
      });
      return response.data;
    } catch (err: any) {
      return err.response.data;
    }
  },
  login: async ({ username, password }: AuthScreen) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });
      return response.data;
    } catch (err: any) {
      return err.response.data;
    }
  },
  verifyToken: async (token: string | null) => {
    try {
      const response = await axios.get(`${API}/test`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      return response.data.response;
    } catch (err: any) {
      return err.response.data;
    }
  },
};

export default requests;
