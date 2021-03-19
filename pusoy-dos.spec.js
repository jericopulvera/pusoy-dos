const { isValidHand } = require("./lib/pusoy-dos");

test("Hand Validity", () => {
  // Empty hand is valid
  expect(isValidHand("")).toBeTruthy();

  // Straight and Flushes is Valid
  expect(isValidHand("Js Qs Ks As 2s")).toBeTruthy();
  expect(isValidHand("3s 4s 5s 6s 7s")).toBeTruthy();
  expect(isValidHand("3d Kd 5d Td 7d")).toBeTruthy();

  // No Wrapped Around Straight :(
  expect(isValidHand("Qs Kc Ah 2s 3d")).toBeFalsy();

  // 4 of a kind with kicker is allowed
  expect(isValidHand("As Ad Ac Ah 5s")).toBeTruthy();

  // 3 of a kind with kicker is not allowed
  expect(isValidHand("As Ad Ac 4s 5s")).toBeFalsy();

  // 2 pairs is not allowed
  expect(isValidHand("As Ad 2c 2s 5s")).toBeFalsy();
  expect(isValidHand("As Ad 2c 2s")).toBeFalsy();
});
