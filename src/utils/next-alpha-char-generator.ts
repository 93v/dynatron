const getNextKey = (key: string): string => {
  if (key === "") {
    return "a";
  }

  if (key === "Z" || key === "z") {
    return (
      String.fromCharCode(key.charCodeAt(0) - 25) +
      String.fromCharCode(key.charCodeAt(0) - 25)
    );
  }

  const lastChar = key.slice(-1);
  const sub = key.slice(0, -1);
  return lastChar === "Z" || lastChar === "z"
    ? getNextKey(sub) + String.fromCharCode(lastChar.charCodeAt(0) - 25)
    : sub + String.fromCharCode(lastChar.charCodeAt(0) + 1);
};

class NextAlphaCharGenerator {
  #currentLetter: string;

  constructor() {
    this.#currentLetter = "";
  }

  getNext() {
    this.#currentLetter = getNextKey(this.#currentLetter);
    return this.#currentLetter;
  }

  reset() {
    this.#currentLetter = "";
  }
}

const nextAlpha = new NextAlphaCharGenerator();

Object.freeze(nextAlpha);

export default nextAlpha;
