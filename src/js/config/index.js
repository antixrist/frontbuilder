export const { NODE_ENV, API_URL } = process.env;
export const isProduction  = process.env.NODE_ENV == 'production';
export const isDevelopment = process.env.NODE_ENV == 'development';
