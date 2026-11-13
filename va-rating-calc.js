// Combined disability rating math from 38 CFR 4.25 (combined ratings table)
// and 4.26 (bilateral factor). Works in the browser and in Node.
//
// This is an estimate tool. VA decides the real rating after an exam and a
// review of records. It rates only conditions that VA finds connected to service.

(function (root) {
  "use strict";

  // Round half up to a whole number (VA rounds each combined step this way).
  function roundHalfUp(n) {
    return Math.floor(n + 0.5);
  }

  function checkRatings(ratings) {
    if (!Array.isArray(ratings)) throw new TypeError("ratings must be an array");
    ratings.forEach(function (r) {
      if (!Number.isFinite(r) || r < 0 || r > 100) {
        throw new RangeError("each rating must be a number from 0 to 100: " + r);
      }
    });
  }

  // Combine ratings the way 4.25 does: start with the highest, then apply each
  // next rating to the part of the person that is still "not disabled."
  // Returns the exact combined value rounded to a whole number (before the
  // final round to the nearest 10).
  function combineExact(ratings) {
    checkRatings(ratings);
    var sorted = ratings.slice().sort(function (a, b) { return b - a; });
    var combined = 0;
    sorted.forEach(function (r) {
      combined = combined + roundHalfUp(r * (100 - combined) / 100);
    });
    return Math.min(combined, 100);
  }

  // Final combined rating: round to the nearest 10; 5 rounds up (4.25).
  function combinedRating(ratings) {
    var exact = combineExact(ratings);
    return Math.min(100, Math.floor((exact + 5) / 10) * 10);
  }

  // Bilateral factor (4.26): ratings for paired limbs (both arms, both legs)
  // combine first, then 10 percent of that value is added, and the result
  // counts as one rating with the rest.
  // input: { pairedRatings: [..], otherRatings: [..] }
  function combinedWithBilateral(input) {
    var paired = input.pairedRatings || [];
    var other = input.otherRatings || [];
    checkRatings(paired);
    checkRatings(other);
    if (paired.length < 2) {
      return { exact: combineExact(other), rating: combinedRating(other), bilateralValue: null };
    }
    var pairedCombined = combineExact(paired);
    var bilateralValue = Math.min(100, pairedCombined + roundHalfUp(pairedCombined * 0.1));
    var all = other.concat([bilateralValue]);
    var exact = combineExact(all);
    return {
      exact: exact,
      rating: Math.min(100, Math.floor((exact + 5) / 10) * 10),
      bilateralValue: bilateralValue
    };
  }

  var api = {
    combineExact: combineExact,
    combinedRating: combinedRating,
    combinedWithBilateral: combinedWithBilateral
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.VARatingCalc = api;
})(typeof window !== "undefined" ? window : this);
