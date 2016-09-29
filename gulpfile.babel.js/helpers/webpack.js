import _ from 'lodash';
import glob from 'glob';
import path from 'path';

const cwd = process.cwd();

export function entriesFinder (pattern, cb = () => {}) {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, function (err, files) {
      if (err) {
        cb(err);
        return reject(err);
      }

      files = files ? files : [];
      files = Array.isArray(files) ? files : [files];

      let entries = changeFilesArrayToWebpackFormat(files);

      cb(null, entries);
      resolve(entries);
    })
  });
}

entriesFinder.sync = function (pattern) {
  return changeFilesArrayToWebpackFormat(glob.sync(pattern));
};

export function insertHMREtriesToAppEntries (appEntries = [], hmrEntries = []) {
  if (_.isString(appEntries)) {
    return insertHMREtriesToAppEntries([appEntries], hmrEntries);
  } else
  if (_.isArray(appEntries)) {
    appEntries = hmrEntries.concat(_.clone(appEntries));
  } else
  if (_.isPlainObject(appEntries)) {
    appEntries = _.clone(appEntries);
    _.forEach(appEntries, (entry, name) => {
      appEntries[name] = hmrEntries.concat(entry);
    });
  }

  return appEntries;
}

function changeFilesArrayToWebpackFormat (files) {
  return files.reduce((entries, file) => {
    let entry      = path.basename(file, path.extname(file));
    entries[entry] = path.basename(file); // здесь надо зарезолвить fullpath от cwd

    return entries;
  }, {});
}
