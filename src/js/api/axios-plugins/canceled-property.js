import { isCancel } from 'axios';

canceledProperty.destroy = destroy;

/**
 * @param instance
 * @param {{}} [opts]
 * @returns {*}
 */
export default function canceledProperty (instance, opts = {
  propertyName: 'isCanceled'
}) {
  Object.defineProperties(instance, {
    canceledProperty: {
      enumerable: false,
      value: {}
    }
  });
  
  instance.canceledProperty.interceptors = {};

  instance.canceledProperty.interceptors.request = instance.interceptors.request.use(
    requestInterceptorResolve,
    requestInterceptorReject
  );

  instance.canceledProperty.interceptors.response = instance.interceptors.response.use(
    responseInterceptorResolve,
    responseInterceptorReject
  );

  return instance;
  
  function requestInterceptorResolve (config) {
    return config;
  }
  
  function requestInterceptorReject (err) {
    writeIsCanceledProperty(err, opts.propertyName);
    
    return Promise.reject(err);
  }
  
  function responseInterceptorResolve (res) {
    return res;
  }
  
  function responseInterceptorReject (err) {
    writeIsCanceledProperty(err, opts.propertyName);
    
    return Promise.reject(err);
  }
}

export function destroy (instance) {
  if (!instance.canceledProperty) { return instance; }
  
  instance.interceptors.request.eject(instance.canceledProperty.interceptors.request);
  instance.interceptors.response.eject(instance.canceledProperty.interceptors.response);

  delete instance.canceledProperty;

  return instance;
}

function writeIsCanceledProperty (err, flagName) {
  flagName && Object.defineProperties(err, {
    [flagName]: {
      writable: false,
      value: isCancel(err)
    }
  });
}
