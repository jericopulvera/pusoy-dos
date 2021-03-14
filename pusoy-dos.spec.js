const {
  getHandDetails,
  compareHands,
  isValidHand,
} = require("./lib/pusoy-dos");

// console.log(isValidHand("") === true);
console.log(isValidHand("As Ad Ac 4s 5s") === false);
// console.log(isValidHand("As Ad 4s 4d") === false);
