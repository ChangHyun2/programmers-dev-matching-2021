import TypeError from './TypeError.js';

// https://javascript.info/custom-errors
export default class ApiError extends TypeError {
  constructor(message, type, status) {
    super(message, type);
    this.status = status;
  }
}
