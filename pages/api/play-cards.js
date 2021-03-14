import { q, faunaDbClient } from "../../lib/faunadb";
import { getHandDetails, compareHands, isValidHand } from "../../lib/pusoy-dos";
import jwt from "jsonwebtoken";

const getNextPlayerToMove = (players, lastPlayerToMove) => {
  const lastPlayerToMoveIndex = players.findIndex(
    (p) => p.user.id === lastPlayerToMove
  );

  if (lastPlayerToMoveIndex === players.length - 1) {
    return players[0];
  }

  return players[lastPlayerToMoveIndex + 1];
};

const updateGame = async (game, res) => {
  try {
    await faunaDbClient.query(
      q.Update(q.Ref(q.Collection("games"), req.body.gameId), {
        data: game,
      })
    );

    return res.status(200).json({ game });
  } catch (_) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

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

  if (game.status !== "ongoing") {
    return res.status(403).json({ message: "Game is not ongoing" });
  }

  const userIsInTheGame = game.players.some(
    (p) => p.user.id === decodedUserJwt.id
  );

  if (!userIsInTheGame) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (game.playerToMove !== decodedUserJwt.id) {
    return res.status(403).json({ message: "Not your turn yet" });
  }

  const { cards } = req.body;

  if (game.moveCount === 0 && !cards.includes(game.lowestCard)) {
    return res
      .status(403)
      .json({ message: "Lowest card must be included in the first move" });
  }

  if (!isValidHand(cards)) {
    return res.status(403).json({ message: "Cards is not valid" });
  }

  game.playerToMove = getNextPlayerToMove(game.players, game.playerToMove);
  game.moveCount = game.moveCount + 1;

  // If we did a round trip of pass
  if (!cards && game.playerToMove === game.tableHand.userId) {
    game.tableHand = {};

    return updateGame(game, res);
  }

  // If a player pass
  if (!cards) {
    return updateGame(game, res);
  }

  // If table hand is empty can play any cards
  if (Object.keys(game.tableHand).length === 0) {
    game.tableHand = {
      userId: decodedUserJwt.id,
      createdAt: new Date().toISOString(),
      cards,
    };

    return updateGame(game);
  }

  // If table hand is not empty can only play cards in higher card in same rank
  if (compareHands(game.tableHand.cards, cards)) {
    return res.status(403).json({
      message: "Played cards must be a higher card in same combination",
    });
  }

  game.tableHand = {
    userId: decodedUserJwt.id,
    createdAt: new Date().toISOString(),
    cards,
  };

  return updateGame(game);
}
