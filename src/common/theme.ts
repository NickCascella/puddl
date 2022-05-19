import { createTheme } from "@mui/material/styles";
import { indigo, green } from "@mui/material/colors";

const myTheme = createTheme({
  palette: {
    primary: {
      main: indigo[400],
      light: indigo[100],
      dark: indigo[700],
    },
    secondary: {
      main: green[400],
      dark: green[800],
    },
    background: {
      default: "black",
    },
  },
});

export default myTheme;
