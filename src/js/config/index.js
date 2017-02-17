const { NODE_ENV }   = process.env.NODE_ENV;
const isProduction   = process.env.NODE_ENV == 'production';
const isDevelopment  = process.env.NODE_ENV == 'development';

export {
  NODE_ENV,
  isProduction,
  isDevelopment,
};
