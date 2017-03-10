import _NProgress from 'nprogress';

/** Статусбар для запросов к апи */

/**
 * @augments NProgress
 */
export default class NProgressStack {
  static get defaults () {
    return {
      latencyThreshold: 100,
      speed: 500,
      easing: 'ease-out',
      showSpinner: false
    };
  };

  constructor (opts = {}) {
    opts = Object.assign({}, NProgressStack.defaults, opts);

    this.configure(opts);

    this.requestsTotal = 0;
    this.requestsCompleted = 0;
  }

  complete () {
    this.requestsTotal = 0;
    this.requestsCompleted = 0;
    this.done();
  }

  requestStart () {
    if (0 === this.requestsTotal) {
      setTimeout(() => this.start(), this.latencyThreshold);
    }

    this.requestsTotal++;
    this.set(this.requestsCompleted / this.requestsTotal);
  }

  requestDone () {
    // Finish progress bar 50 ms later
    setTimeout(() => {
      ++this.requestsCompleted;
      if (this.requestsCompleted >= this.requestsTotal) {
        this.complete();
      } else {
        this.set((this.requestsCompleted / this.requestsTotal) - 0.1);
      }
    }, this.latencyThreshold + 50)
  }
}

Object.assign(NProgressStack.prototype, _NProgress);
