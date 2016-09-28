import glob from 'glob';
import path from 'path';

export function entriesFinder (pattern, cb = () => {}) {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, function (err, files) {
      if (err) {
        cb(err);
        return reject(err);
      }

      files = files ? files : [];
      files = Array.isArray(files) ? files : [files];

      let entries = files.reduce((entries, file) => {
        let entry      = path.basename(file, path.extname(file));
        entries[entry] = path.basename(file);

        return entries;
      }, {});

      cb(null, entries);
      resolve(entries);
    })
  });
}

entriesFinder.sync = function (pattern) {
  return glob.sync(pattern)
    .reduce((entries, file) => {
      let entry      = path.basename(file, path.extname(file));
      entries[entry] = path.basename(file);

      return entries;
    }, {});
};
