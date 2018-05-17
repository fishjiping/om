/**
 * Author: jiping
 * Date: 2014-12-11
 * Email: jiping.yjp@taobao.com
 */
var program = require('commander');
var orlogin = require('@ali/or-login');
var Gitlab = require('gitlab');
var color = require('cli-color');
var version = require('./package.json').version;
var initEnv = require('./lib/init');
var server = require('./lib/server');
var add = require('./lib/add');
var tag = require('./lib/tag');
var build = require('./lib/build');
var ENV = require('./lib/util/env');

//var gitlab = new Gitlab({
//    url: 'http://gitlab.alibaba-inc.com/',
//    token: ENV.token
//});

function doCommand(){
    if(!program.args.length) {
        program.help();
    } else {
        switch(program.args[0]){
            case 'init':
                initEnv.run();
                break;
            case 'add':
                if (program.args.length === 3 && (program.args[1] === 'c' || program.args[1] === 'p')) {
                    add.run(program.args[1], program.args[2]);
                } else {
                    program.help();
                }
                break;
            case 'tag':
                tag.run();
                break;
            case 'server':
                server.run(program.args[1] === 'debug');
                break;
            case 'build':
                build.run(program.args[1]);
                break;
            default :
                program.help();
                process.exit(0);
                break;
        }
    }
}


function isUpdate(){
    gitlab.projects.listTags({
        id: encodeURIComponent('one-request/or-om')
    }, function(tags) {
        if (Object.prototype.toString.call(tags) === "[object Array]"){
            var onlineVersion = tags[0] ? tags[0].name.split('/')[1] : '';
            if (version != onlineVersion) {
                color.cyan(ENV.flag + 'new version is available！');
            }
        }
        doCommand();
    });
}

exports.run = function(){
    program
        .version(version)
        .command('add, --add [type] [name]', 'add components or page')
        .command('build, --build'          , 'build package file')
        .command('init, --init'            , 'initialize development environment')
        .command('server, --server'        , 'open the local server')
        .command('tag, --tag'              , 'update requires js components version')
        .parse(process.argv);

    try{
        //var loginInfo = orlogin.getLoginInfo();
        //if (!loginInfo) {
        //    orlogin.login(function (loginInfo) {
        //        console.log(loginInfo);
        //        isUpdate();
        //    });
        //} else {
        //    isUpdate();
        //}
        doCommand();
    } catch (e){
        program.help();
        process.exit(1);
    }
};