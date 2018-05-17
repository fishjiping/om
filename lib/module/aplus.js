/**
 * Author: jiping
 * Date: 2015-2-24
 * Email: jiping.yjp@taobao.com
 * aplus模块
 */
module.exports = function(str){
    var aplus = '\r\n<script type="text/javascript" src="http://h5.m.taobao.com/app/lib/js/aplus.0.1.9-spm.0.1.9.js"></script>';
    // buffer转成string
    var content = str.toString();
    // 插入aplus脚本
    var result = content.replace(/(<body.*?>)/g,'$1' + aplus);
    // string转成buffer
    content = new Buffer(result);
    return content;
};