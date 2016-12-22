import _ from 'lodash';

process = process || {};
_.set(process, 'env.NODE_ENV', _.get(process, 'env.NODE_ENV') || 'development');

const { NODE_ENV }   = process.env.NODE_ENV;
const isProduction   = process.env.NODE_ENV == 'production';
const isDevelopment  = process.env.NODE_ENV == 'development';

export {
  NODE_ENV,
  isProduction,
  isDevelopment,
};
