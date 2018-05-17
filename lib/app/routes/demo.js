/**
 * Created by jiping on 15-3-6.
 */
var fs = require('fs');
var express = require('express');
var ENV = require('../../util/env');
var insertAplus = require('../../module/aplus');
var insertSeajs = require('../../module/sea');
var insertConfig = require('../../module/config');

var router = express.Router();

router.get('/', function (req, res) {
    try {
        var dirPath = ENV.base_path + '/demo';
        var isExists = fs.existsSync(dirPath);
        var fileList;
        if (isExists) {
            // 读取目录中的所有文件/子目录
            fileList = fs.readdirSync(dirPath);
            // 渲染页面
            res.render('demo', {
                indexCSS: '/css/demo.css',
                indexJS: '',
                prismCSS: '',
                prismJS: '',
                fileList: fileList
            });
        } else {
            res.status(404).send('Not Found');
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.get(/^\/(\w|-|_)+\.html$/, function (req, res) {
    try {
        var filePath = ENV.base_path + req.originalUrl.replace(/(\?.*)*$/, '');
        var isExists = fs.existsSync(filePath);
        if (isExists) {
            // 创建读取流
            var readable = fs.createReadStream(filePath);
            readable.on('data', function(chunk){
                //var content = insertAplus(chunk);
                //content = insertSeajs(content);
                var content = insertSeajs(chunk);
                content = insertConfig(content);
                res.end(content);
            });
            res.set({
                'Content-Type': 'text/html'
            });
            readable.pipe(res, { end: false });
        } else {
            res.status(404).send('Not Found');
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;