import { api, storage } from '../';

const actions = {
  async initApp ({ state, commit, dispatch }) {
    let retVal;
    const token = storage.get('token');

    if (!token) {
      retVal = await dispatch('account/logout');
    } else {
      retVal = await dispatch('account/get');
    }

    return retVal;
  }
};

export default actions;
