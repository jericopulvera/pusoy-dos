import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";

export default async function (req, res) {
  const userJwt = req.headers["authorization"]?.split(" ")[1];

  let decodedUserJwt;
  try {
    decodedUserJwt = jwt.verify(userJwt, process.env.APP_SECRET);
    delete decodedUserJwt.iat;
  } catch (error) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const game = await prisma.game.create({
    data: {
      user: decodedUserJwt,
      players: [
        {
          user: decodedUserJwt,
          cards: {},
        },
      ],
      status: "waiting",
      tableHand: {},
      moveCount: 0,
      playerToMove: undefined,
      lowestCard: "2d",
    },
  });

  return res.status(200).json({ gameId: game.id, message: "Game created" });
}
