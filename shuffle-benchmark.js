// prettier-ignore
let cards = [
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

function shuffle2(array) {
  var copy = [],
    n = array.length,
    i;

  // While there remain elements to shuffle…
  while (n) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
}

function shuffle3(array) {
  var copy = [],
    n = array.length,
    i;

  // While there remain elements to shuffle…
  while (n) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * n--);

    // And move it to the new array.
    copy.push(array.splice(i, 1)[0]);
  }

  return copy;
}

console.time("shuffle1");
cards = shuffle(cards);
console.timeEnd("shuffle1");

console.log(cards.length);
console.time("shuffle2");
cards = shuffle2(cards);
console.timeEnd("shuffle2");

console.log(cards.length);
console.time("shuffle3");
cards = shuffle3(cards);
console.timeEnd("shuffle3");

console.log(cards.length);
