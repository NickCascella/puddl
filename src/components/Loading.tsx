import AutorenewIcon from "@mui/icons-material/Autorenew";
import { keyframes } from "@mui/material";

const loadingAnimation = keyframes`
from {
  transform: rotate(0deg);
},
to {transform: rotate(360deg);
  },
`;

const LoadingAnimation = () => {
  return (
    <AutorenewIcon
      sx={{
        animation: `${loadingAnimation} 2s linear infinite`,
        width: "25%",
        height: "25%",
      }}
    />
  );
};

export default LoadingAnimation;
