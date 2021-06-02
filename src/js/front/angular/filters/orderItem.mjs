export function orderItem() {
  return (input) => {
    const result = [];
    if ([null, undefined].indexOf(input) >= 0) {
      return result;
    }
    const llaves = Object.keys(input);
    for (let i = 0; i < llaves.length; i++) {
      const llave = llaves[i];
      result.push(input[llave]);
    }
    result.sort(function (a, b) {
      if (a.order > b.order) {
        return 1;
      } else {
        return -1;
      }
    });
    return result;
  };
}
