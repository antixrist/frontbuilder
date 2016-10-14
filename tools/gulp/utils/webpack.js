import * as _ from 'lodash';
import glob from 'glob';
import path from 'path';

const cwd = process.cwd();

/**
 * По паттерну в заданной директории ищет нужные файлы
 * и возвращает их в пригодном для webpack'а формате
 *
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

      let entries = changeFilesArrayToWebpackFormat(files, context);

      cb(null, entries);
      resolve(entries);
    })
  });
}

/**
 * По паттерну в заданной директории синхронно ищет нужные файлы
 * и возвращает их в пригодном для webpack'а формате
 *
 * @param pattern
 * @param {string} [context]
 * @returns {[]|{}}
 */
entriesFinder.sync = function (pattern, context = cwd) {
  return changeFilesArrayToWebpackFormat(glob.sync(pattern, context));
};

/**
 * На входе список точек входа в любом формате.
 * На выходе - тот же самый список,
 * только к каждой точке входа будет добавлен список hmr-магии.
 * ['webpack/hot/only-dev-server', 'webpack-hot-middleware/client?reload=true', 'myEntryFile.js']
 *
 * @param {string|[]|{}} appEntries
 * @param {[]} [hmrEntries]
 * @param {string} [context]
 * @returns {Array}
 */
export function insertHMREntriesToAppEntries (appEntries = [], hmrEntries = [], context = cwd) {
  if (_.isString(appEntries)) {
    return insertHMREntriesToAppEntries([appEntries], hmrEntries, context);
  } else
  if (_.isArray(appEntries)) {
    appEntries = hmrEntries.concat(appEntries);
  } else
  if (_.isPlainObject(appEntries)) {
    appEntries = _.clone(appEntries);
    _.forEach(appEntries, (entry, name) => {
      appEntries[name] = hmrEntries.concat(entry);
    });
  }

  return appEntries;
}

/**
 * На вход получает список файлов,
 * на выход отдаёт список (plain object) именованных точек входа
 * (имя точки входа == имя файла без расширения)
 *
 * @param {|string[]} files
 * @param {string} [context]
 * @returns {{}}
 */
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
