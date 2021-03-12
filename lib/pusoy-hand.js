const order = "3456789TJQKA2";

const suitsRanking = {
  D: 1,
  H: 2,
  S: 3,
  C: 4,
};

function getHandDetails(hand) {
  const cards = hand.split(" ");
  const faces = cards
    .map((a) => String.fromCharCode([77 - order.indexOf(a[0])]))
    .sort();
  const suits = cards.map((a) => a[1]).sort();
  const counts = faces.reduce(count, {});
  const duplicates = Object.values(counts).reduce(count, {});
  const flush = suits[0] === suits[4];
  const first = faces[0].charCodeAt(0);

  const straight =
    cards.length === 5 &&
    faces.every((f, index) => f.charCodeAt(0) - first === index);

  let rank =
    (flush && straight && 1) ||
    (duplicates[4] && 2) ||
    (duplicates[3] && duplicates[2] && 3) ||
    (flush && 4) ||
    (straight && 5) ||
    (duplicates[3] && 6) ||
    (duplicates[2] > 1 && 7) ||
    (duplicates[2] && 8) ||
    9;

  return {
    rank,
    value: faces.sort(byCountFirst).join(""),
    suitRank:
      [8, 9].includes(rank) &&
      suits.reduce((currentHighest, s) => {
        if (!currentHighest) return suitsRanking[s];
        if (currentHighest > suitsRanking[s]) return suitsRanking[s];
        return currentHighest;
      }, null),
  };

  function byCountFirst(a, b) {
    //Counts are in reverse order - bigger is better
    const countDiff = counts[b] - counts[a];
    if (countDiff) return countDiff; // If counts don't match return
    return b > a ? -1 : b === a ? 0 : 1;
  }

  function count(c, a) {
    c[a] = (c[a] || 0) + 1;
    return c;
  }
}

function compareHands(h1, h2) {
  let d1 = getHandDetails(h1);
  let d2 = getHandDetails(h2);

  if (d1.suitRank && d2.suitRank) {
    if (d1.suitRank < d2.suitRank) {
      return "WIN";
    }
    return "LOSE";
  }

  if (d1.rank === d2.rank) {
    if (d1.value < d2.value) {
      return "WIN";
    } else if (d1.value > d2.value) {
      return "LOSE";
    } else {
      return "DRAW";
    }
  }
  return d1.rank < d2.rank ? "WIN" : "LOSE";
}

module.exports = {
  getHandDetails,
  compareHands,
};
