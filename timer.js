/*
 * Timer is a helper object that tracks time elapsed. It is stateful.
 */
export default class Timer {
  constructor() {
    this._startTime = new Date();
  }

  printTimeSinceLastCheck() {
    return this.timeSinceLastCheck() + "ms";
  }

  timeSinceLastCheck() {
    const lastCheck = this._lastCheck;
    this._lastCheck = new Date();
    if (!lastCheck) {
      return this.totalTime();
    } else {
      return new Date() - lastCheck;
    }
  }

  totalTime() {
    return new Date() - this._startTime;
  }
}
