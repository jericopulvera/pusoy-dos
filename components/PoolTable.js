import "cardsJS/cards.css";
import * as React from "react";
import { VStack, Box } from "@chakra-ui/react";
import PoolTableHand from "./PoolTableHand";
import PoolTableMainPlayerHand from "./PoolTableMainPlayerHand";
import PoolTableOtherPlayerHand from "./PoolTableOtherPlayerHand";
import { order } from "../lib/pusoy-dos";

export default function PoolTable(props) {
  const { user, game = {}, mutateGame } = props;

  const playerToMove = game?.players?.find(
    (p) => p.user._id === game?.playerToMove
  )?.user?.username;

  const cardsOnTable = game?.tableHand?.cards?.split(" ") || [];
  const otherPlayers = game?.players?.filter((p) => p.user._id !== user?._id);

  const mainPlayer = game?.players?.find((p) => p.user._id === user?._id);
  const filteredPlayerCards = Object.entries(mainPlayer?.cards || []).filter(
    (c) => !c[1].playedAt
  );
  const mainPlayerCards = filteredPlayerCards
    .map((c) => [c[0], String.fromCharCode([77 - order.indexOf(c[0][0])])])
    .sort((a, b) => {
      if (a[1] < b[1]) return 1;
      if (a[1] > b[1]) return -1;
      return 0;
    })
    .map((c) => c[0]);

  return (
    <>
      <VStack direction={["column", "row"]} spacing="2px">
        <Box w="100%" textAlign="center">
          Turn: {playerToMove}
          {/* | Timer: 60s */}
        </Box>

        <PoolTableHand cardsOnTable={cardsOnTable} />

        {otherPlayers.map((p) => (
          <PoolTableOtherPlayerHand
            player={p}
            key={`other-box-${p.user._id}`}
          />
        ))}

        <PoolTableMainPlayerHand
          mainPlayerCards={mainPlayerCards}
          game={game}
          mutateGame={mutateGame}
          user={user}
        />
      </VStack>
    </>
  );
}
