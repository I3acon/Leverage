import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "Inter",
    body: "Inter",
  },

  styles: {
    global: () => ({
      body: {
        bg: "#000000",
        color: "whiteAlpha.900",
        lineHeight: "base",
        backgroundImage:
          "radial-gradient(50% 50% at 50% 50%,rgba(16, 16, 195, 0.533) 0%,rgba(0, 0, 0, 0) 100%)",
        backgroundPosition: "0 -30vh",
        backgroundRepeat: "no-repeat",
        justifyContent: "center",
      },
      ".box": {
        padding: "20px",
        color: "#fff",
        bg: "rgba(8, 8, 214, 0.205)",
        width: "400px",
        textAlign: "center",
        borderRadius: "15px",
        border: "1px solid rgba(0, 0, 0, 0.05)",
      },
    }),
  },
});

export default theme;
