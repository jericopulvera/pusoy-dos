import { Box, Center, Button, ButtonGroup, useToast } from "@chakra-ui/react";
import * as React from "react";
import axios from "redaxios";

export default function PoolTableMainPlayerHand(props) {
  const { mainPlayerCards, game, mutateGame, user } = props;
  const [selectedCards, setSelectedCards] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useToast();

  const yourMove = game?.playerToMove === user?.id;
  const noSelectedCards = selectedCards.length === 0;
  const isFirstMove = game?.moveCount === 0;

  function playCards() {
    if (isLoading) return;

    setIsLoading(true);

    axios
      .post(
        "/api/play-cards",
        {
          cards: selectedCards.length > 0 ? selectedCards.join(" ") : "",
          gameId: game?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        mutateGame(response.data, false);
        setSelectedCards([]);
      })
      .catch((error) => {
        toast({
          title: error.data.message,
          position: "top",
          isClosable: true,
          status: "error",
        });

        setIsLoading(false);
      });
  }

  return (
    <>
      <Box w="100%">
        <Center marginTop="8px">
          <div
            className="hand hhand-compact"
            style={{
              display: "flex",
              height: "16vh",
            }}
          >
            {mainPlayerCards.map((card) => (
              <img
                key={`my-${card}`}
                className="card"
                src={`/cards/${card.toUpperCase()}.svg`}
                style={{
                  cursor: "pointer",
                  paddingBottom: selectedCards.includes(card) && "10px",
                  paddingTop: selectedCards.includes(card) && "0px",
                }}
                onClick={() => {
                  if (
                    !selectedCards.includes(card) &&
                    selectedCards.length < 5
                  ) {
                    setSelectedCards([...selectedCards, card]);
                  } else {
                    setSelectedCards(selectedCards.filter((c) => c !== card));
                  }
                }}
              />
            ))}
          </div>
        </Center>
      </Box>

      <Box w="100%">
        <Center marginTop="8px">
          <ButtonGroup>
            <Button
              colorScheme="red"
              disabled={!yourMove || isFirstMove || !noSelectedCards}
              isLoading={isLoading}
              onClick={playCards}
            >
              Pass
            </Button>
            <Button
              colorScheme="green"
              disabled={!yourMove || noSelectedCards}
              isLoading={isLoading}
              onClick={playCards}
            >
              Play
            </Button>
          </ButtonGroup>
        </Center>
      </Box>
    </>
  );
}
