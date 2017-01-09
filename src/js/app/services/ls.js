import localStore from 'local-storage';

export default {
  get (key, defaultVal = null) {
    const val = localStore(key);
    
    return val || defaultVal;
  },
  
  set (key, val) {
    return localStore(key, val);
  },
  
  remove (key) {
    return localStore.remove(key);
  },
  
  clear () {
    return localStore.clear();
  }
};
