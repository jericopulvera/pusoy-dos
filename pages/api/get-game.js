import prisma from "../../lib/prisma";
import jwt from "jsonwebtoken";

export default async function (req, res) {
  const { gameId } = req.query;

  const userJwt = req.headers["authorization"]?.split(" ")[1];

  let decodedUserJwt;
  if (userJwt) {
    try {
      decodedUserJwt = jwt.verify(userJwt, process.env.APP_SECRET);
    } catch (_) {
      decodedUserJwt = null;
    }
  }

  let game;
  try {
    game = await prisma.game.findUnique({ where: { id: gameId } });
  } catch (_) {
    return res.status(404).json({ message: "Not Found" });
  }

  // Hide other players cards
  game.players = game.players.map((p) => {
    if (p.user.id === decodedUserJwt?.id) return p;

    return {
      ...p,
      cards: Object.entries(p.cards).filter((c) => !c[1].playedAt).length,
    };
  });

  return res.status(200).json(game);
}
