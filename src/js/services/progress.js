import _ from 'lodash';
import NProgress from 'nprogress';

NProgress.configure({
  speed: 500,
  easing: 'ease-out',
  showSpinner: false
});

NProgress.factory = function factory (opts = {}) {
  return NProgress.configure(opts);
};

export default NProgress;

/** Статусбар для запросов к апи */

const noopProgress = { start: _.noop, done: _.noop };

export class ProgressStack {

  constructor () {
    this.requests = [];
    this.setProgress();
  }

  setProgress (progress = NProgress) {
    this.progress = progress;
  }

  add (item) {
    this.requests.push(item);

    if (this.requests.length == 1) { this.progress.start(); }
  }

  done (item, force = false) {
    _.pull(this.requests, item);

    if (!this.requests.length) { this.progress.done(force); }
  }
}
