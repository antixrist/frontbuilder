import _ from 'lodash';

export default {
  isProduction: _.trim(process.env.NODE_ENV) == 'production'
};
