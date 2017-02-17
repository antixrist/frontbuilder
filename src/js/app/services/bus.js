import EE from 'events';

EE.factory = function factory (opts = {}) {
  return new EE;
};

export default new EE;
