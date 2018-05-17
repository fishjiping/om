var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

// 引入组件
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var sass = require('gulp-ruby-sass');
var minifyCSS = require('gulp-minify-css');
var cssCombo = require('gulp-css-combo');
var minify = require('gulp-minify');
var kclean = require('gulp-kclean');
var kmc = require('gulp-kmc');
var tmodjs = require('gulp-tmod');
var rimraf = require('gulp-rimraf');
var rename = require("gulp-rename");
var through = require('through2');
var gutil = require('gulp-util');
var htmlone = require('gulp-htmlone');

var cssOK = false;
var lessOK = false;
var sassOK = false;
var jsOK = false;
var replaceOK = false;
var kmcFiles = [];
var kcleanFiles= [];
var dependencies = {};
var config = fs.readFileSync('./src/config.js').toString().replace(/^seajs\.config\(/, '').replace(/\);*/, '');
var configJSON = JSON.parse(config);

var pageList = fs.readdirSync('./src/page');
pageList.forEach(function(page, i){
    if (!/^\./.test(page)){
        kmcFiles.push({
            src: 'page/'+ page +'/index',
            dest: 'js/' + page + '/index.js'
        });
        kcleanFiles.push({
            src:'js/' + page + '/index.js',
            wrap:{
                start:"(function(){\r\n",
                end:"\r\n})();"
            }
        });
    }
});

// 检查脚本
gulp.task('lint', function() {
    gulp.src('./src/**/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 编译css,生成.css和.debug.css文件
gulp.task('css', function () {
    return gulp.src('./src/page/**/index.css')
        .pipe(cssCombo())
        .pipe(gulp.dest('./build'))
        .pipe(rename(function (path) {
            path.dirname += "";
            path.basename += ".debug";
            path.extname = ".css"
        }))
        .pipe(gulp.dest("./build"))
        .on('end', function(){
            cssOK = true;
        });
});

// 编译less,生成.css和.debug.css文件
gulp.task('less', function () {
    return gulp.src('./src/page/**/index.less')
        .pipe(less())
        .pipe(gulp.dest('./build'))
        .pipe(rename(function (path) {
            path.dirname += "";
            path.basename += ".debug";
            path.extname = ".css"
        }))
        .pipe(gulp.dest("./build"))
        .on('end', function(){
            gulp.run('minifyCSS');
        });
});

// 编译Sass,生成.css和.debug.css文件
gulp.task('sass', function() {
    return sass('./src/page', {
        style: 'expanded',
        sourcemap: false,
        noCache: true,
        precision: 10
    })
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(gulp.dest('./build'))
        .pipe(rename(function (path) {
            path.dirname += "";
            path.basename += ".debug";
            path.extname = ".css"
        }))
        .pipe(gulp.dest("./build"))
        .on('end', function(){
            sassOK = true;
        });
});

// copy
gulp.task('copy',  function() {
    gulp.src(["./build/tmp/js/**/*"])
        .pipe(gulp.dest('./build'))
        .on('end', function(){
            gulp.run('cleanTmp');
        });
});

// 清除build目录下临时文件
gulp.task('cleanTmp',  function() {
    gulp.src('./build/tmp', { read: false })
        .pipe(rimraf({ force: true }))
        .on('finish', function(){
            gulp.run('debugJS');
        });
});

// 生成.debug.js文件
gulp.task('debugJS',  function() {
    gulp.src('./build/**/*.js')
        .pipe(rename(function (path) {
            path.dirname += "";
            path.basename += ".debug";
            path.extname = ".js"
        }))
        .pipe(gulp.dest("./build"))
        .on('end', function(){
            gulp.run('minifyJS');
        });
});

// 压缩css文件
gulp.task('minifyCSS',  function() {
    gulp.src('./build/**/index.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest("./build"))
        .on('end', function(){
            lessOK = true;
        });
});

// 压缩js文件
gulp.task('minifyJS',  function() {
    gulp.src('./build/**/index.js')
        .pipe(minify({
            ext: {
                min: '.js',
                src: '.debug.js'
            }
        }) )
        .pipe(gulp.dest("./build"))
        .on('end', function(){
            jsOK = true;
        });
});

// 编译模板
gulp.task('template', function(){
    gulp.src('./src/**/**/tpl/*.html')
        .pipe(tmodjs({
            base: './src',
            combo: false,
            type: 'commonjs',
            minify: false,
            cache: false,
            output: './src'
        }))
        .on('finish', function(){
            gulp.run('comboTemplate');
        });
});

// 打包模板
gulp.task('comboTemplate', function(){
    gulp.src('./src/**/**/tpl/*.js')
        .pipe(kmc.convert({
            define: true // modulex: true , define: true
        }))
        .pipe(gulp.dest('./build/tmp'))
        .on('end', function(){
            gulp.run('kmc');
        })
});

// 清除src目录下的临时模板
gulp.task('cleanTemplate', function(){
    gulp.src('./src/**/**/tpl/*.js', { read: false })
        .pipe(rimraf({ force: true }))
        .on('finish', function(){
            //gulp.run('kmc');
        });
});


// 分析模块依赖关系及合并
kmc.config({
    packages:[{
        name:"src",
        base:"./"
    }]
});

gulp.task('kmc', function() {
    gulp.src(["./src/**/**/*.js"])
        .pipe(kmc.convert({
            define: true // modulex: true , define: true
        }))
        //合并文件
        .pipe(kmc.combo({
            deps:false,
            files:kmcFiles
        }))
        .pipe(kclean({
            files:kcleanFiles
        }))
        .pipe(gulp.dest('./build/tmp'))
        .on('finish', function(){
            pageList.forEach(function(page, i){
                var filePath = './build/tmp/js/' + page + '/index.js';
                var isExist;
                var file;
                if (!/^\./.test(page)) {
                    isExist = fs.existsSync(filePath);
                    if (isExist){
                        dependencies[page] = [];
                        file = fs.readFileSync(filePath).toString();
                        file = file.replace(/var\s+\w+\s+=\s+require\((["'])([^()"']+?)\1\);/g, function(s){
                            dependencies[page].push(s.replace(/var\s+\w+\s+=\s+require\((["'])([^()"']+?)\1\);/g, '$2'));
                            return '';
                        });
                        fs.writeFileSync(filePath, file);
                    }
                }
            });
            replaceOK = true;
            gulp.run('copy');
            gulp.run('cleanTemplate');
        });
});

// 打包成htmlone
gulp.task('html', function(){
    gulp.src('./demo/*.html')
        .pipe(through.obj(function (file, enc, cb) {
            if (file.isNull()) {
                this.push(file);
                return cb();
            } else if (file.isStream()) {
                this.emit('error', new gutil.PluginError('gulp-css-combo', 'Streaming not supported'));
                return cb();
            } else {
                fs.readFile(file.path, function(err, data){
                    if (err) throw err;
                    var basename = path.basename(file.path, '.html');
                    var deps = dependencies[basename];
                    var comboList = [];
                    var comboURL = '';
                    var content = data.toString();
                    deps.forEach(function(dep, i){
                        if (dep){
                            comboList.push(configJSON['alias'][dep].replace(/\/\/g\.alicdn\.com\//, ''));
                        }
                    });
                    if (comboList.length) {
                        comboURL = '<script src="//g.alicdn.com/??' + comboList.join(',') + '" charset="utf-8" keeplive></script>\r\n';
                        content = content.replace(/(<\/head>)/g, comboURL + '$1');
                    }
                    file.contents = new Buffer(content.replace(/src\/page/g, 'build'));
                    cb(null, file);
                });
            }
        }))
        .pipe(htmlone())
        .pipe(gulp.dest('./publish'));
});

// 打包
gulp.task('build', function(){
    gulp.src(['./build', './publish'], { read: false })
        .pipe(rimraf({ force: true }))
        .on('finish', function(){
            gulp.run('css');
            gulp.run('less');
            gulp.run('sass');
            gulp.run('template');
            var timer = setInterval(function(){
                if (cssOK && lessOK && sassOK && jsOK && replaceOK){
                    gulp.run('html');
                    clearInterval(timer);
                    timer = null;
                }
            }, 100);
        });
});

// 默认任务
gulp.task('default', ['build']);