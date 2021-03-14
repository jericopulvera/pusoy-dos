import { Box, Center } from "@chakra-ui/react";

export default function PoolTableHand(props) {
  const { cardsOnTable } = props;

  return (
    <Box w="100%">
      <Center marginTop="8px" border="1px">
        <div
          className="hand active-hand"
          style={{
            display: "flex",
            height: "14vh",
          }}
        >
          {cardsOnTable.map((card) => (
            <img
              key={card}
              className="card"
              src={`/cards/${card.toUpperCase()}.svg`}
              style={{ margin: "4px" }}
            />
          ))}
        </div>
      </Center>
    </Box>
  );
}
