import prisma from "../../lib/prisma";
import jwt from "jsonwebtoken";

export default async function (req, res) {
  const userJwt = req.headers["authorization"]?.split(" ")[1];

  let decodedUserJwt;
  try {
    decodedUserJwt = jwt.verify(userJwt, process.env.APP_SECRET);
    delete decodedUserJwt.iat;
  } catch (error) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const { gameId } = req.body;

  let game = await prisma.game.findUnique({ where: { id: gameId } });

  if (!game) {
    return res.status(404).json({ message: "Not Found" });
  }

  if (game.players.length === 4) {
    return res.status(422).json({ message: "Game is full" });
  }

  const userIsInTheGame = game.players.some(
    (p) => p.user.id === decodedUserJwt.id
  );

  if (userIsInTheGame) {
    return res.status(422).json({ message: "You already joined the game" });
  }

  game = {
    ...game,
    players: [
      ...game.players,
      {
        user: decodedUserJwt,
        cards: {},
      },
    ],
    tableHand: {},
    playerToMove: undefined,
  };

  try {
    await prisma.game.update({
      where: {
        id: gameId,
      },
      data: game,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(200).json({ message: "Join Successful" });
}
