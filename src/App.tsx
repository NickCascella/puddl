import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth/Auth";
import Home from "./pages/Home/Home";
import { ThemeProvider, styled } from "@mui/material/styles";
import myTheme from "./common/theme";

const AppWrapper = styled("div")(({ theme }) => ({
  // background: theme.palette.background.default,
}));

function App() {
  return (
    <ThemeProvider theme={myTheme}>
      <AppWrapper>
        <Router>
          <Routes>
            <Route path="/signup" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
