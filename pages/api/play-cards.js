// 2 pair is not allowed
// Three of a Kind extra card not allowed
// Four of a Kind allows for a kicker
// Cannot Play Higher Rank Card when a card is on the table

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  res.status(200).json({ name: "John Doe" });
};
