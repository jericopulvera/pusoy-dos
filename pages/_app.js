import { ChakraProvider } from "@chakra-ui/react";
import * as React from "react";
import jwtDecode from "jwt-decode";

function MyApp({ Component, pageProps }) {
  const [user, setUser] = React.useState({});
  const [loadingUser, setLoadingUser] = React.useState(true);

  React.useEffect(() => {
    const jwt = window.localStorage.getItem("token");

    if (jwt) {
      setUser(jwtDecode(jwt));
    } else {
      setUser(null);
    }

    setLoadingUser(false);
  }, []);

  return (
    <ChakraProvider>
      <Component
        {...pageProps}
        user={user}
        setUser={setUser}
        loadingUser={loadingUser}
      />
    </ChakraProvider>
  );
}
export default MyApp;
