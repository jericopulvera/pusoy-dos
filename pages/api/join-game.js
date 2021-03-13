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

  let game;
  try {
    const queryResponse = await faunaDbClient.query(
      q.Get(q.Ref(q.Collection("games"), req.body.gameId))
    );

    game = {
      id: queryResponse.ref.id,
      ...queryResponse.data,
    };
  } catch (error) {
    return res.status(404).json({ message: "Not Found" });
  }

  const userJoinedTheGame = game.players.find(
    (p) => p.user.id === decodedUserJwt.id
  );

  if (userJoinedTheGame) {
    return res.status(422).json({ message: "You already joined the game" });
  }

  game = {
    ...game,
    players: [
      ...game.players,
      {
        user: decodedUserJwt,
      },
    ],
  };

  try {
    await faunaDbClient.query(
      q.Update(q.Ref(q.Collection("games"), req.body.gameId), {
        data: game,
      })
    );
  } catch (_) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(200).json({ message: "Join Successful" });
}
