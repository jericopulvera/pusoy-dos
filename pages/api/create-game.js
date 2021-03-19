import { connectToDatabase } from "../../lib/mongodb";
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

  const { db } = await connectToDatabase();

  const createResponse = await db.collection("games").insertOne({
    user: decodedUserJwt,
    players: [
      {
        user: decodedUserJwt,
        cards: {},
      },
    ],
    status: "waiting",
    tableHand: null,
    newGame: null,
    moveCount: 0,
    playerToMove: null,
    lowestCard: "2d",
    createdAt: new Date().toISOString(),
  });

  const game = createResponse.ops[0];

  return res.status(200).json({ gameId: game._id, message: "Game created" });
}
