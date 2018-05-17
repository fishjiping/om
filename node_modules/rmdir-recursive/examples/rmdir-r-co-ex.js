// require dependencies
var co = require('co');
try {
  var rmdirRecursive = require('rmdir-recursive');
} catch (err) {
  var rmdirRecursive = require('../lib/rmdir-recursive');
}

// co generator
co(function *() {
  var dir = '/tmp/deep';
  try {
    yield rmdirRecursive(dir);
    console.log(dir + ' removed');
  } catch (err) {
    console.log(dir + ' cant removed with status ' + err);
  }
})();
