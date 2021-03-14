import Head from "next/head";
import * as React from "react";
import LoginForm from "../components/LoginForm";
import {
  Container,
  Heading,
  Center,
  Button,
  Spinner,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "redaxios";
import { useRouter } from "next/router";
import UserMenu from "../components/UserMenu";

export default function Home(props) {
  const { user, setUser, loadingUser } = props;
  const [creatingGame, setIsCreatingGame] = React.useState(false);

  const router = useRouter();
  const toast = useToast();

  function createGame() {
    if (creatingGame) return;

    setIsCreatingGame(true);

    axios
      .post(
        "/api/create-game",
        {},
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setIsCreatingGame(false);
        router.push(`/games/${response.data.gameId}`);
      })
      .catch((error) => {
        toast({
          title: error.data.message,
          position: "top",
          isClosable: true,
          status: "error",
        });

        setIsCreatingGame(false);
      });
  }

  return (
    <div>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="70vh"
        width="100%"
      >
        {loadingUser && (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        )}

        {!loadingUser && !user && (
          <div style={{ width: "100%" }}>
            <Center>
              <Heading marginBottom="8">Login to Play</Heading>
            </Center>
            <LoginForm setUser={setUser} />
          </div>
        )}

        {!loadingUser && user && (
          <VStack spacing={4} align="stretch" width="100%">
            <UserMenu user={user} setUser={setUser} />

            <Button
              isLoading={creatingGame}
              marginBottom="2"
              padding="8"
              fontSize="20"
              onClick={createGame}
            >
              Create Game
            </Button>
            <Button marginBottom="2" padding="8" fontSize="20">
              Winnings and Debts
            </Button>
          </VStack>
        )}
      </Container>
    </div>
  );
}
