import { q, faunaDbClient } from "../../lib/faunadb";
import { cards, shuffle, compareHands } from "../../lib/pusoy-dos";
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

  if (game.status !== "waiting") {
    return res.status(403).json({ message: "Game already started" });
  }

  if (game.user.id !== decodedUserJwt.id) {
    return res.status(403).json({ message: "You're not the host" });
  }

  if (game.players.length === 1) {
    return res
      .status(403)
      .json({ message: "More than 1 player is required to start the game" });
  }

  let shuffledCards = shuffle(cards);
  let playerIndex = 0;

  for (
    let index = 0;
    index < shuffledCards.length - game.players.length;
    index++
  ) {
    const card = shuffledCards[index];

    game.players[playerIndex].cards[card] = {
      playedAt: null,
    };

    // If currentLowestCard wins against the card, set the current player in the loop as to move
    if (
      ["3c", "3s", "3h", "3d", "4c", "4s", "4h", "4d"].includes(card) &&
      compareHands(game.lowestCard, card)
    ) {
      game.playerToMove = game.players[playerIndex].user.id;
      game.lowestCard = card;
    }

    playerIndex++;
    if (playerIndex === game.players.length) {
      playerIndex = 0;
    }
  }

  try {
    game.status = "ongoing";
    await faunaDbClient.query(
      q.Update(q.Ref(q.Collection("games"), req.body.gameId), {
        data: game,
      })
    );
  } catch (_) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(200).json({ message: "Game started" });
}
