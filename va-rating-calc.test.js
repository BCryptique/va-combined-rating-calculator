// Run with: node va-rating-calc.test.js
const assert = require("node:assert/strict");
const calc = require("./va-rating-calc.js");

const cases = [
  // [ratings, expected exact, expected final]
  [[50, 30], 65, 70],           // VA's standard example: 65 rounds up to 70
  [[60, 40], 76, 80],
  [[50, 50, 50], 88, 90],       // 50 + 25 = 75; 75 + 12.5 -> 88
  [[10, 10, 10], 27, 30],       // 10 + 9 = 19; 19 + 8.1 -> 27
  [[100], 100, 100],
  [[0, 0], 0, 0],
  [[], 0, 0],
  [[20, 10], 28, 30],           // 20 + 8 = 28
  [[30, 20, 10], 50, 50],       // 30 + 14 = 44; 44 + 5.6 -> 50
  [[10, 10], 19, 20],           // 19 rounds to 20
  [[40, 20, 20], 66, 70],       // 40 + 12 = 52; 52 + 9.6 -> 62? checked below
];

// Replace the last case with a value computed by hand:
// 40; 40 + round(20*0.60)=12 -> 52; 52 + round(20*0.48)=round(9.6)=10 -> 62; final 60
cases[cases.length - 1] = [[40, 20, 20], 62, 60];

for (const [ratings, exact, final] of cases) {
  assert.equal(calc.combineExact(ratings), exact, "exact " + JSON.stringify(ratings));
  assert.equal(calc.combinedRating(ratings), final, "final " + JSON.stringify(ratings));
}

// Order must not matter.
assert.equal(calc.combinedRating([10, 50, 30]), calc.combinedRating([50, 30, 10]));

// Never goes over 100.
assert.equal(calc.combinedRating([90, 90, 90, 90]), 100);

// Bad input is rejected.
assert.throws(() => calc.combinedRating([101]), RangeError);
assert.throws(() => calc.combinedRating([-5]), RangeError);
assert.throws(() => calc.combinedRating(["50"]), RangeError);
assert.throws(() => calc.combinedRating("50"), TypeError);

// Bilateral factor: two 20% legs combine to 36, plus 10% (4) = 40.
// Then 40 combined with a 30% back: 40 + 18 = 58 -> 60.
const bi = calc.combinedWithBilateral({ pairedRatings: [20, 20], otherRatings: [30] });
assert.equal(bi.bilateralValue, 40);
assert.equal(bi.exact, 58);
assert.equal(bi.rating, 60);

// One paired rating is not bilateral.
const one = calc.combinedWithBilateral({ pairedRatings: [20], otherRatings: [30] });
assert.equal(one.bilateralValue, null);
assert.equal(one.rating, calc.combinedRating([30]));

console.log("All checks passed (" + cases.length + " rating cases plus order, cap, input, and bilateral checks).");
