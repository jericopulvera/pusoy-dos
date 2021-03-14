import { q, faunaDbClient } from "../../lib/faunadb";
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

  const game = await faunaDbClient.query(
    q.Create(q.Collection("games"), {
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
        newGame: null,
        moveCount: 0,
        playerToMove: null,
        lowestCard: "2d",
        createdAt: new Date().toISOString(),
      },
    })
  );

  return res.status(200).json({ gameId: game.ref.id, message: "Game created" });
}
