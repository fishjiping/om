/**
 * Author: jiping
 * Date: 2014-12-11
 * Email: jiping.yjp@taobao.com
 * 初始化项目环境
 */
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var copyFiles = require('./util/cli-copy');
var env = require('./util/env');

var param = {};

/**
 * 获取创建者的名字
 * @returns {Promise}
 */
var getAuthor = function(){
    return new Promise(function(resolve){
        prompt(color.cyan(FLAG + 'The name of the author?'), function (val) {
            param.author = val.trim();
            resolve();
        });
    });
};

/**
 * 获取默认项目模板引擎
 * @returns {Promise}
 */
var getTemplateType = function(){
    return new Promise(function(resolve, reject) {
        var selectShell = require('./util/cli-select');
        var select = selectShell();
        select.option(FLAG + 'The type of the stylesheet？')
            .option('mustache')
            .option('artTemplate')
            .list();

        select.on('select', function(options){
            param.templateType = options.text;
            resolve();
        });
    });
};

/**
 * 获取项目名称
 * @returns {Promise}
 */
var getProjectName = function(){
    return new Promise(function(resolve){
        prompt(color.cyan(FLAG + 'The name of the project?'), function (val) {
            param.author = val.trim();
            resolve();
        });
    });
};

exports.run = function(){
    try{
        console.log('init starting');
        var srcDir = path.join(__dirname, 'initFiles');
        var destDir = process.cwd();
        var copy = copyFiles(srcDir, destDir);
        copy.on('complete', function(){
           console.log('init Finished');
        });
    } catch (e){
        console.log(e.message);
    }
};