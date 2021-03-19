// prettier-ignore
const cards = [
  '3c', '3s', '3h', '3d',
  '4c', '4s', '4h', '4d',
  '5c', '5s', '5h', '5d',
  '6c', '6s', '6h', '6d',
  '7c', '7s', '7h', '7d',
  '8c', '8s', '8h', '8d',
  '9c', '9s', '9h', '9d',
  'Tc', 'Ts', 'Th', 'Td',
  'Jc', 'Js', 'Jh', 'Jd',
  'Qc', 'Qs', 'Qh', 'Qd',
  'Kc', 'Ks', 'Kh', 'Kd',
  'Ac', 'As', 'Ah', 'Ad',
  '2c', '2s', '2h', '2d',
]

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
  //Also handle low straight
  const lowStraight = faces.join("") === "AJKLM";
  faces[0] = lowStraight ? "N" : faces[0];
  const straight =
    lowStraight || faces.every((f, index) => f.charCodeAt(0) - first === index);

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
        if (!currentHighest) return suitsRanking[s.toUpperCase()];
        if (currentHighest > suitsRanking[s.toUpperCase()])
          return suitsRanking[s.toUpperCase()];
        return currentHighest;
      }, null),
  };

  function byCountFirst(a, b) {
    //Counts are in reverse order - bigger is better
    const countDiff = counts[b] - counts[a];
    if (countDiff) return countDiff; // If counts don't match return
    return b > a ? -1 : b === a ? 0 : 1;
  }
}

function count(c, a) {
  c[a] = (c[a] || 0) + 1;
  return c;
}

function compareHands(h1, h2) {
  let d1 = getHandDetails(h1);
  let d2 = getHandDetails(h2);

  if (d1.value.length !== d2.value.length) {
    return true;
  }

  if (d1.suitRank && d2.suitRank && d1.value === d2.value) {
    return d1.suitRank < d2.suitRank;
  }

  if (d1.rank === d2.rank) {
    return d1.value < d2.value;
  }

  return d1.rank < d2.rank;
}

function isValidHand(hand) {
  const cards = hand.split(" ");
  const faces = cards
    .map((a) => String.fromCharCode([77 - order.indexOf(a[0])]))
    .sort();

  const suits = cards.map((a) => a[1]).sort();
  const counts = faces.reduce(count, {});

  const duplicates = Object.values(counts).reduce(count, {});
  const flush = suits[0] === suits[4];
  const first = faces[0].charCodeAt(0);
  //Also handle low straight
  const lowStraight = faces.join("") === "AJKLM";
  faces[0] = lowStraight ? "N" : faces[0];
  const straight =
    lowStraight || faces.every((f, index) => f.charCodeAt(0) - first === index);

  // Empty hands is valid for passing
  if (!hand) return true;

  // Flush and Straight is Valid
  if (flush || straight) return true;

  // Full house is allowed
  if (duplicates[3] && duplicates[2]) return true;

  // 3 of a Kind with Kicker is not allowed
  if (duplicates[3] && duplicates[1]) {
    return false;
  }

  // 2 Pairs is not allowed
  if (duplicates[2] > 1 && !duplicates[3]) {
    return false;
  }

  // Pair with kicker is not allowed
  if (duplicates[2] === 1 && cards.length > 2) {
    return false;
  }

  // Cards with no combination is not allowed
  if (duplicates[1] > 1) {
    return false;
  }

  return true;
}

function shuffle(array) {
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

module.exports = {
  cards,
  order,
  getHandDetails,
  compareHands,
  isValidHand,
  shuffle,
};
