class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class NoAutorizadoException extends ExtendableError {}
export class NoExisteException extends ExtendableError {}
export class ParametrosIncompletosException extends ExtendableError {}
export class NoHayUsuarioException extends ExtendableError {}
export class MalaPeticionException extends ExtendableError {}
export class InesperadoException extends ExtendableError {}


