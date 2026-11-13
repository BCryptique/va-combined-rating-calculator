# VA combined rating calculator

A small, dependency-free JavaScript library that calculates a VA combined disability rating. It follows 38 CFR 4.25 (combined ratings) and 4.26 (bilateral factor). It runs in a browser and in Node.

**This is an estimate tool, not legal or benefits advice.** VA decides the real rating after an exam and a review of records, and it rates only conditions that VA finds connected to service.

## Usage

```js
const calc = require("./va-rating-calc.js");

calc.combinedRating([50, 30]);   // 70
calc.combinedRating([30, 20]);   // 40 (exact value 44, rounded to the nearest 10)

// Paired limbs get the bilateral factor first:
calc.combinedWithBilateral({ pairedRatings: [20, 10], otherRatings: [30] });
// { exact, rating, bilateralValue }
```

## How it works

1. Sort the ratings from highest to lowest.
2. Apply each rating to the part of the person that is still "not disabled", rounding half up at each step.
3. Round the final value to the nearest 10. A 5 rounds up.
4. For bilateral conditions, combine the paired ratings first, add 10 percent of that value, and treat the result as one rating.

## Tests

```
node va-rating-calc.test.js
```

The tests cover known combinations, ordering, the 100 percent cap, input validation, and the bilateral case. I also checked these combinations against the published VA combined ratings table: 50 and 30 give 70, 60 and 40 give 80, 10 and 10 give 20, 70 and 50 give 90, 90 and 90 give 100, 30 and 20 give 40, and 40 and 40 give 60.

## Data files

- `va-criteria.json`: musculoskeletal rating criteria from 38 CFR 4.71a, with the source link and the date I read it.
- `va-pay-2026.json`: VA compensation rates effective December 1, 2025. VA updates these each December 1, so check [the VA rates page](https://www.va.gov/disability/compensation-rates/veteran-rates/) before you rely on them.

## License

PolyForm Noncommercial 1.0.0. You can read, run, and learn from this code, and use it for personal, educational, and charitable purposes. You can't sell it or use it in a commercial product. For other uses, contact me through GitHub.
