import { createTheme } from "@mui/material/styles";
import { blue, indigo } from "@mui/material/colors";

const myTheme = createTheme({
  palette: {
    primary: {
      main: indigo[400],
      light: indigo[100],
    },
    secondary: {
      main: blue[400],
    },
    background: {
      default: blue[400],
    },
  },
});

export default myTheme;
