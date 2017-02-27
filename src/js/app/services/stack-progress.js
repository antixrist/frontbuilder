import _ from 'lodash';

const noopProgress = { start: _.noop, done: _.noop };

/** Статусбар для запросов к апи */
export default class StackProgress {

  constructor (...args) {
    this.requests = [];
    this.setProgress();
  }

  setProgress (progress = noopProgress) {
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
