import { Box, Center } from "@chakra-ui/react";

export default function PoolTableOtherPlayer(props) {
  const { player } = props;

  return (
    <Box w="100%">
      <Center marginTop="8px">
        <div
          className="hhand-compact"
          style={{ display: "flex", height: "10vh" }}
        >
          {[...Array(player?.cards)].map((_, i) => (
            <img
              className="card"
              key={`other-card-${player?.user?.id}-${i}`}
              src="/cards/BLUE_BACK.svg"
            />
          ))}
        </div>
      </Center>
      <Center>
        <div>Player: {player?.user?.username}</div>
      </Center>
    </Box>
  );
}
