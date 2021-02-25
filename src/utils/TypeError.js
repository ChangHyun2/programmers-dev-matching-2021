// https://javascript.info/custom-errors
export default class TypeError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type;
  }
}
