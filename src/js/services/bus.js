import EE from 'events';

EE.factory = function factory (...args) {
  return new EE(...args);
};

export default new EE;
