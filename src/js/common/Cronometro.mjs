
export class Cronometro {
  constructor(name) {
    this.name = name;
  }
  tic() {
    this.ti = new Date().getTime();
    console.log(`Timer ${this.name}: start at ${this.ti}ms`);
  }
  toc() {
    const tf = new Date().getTime();
    const diff = (tf - this.ti);
    console.log(`Timer ${this.name}: spent ${diff}ms`);
    return diff;
  }
}
