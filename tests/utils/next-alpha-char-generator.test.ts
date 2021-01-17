import nextAlpha from "../../src/utils/next-alpha-char-generator";

describe("Next Alpha Char Generator", () => {
  test("should return the alphabet sequentially and then the double", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    for (const letter of alphabet) {
      expect(nextAlpha.getNext()).toBe(letter);
    }
  });

  test("should return the double alphabet sequentially", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    for (const letter of alphabet) {
      for (const innerLetter of alphabet) {
        expect(nextAlpha.getNext()).toBe(letter + innerLetter);
      }
    }
  });

  test("should reset and return 'a' on next call", () => {
    nextAlpha.reset();
    expect(nextAlpha.getNext()).toBe("a");
  });
});
