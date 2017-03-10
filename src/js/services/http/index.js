import axios from 'axios'
import HttpFactory from './factory';
import { HttpError, RequestError, ResponseError } from './errors';
import { durationTime, easeCancelable, normalizeErrors } from './axios-plugins';

const { CancelToken, isCancel } = axios;

export default HttpFactory();
export {
  // errors
  HttpError,
  RequestError,
  ResponseError,

  // cancellations
  CancelToken,
  isCancel,

  // plugins
  durationTime,
  easeCancelable,
  normalizeErrors,
}
