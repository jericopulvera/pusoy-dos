import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";
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
  const { db } = await connectToDatabase();

  let game = await db.collection("games").findOne({ _id: ObjectId(gameId) });

  if (!game) {
    return res.status(404).json({ message: "Not Found" });
  }

  if (game.players.length === 4) {
    return res.status(422).json({ message: "Game is full" });
  }

  const userIsInTheGame = game.players.some(
    (p) => p.user._id === decodedUserJwt._id
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
  };

  try {
    await db
      .collection("games")
      .updateOne({ _id: ObjectId(gameId) }, { $set: game });
  } catch (_) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(200).json({ message: "Join Successful" });
}
