import Head from "next/head";
import * as React from "react";
import {
  Container,
  Button,
  VStack,
  Input,
  InputGroup,
  useToast,
  useClipboard,
  Center,
  Heading,
  Spinner,
  UnorderedList,
  ListItem,
  Divider,
} from "@chakra-ui/react";
import axios from "redaxios";
import { useRouter } from "next/router";
import useSWR from "swr";
import UserMenu from "../../components/UserMenu";
import PoolTable from "../../components/PoolTable";

const fetcher = (url, user) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${user?.jwt}` } })
    .then((response) => {
      if (response?.data?.data) return response?.data?.data;
      return response?.data;
    });

export default function Home(props) {
  const { user, setUser, loadingUser } = props;
  const [startingGame, setIsCreatingGame] = React.useState(false);
  const [joiningGame, setIsJoiningGame] = React.useState(false);

  const pageLink = typeof window !== "undefined" ? window.location.href : "";
  const { hasCopied, onCopy } = useClipboard(pageLink);

  const router = useRouter();
  const toast = useToast();

  const gameId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : "";

  const { data: game, error, mutate: mutateGame, isValidating } = useSWR(
    user?.jwt ? `/api/get-game?gameId=${gameId}` : null,
    (url) => fetcher(url, user),
    {
      refreshInterval: 3000,
    }
  );

  const userIsHost = user?.id === game?.user?.id;
  const userIsInTheGame = game?.players?.some((p) => p?.user?.id === user?.id);
  const gameIsOngoing = game?.status === "ongoing";

  function startGame() {
    if (startingGame) return;

    setIsCreatingGame(true);

    axios
      .post(
        "/api/start-game",
        { gameId: game?.id },
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setIsCreatingGame(false);
        mutateGame(response.data, false);
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

  function joinGame() {
    if (joiningGame) return;

    setIsJoiningGame(true);

    axios
      .post(
        "/api/join-game",
        { gameId: game?.id },
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        mutateGame(
          {
            ...game,
            players: [...game.players, { user, cards: {} }],
          },
          false
        );
        setIsJoiningGame(false);
      })
      .catch((error) => {
        toast({
          title: error.data.message,
          position: "top",
          isClosable: true,
          status: "error",
        });

        setIsJoiningGame(false);
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
        width="100%"
        paddingTop="8"
        maxWidth="100ch"
      >
        {loadingUser && (
          <Center>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Center>
        )}

        {!loadingUser && (
          <VStack spacing={4} align="stretch" width="100%">
            <UserMenu user={user} setUser={setUser} />

            {game && game?.status === "waiting" && (
              <>
                <InputGroup flex alignItems="center">
                  <Input
                    value={pageLink}
                    isReadOnly
                    placeholder="Welcome"
                    padding={6}
                  />
                  <Button onClick={onCopy} ml={2} padding={5}>
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
                </InputGroup>

                {userIsHost && (
                  <Button
                    isLoading={startingGame}
                    marginBottom="2"
                    padding="8"
                    fontSize="20"
                    onClick={startGame}
                  >
                    Start Game
                  </Button>
                )}

                {!userIsHost && !userIsInTheGame && (
                  <Button
                    isLoading={joiningGame}
                    marginBottom="2"
                    padding="8"
                    fontSize="20"
                    onClick={joinGame}
                  >
                    Join Game
                  </Button>
                )}

                {!userIsHost && userIsInTheGame && (
                  <Button disabled marginBottom="2" padding="8" fontSize="20">
                    Waiting for the Host to Start
                  </Button>
                )}

                <Divider />

                <Heading>Players</Heading>
                <UnorderedList paddingLeft="8">
                  {game?.players?.map((p) => (
                    <ListItem
                      key={p.user.username}
                      fontSize="xl"
                      flex
                      alignItems="center"
                    >
                      {p.user.username} &nbsp;
                      {userIsHost && user?.id !== p?.user?.id && (
                        <Button colorScheme="red" paddingX="2" height="6">
                          Kick
                        </Button>
                      )}
                      {!userIsHost && user?.id === p?.user?.id && (
                        <Button colorScheme="red" paddingX="2" height="6">
                          Leave
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </UnorderedList>
              </>
            )}

            {game && game?.status === "ongoing" && (
              <div>
                <PoolTable user={user} game={game} mutateGame={mutateGame} />
              </div>
            )}

            {game && game?.status === "ended" && (
              <>
                <Heading>Players</Heading>
                <UnorderedList paddingLeft="8">
                  {game?.players?.map((p) => (
                    <ListItem
                      key={p.user.username}
                      fontSize="xl"
                      flex
                      alignItems="center"
                    >
                      {p.user.username} &nbsp;
                      {game?.tableHand?.userId === p?.user?.id && (
                        <Button colorScheme="green" paddingX="2" height="6">
                          Winner
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </UnorderedList>
              </>
            )}

            {!game && error ? (
              <Center>
                <Heading style={{ color: "red" }}>{error.data.message}</Heading>
              </Center>
            ) : null}
          </VStack>
        )}
      </Container>
    </div>
  );
}
