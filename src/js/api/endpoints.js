import _ from 'lodash';
import { compile } from 'path-to-regexp';

export default {
  LOGIN: '/login',

  LOGOUT: '/logout',

  REPORT_ERROR: {
    url: '/report-error',
    request: config => _.merge(config, {
      silent: true,
      data: {
        userAgent: navigator.userAgent,
        location: document.location.href,
      }
    })
  },

  TREE: {
    url: '/tree',

  },

  USER_GET: {
    url: '/user/get',
    request (config) {


    }
  },


  // PROJECTS_TREE
};