import { ChakraProvider } from "@chakra-ui/react";
import { Provider as ReduxProvider } from "react-redux";
import Nav from "../components/Navbar";

import theme from "../styles/theme";
import store from "../store";

import "@fontsource/inter/400.css";

function App({ Component, pageProps }) {
  return (
    <ReduxProvider store={store}>
      <ChakraProvider theme={theme}>
        <Nav />
        <Component {...pageProps} />
      </ChakraProvider>
    </ReduxProvider>
  );
}

export default App;
