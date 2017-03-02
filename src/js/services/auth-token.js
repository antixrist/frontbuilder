import { API_TOKEN_NAME } from '../config';
import defaultStorage from './storage';

const tokenName = API_TOKEN_NAME || 'api_token';

class AuthToken {
  constructor (storage = defaultStorage) {
    this.storage = storage;
  }

  save (token = '') {
    return this.storage.set(tokenName, token);
  }

  remove () {
    return this.storage.remove(tokenName);
  }

  get () {
    return this.storage.get(tokenName);
  }
}

const token = new AuthToken();

token.factory = function (...args) {
  return new AuthToken(...args);
};

export default token;
