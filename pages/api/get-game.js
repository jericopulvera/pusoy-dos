import { q, faunaDbClient } from "../../lib/faunadb";
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
    const queryResponse = await faunaDbClient.query(
      q.Get(q.Ref(q.Collection("games"), gameId))
    );

    game = {
      id: queryResponse.ref.id,
      ...queryResponse.data,
    };
  } catch (error) {
    return res.status(404).json({ message: "Not Found" });
  }

  game = {
    ...game,
    players: game.players.map((p) => {
      if (p.user.id === decodedUserJwt?.id) return p;
      return {
        ...p,
        cards: [],
      };
    }),
  };

  return res.status(200).json({ game });
}
