import ExtendableError from 'es6-error';

export class HttpError extends ExtendableError {}
export class RequestError extends HttpError {}
export class ResponseError extends HttpError {}
