import { makeAlphabetCombinationsIterator } from "../combinator";

describe("combinaisons", () => {
  it(`should make an alphabet combinations iterator`, () => {
    const iterator = makeAlphabetCombinationsIterator(["a", "b", "c"], 1, 3);

    let iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.length).toEqual(1);
    expect(iteration.value).toEqual(["a", "b", "c"]);

    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.length).toEqual(2);
    expect(iteration.value).toEqual(["aa", "ab", "ac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["ba", "bb", "bc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["ca", "cb", "cc"]);

    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.length).toEqual(3);
    expect(iteration.value).toEqual(["aaa", "aab", "aac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["aba", "abb", "abc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["aca", "acb", "acc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["baa", "bab", "bac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["bba", "bbb", "bbc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["bca", "bcb", "bcc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["caa", "cab", "cac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["cba", "cbb", "cbc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(true);
    expect(iteration.value).toEqual(["cca", "ccb", "ccc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(true);
  });

  it(`should make an alphabet combinations iterator which skip length 1 and 2`, () => {
    const iterator = makeAlphabetCombinationsIterator(["a", "b", "c"], 3, 3);

    let iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.length).toEqual(3);
    expect(iteration.value).toEqual(["aaa", "aab", "aac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["aba", "abb", "abc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["aca", "acb", "acc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["baa", "bab", "bac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["bba", "bbb", "bbc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["bca", "bcb", "bcc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["caa", "cab", "cac"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(false);
    expect(iteration.value).toEqual(["cba", "cbb", "cbc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(true);
    expect(iteration.value).toEqual(["cca", "ccb", "ccc"]);
    iteration = iterator.next();
    expect(iteration.done).toBe(true);
  });

  it(`should throw if start length is greater than max length`, () => {
    expect(() =>
      makeAlphabetCombinationsIterator(["a", "b", "c"], 4, 3),
    ).toThrow(
      "startLength (4 given) must be less or equal to maxLength (3 given)",
    );

    expect(() => makeAlphabetCombinationsIterator(["a", "b", "c"], 13)).toThrow(
      "startLength (13 given) must be less or equal to maxLength (12 given)",
    );
  });
});