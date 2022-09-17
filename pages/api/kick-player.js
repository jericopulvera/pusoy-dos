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

  const { gameId, playerId } = req.body;

  let game = await prisma.game.findUnique({ where: { id: gameId } });

  if (!game) {
    return res.status(404).json({ message: "Not Found" });
  }

  const userIsInTheGame = game.players.some(
    (p) => p.user.id === decodedUserJwt.id
  );

  if (!userIsInTheGame) {
    return res.status(422).json({ message: "Player is not in the game" });
  }

  if (decodedUserJwt?.id !== playerId && decodedUserJwt?.id !== game.user.id) {
    return res.status(422).json({ message: "Forbidden" });
  }

  game = {
    ...game,
    players: game.players.filter((p) => p.user.id !== playerId),
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
  } catch (_) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(200).json({ message: "Player Kicked Successfully" });
}
