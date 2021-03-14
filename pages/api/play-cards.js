import { q, faunaDbClient } from "../../lib/faunadb";
import { compareHands, isValidHand } from "../../lib/pusoy-dos";
import jwt from "jsonwebtoken";

const getNextPlayerToMove = (players, lastPlayerToMove) => {
  const lastPlayerToMoveIndex = players.findIndex(
    (p) => p.user.id === lastPlayerToMove
  );

  if (lastPlayerToMoveIndex === players.length - 1) {
    return players[0]?.user?.id;
  }

  return players[lastPlayerToMoveIndex + 1].user?.id;
};

const updateGame = async ({ game, res, decodedUserJwt, cards }) => {
  if (cards) {
    // Update cards
    const player = game.players.find((p) => p.user.id === decodedUserJwt.id);
    cards.split(" ").forEach((card) => {
      player.cards[card] = { playedAt: new Date().toISOString() };
    });

    // If current player cards is used update status to ended
    if (
      Object.entries(player.cards).filter((c) => !c[1].playedAt).length === 0
    ) {
      game.status = "ended";
    }
  }

  try {
    await faunaDbClient.query(
      q.Update(q.Ref(q.Collection("games"), game?.id), {
        data: { ...game },
      })
    );

    // Hide other players cards
    game.players = game.players.map((p) => {
      if (p.user.id === decodedUserJwt?.id) return p;

      return {
        ...p,
        cards: Object.entries(p.cards).filter((c) => !c[1].playedAt).length,
      };
    });

    return res.status(200).json(game);
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
    game.tableHand = null;
    return updateGame({ game, res, decodedUserJwt, cards });
  }

  // If a player pass
  if (!cards) {
    return updateGame({ game, res, decodedUserJwt, cards });
  }

  // If table hand is empty can play any cards
  if (!game?.tableHand) {
    game.tableHand = {
      userId: decodedUserJwt.id,
      createdAt: new Date().toISOString(),
      cards,
    };

    return updateGame({ game, res, decodedUserJwt, cards });
  }

  // If table hand is not empty can only play cards in higher card in same rank
  if (compareHands(game.tableHand.cards, cards)) {
    return res.status(403).json({
      message:
        "Played cards must be a higher combination in the same amount of cards",
    });
  }

  game.tableHand = {
    userId: decodedUserJwt.id,
    createdAt: new Date().toISOString(),
    cards,
  };

  return updateGame({ game, res, decodedUserJwt, cards });
}
