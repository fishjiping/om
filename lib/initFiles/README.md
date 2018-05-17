## This is an [om](http://gitlab.alibaba-inc.com/one-request/or-om) project

### Getting Started
* Clone the repo: git clone git@gitlab.alibaba-inc.com:one-request/or-om.git
* install gloabl: sudo tnpm link

### Require Tools
* node >= 0.11.12
* gulp >= 3.8.11

### Features
* 支持命令行项目初始化 —— om init
* 支持命令行添加文件 —— om add
    + om add c xxx 添加一个名字为xxx的components文件；包括模板文件、脚本文件、样式文件
    + om add p xxx 添加一个名字为xxx的page文件；包括html文件、脚本文件、样式文件
* 支持本地服务 —— om server
    + api mock页面地址：http://127.0.0.1:3000/api
    + demo页面地址：http://127.0.0.1:3000/demo/xxx.html
* 支持本地apiMock（mtop、ajax、jsonp） —— om server debug
    + 使用时确保绑定代理，代理ip：127.0.0.1；代理端口：3001
* 支持本地打包功能 —— om build
* 支持本地更新依赖组件版本号 —— om tag
* 支持cmd包管理功能
* 支持css、less、sass依赖及编译
* 支持[artTemplate](https://github.com/aui/artTemplate)
* 支持[html-one](http://gitlab.alibaba-inc.com/one-request/or-htmlone-gulp/tree/master)
* 支持[px2rem](http://gitlab.alibaba-inc.com/one-request/or-px2rem/tree/master)
    + `注：确保视觉稿是750尺寸，若是其他尺寸请把视觉稿尺寸转成750，转换后发现切图存在小数点的保证6的倍数规则`
* 支持[imagx](http://gitlab.alibaba-inc.com/one-request/or-imgex-gulp/tree/master)
    + 暂未提供该功能，下个版本加上
* 与[awp](http://gitlab.alibaba-inc.com/one-request/or-awp/tree/master)和[packageApp](http://gitlab.alibaba-inc.com/one-request/or-packageapp/tree/master)工具无缝衔接

### 本应用采用web components的目录结构
* src目录
    + page下存放页面入口assets
    + components下存放模块或者组件assets
* api目录
    + ajax-jsonp目录存放ajax请求的数据接口和jsonp请求的数据接口
    + mtop目录存放mtop数据接口
    + config.json文件包含数据接口的配置
* demo目录存放本地开发的html文件
* img目录存放本地开发的图片文件
* build目录存放打包后每个页面的js、css文件
* publish目录存放打包后的html文件，可直接发布awp、mt平台
* packageApp目录存放发布awp平台的package文件

### cmd包管理机制——seajs（可使用nodejs的方式写模块）
* 模块定义方式, 比如在components目录下定义一个模块a
```javascript
module.export = {
    init: function(){
        console.log('module a');
    }
}
```

* 模块依赖方式
    + 依赖本地模块，在page目录下的index入口文件引用模块a
    
    ```javascript
    var a = require('../../components/a/index');
    a.init();
    ```

    + 依赖本地模板，模块a引用模块a的模板
    
    ```javascript
    var template = require('./tpl/index');
    module.exports = {
        init: function () {
            var data = {
               a: 1,
               b: 2
           }
            var html = template(data);
            $('body').html(html);
        }
    }
    ```

    + 依赖远程模块，如依赖lib.env
    
    ```javascript
    require('lib.env');
    console.log(lib.env.os);
    ```

