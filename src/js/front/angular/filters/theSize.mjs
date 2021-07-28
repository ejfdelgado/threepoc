export function theSize() {
  return (input) => {
    if (input instanceof Array) {
      return input.length;
    } else if (typeof input == "object") {
      return Object.keys(input).length;
    }
  };
}
