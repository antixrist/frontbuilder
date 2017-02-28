import _ from 'lodash';
import Vue from 'vue';
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

export class ProgressStack {

  constructor () {
    this.items   = [];
    this.percent = 0;
    this.max     = 0;

    this.setProgress();
  }

  setProgress (progress = NProgress) {
    this.progress = progress;
  }

  add (item) {
    this.max++;
    if (!this.items.length) {
      this.percent = 0;
      this.progress.set(this.percent);
    }

    this.items.push(item);

    // console.log(`add. percent: ${this.percent}, max: %d, length: %d`, this.max, this.items.length);
  }

  done (item) {
    let removed = [];
    const idx = this.items.indexOf(item);
    if (!!~idx) {
      removed = _.pullAt(this.items, idx);
    }
    if (!removed.length) { return; }

    // console.log('done. length: %d', this.items.length);

    if (!this.items.length) {
      this.percent = 1;
      this.max = 0;
    } else {
      this.percent = (this.max - this.items.length) / this.max;
    }

    // console.log(`done. percent: ${this.percent}, max: %d`, this.max);

    this.progress.set(this.percent);
  }
}
