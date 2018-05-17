// require dependencies
try {
  var rmdirRecursiveSync = require('rmdir-recursive').sync;
} catch (err) {
  var rmdirRecursiveSync = require('../lib/rmdir-recursive').sync;
}

var dir = '/tmp/deep';
try {
  rmdirRecursiveSync(dir);
  console.log(dir + ' removed');
} catch (err) {
  console.log(dir + ' cant removed with status ' + err);
}
