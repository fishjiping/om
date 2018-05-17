// require dependencies
try {
  var rmdirRecursive = require('rmdir-recursive');
} catch (err) {
  var rmdirRecursive = require('../lib/rmdir-recursive');
}

var dir = '/tmp/deep';
rmdirRecursive(dir, function (err) {
  if (err) {
    console.log(dir + ' cant removed with status ' + err);
  } else {
    console.log(dir + ' removed');
  }
});
