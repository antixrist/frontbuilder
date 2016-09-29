import _ from 'lodash';
import glob from 'glob';
import path from 'path';

const cwd = process.cwd();

/**
 * @param pattern
 * @param {string|function} [context]
 * @param {function} [cb]
 * @returns {Promise}
 */
export function entriesFinder (pattern, context = cwd, cb = () => {}) {
  if (_.isFunction(context)) {
    cb = context;
    context = cwd;
  }

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

/**
 * @param pattern
 * @param {string} [context]
 * @returns {[]|{}}
 */
entriesFinder.sync = function (pattern, context = cwd) {
  return changeFilesArrayToWebpackFormat(glob.sync(pattern, context));
};

export function insertHMREtriesToAppEntries (appEntries = [], hmrEntries = [], context = cwd) {
  if (_.isString(appEntries)) {
    return insertHMREtriesToAppEntries([appEntries], hmrEntries, context);
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

function changeFilesArrayToWebpackFormat (files, context = cwd) {
  files = files ? files : [];
  files = _.isArray(files) ? files : [files];

  return files.reduce((entries, file) => {
    let entry    = path.basename(file, path.extname(file));
    let filename = path.resolve(context, file);
    let filenameRelativeToCwd = path.relative(context, filename);
    entries[entry] = `./${filenameRelativeToCwd}`;

    return entries;
  }, {});
}
