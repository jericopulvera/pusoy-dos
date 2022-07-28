import { Heading, Center, Button, Divider } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function UserMenu(props) {
  const { setUser, user } = props;
  const router = useRouter();

  const isHomePage =
    typeof window !== "undefined" && window.location.pathname === "/";

  function logoutUser() {
    window.localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <>
      {user && (
        <Center>
          <Heading>
            {user.username} &nbsp;
            <Button colorScheme="red" onClick={logoutUser}>
              Logout
            </Button>
          </Heading>
          <br />
          <Button width="40" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        </Center>
      )}

      {!isHomePage && !user && (
        <Center>
          <Button width="40" onClick={() => router.push("/")}>
            Login to join the game
          </Button>
        </Center>
      )}
      <Divider />
    </>
  );
}
