abstract class AbstractError {
  constructor(public code: number, public message: string) {}

  toString() {
    return `${ this.constructor.name } (${ this.code }): ${ this.message }`;
  }

  toJSON() {
    return JSON.stringify({
      message: this.message,
      code: this.code
    });
  }
}

export class CustomError extends AbstractError {
}

export class NotFoundError extends AbstractError {
  constructor(code, message = 'Device not found') {super(code, message);}
}

export class ControllerError extends AbstractError {
}

export class UnsupportedKeyError extends AbstractError {
  constructor(code, message = 'Unsupported Key Type') {super(code, message);}
}
