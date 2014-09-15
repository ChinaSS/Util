(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"],factory);
    }else{
        var u = window.util || (window.util = {});
        $.extend(u,factory(jQuery));
    }
})(function($){
        var util = {};

        /**
         * 简单模板引擎
         */
        util.template = (function() {
            var cache = {};
            return function(str, data) {
                // Figure out if we're getting a template, or if we need to
                // load the template - and be sure to cache the result.
                var fn = !/\W/.test(str) ? cache[str] = cache[str] || util.template(document.getElementById(str).innerHTML) :
                    // Generate a reusable function that will serve as a template
                    // generator (and which will be cached).
                    new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
                        // Introduce the data as local variables using with(){}
                        "with(obj){p.push('" +
                        // Convert the template into pure JavaScript
                        str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
                // Provide some basic currying to the user
                return data ? fn(data) : fn;
            };
        })();

        /**
         * 用法：require(["util"],function(u){u.alert("请填写基本信息！")})
         * @param message
         */
        util.alert =function(message){
            require(["baseDialog"],function(baseDialog){
                var dialog = baseDialog({id:"system_dialog_alert",modal:{backdrop:"static",show:true},dialogSize:"modal-sm",height:"66px"});
                dialog.setBody(message);
                dialog.css({"margin-top":"13%"});
                dialog.find(".modal-header .close").css({"margin-top":"-10px"});
            });
        };

        /**
         * 用法：require(["util"],function(u){u.confirm("确认提交？",function(){console.log("是")},function(){console.log("否")})})
         * @param message
         * @param okCallback
         * @param cancelCallback
         */
        util.confirm = function(message,okCallback,cancelCallback){
            require(["baseDialog"],function(baseDialog){
                var dialog = baseDialog({id:"system_dialog_confirm",modal:{backdrop:"static",show:true},dialogSize:"modal-sm",height:"66px"});
                dialog.setBody(message);
                dialog.css({"margin-top":"13%"});
                dialog.find(".modal-header .close").css({"margin-top":"-10px"});
                dialog.find(".modal-footer").css({"padding":"5px 20px 5px"});
                dialog.setFoot([{"name":"是","callback":okCallback,close:true},{"name":"否","callback":cancelCallback,close:true}],false);
                dialog.find(".modal-footer .btn").css({"padding":"2px 5px"});
            });
        };

        /**
         * zTree封装,API不变，自动加载相关资源
         * @param element
         * @param setting
         * @param nodeObj
         */
        util.zTree = function(element, setting, nodeObj){
            require(["zTree","css!modules/zTree/css/zTreeStyle/zTreeStyle.css"],function(){
                $.fn.zTree.init(element, setting, nodeObj);
            });
        };

        /**
         * 模态框
         * @param config
         */
        util.baseDialog = function(config){
            require(["baseDialog"],function(baseDialog){
                baseDialog(config);
            });
        };
        /**
        config = {
            data:{},//json对象数据或者是url地址
            type:false,//表示data数据的类型,false为JSON对象,true为url地址
            selectMuti:false,//是否多选,默认为false
            callback:function(data){},//回调函数,接收JSON类型数据
        }
        /* treeDialog */
        util.treeDialog = function(Config){
            var config = {
                data : null,
                type : false,
                selectMuti : false,
                callback : null
            };
            $.extend(config,Config);
            require(["baseDialog","zTree","css!modules/zTree/css/zTreeStyle/zTreeStyle.css"],function(baseDialog){
                var $tree = $("<div id='dialog_zTree' class='ztree'></div>")
                var setting={
                        check: {
                            enable: true
                        },
                        view: {
                            selectedMulti: true
                        }
                    },nodeObj=null;
                if (!selectMuti) {
                    setting.view.selectedMulti=false;
                };
                if (!type) {
                    nodeObj=config.data;
                }else{
                    //$.ajax, nodeObj=?
                    $.fn.zTree.init($tree,setting,nodeObj);
                }
                var dialog = baseDialog({id:"system_dialog_treeDialog",modal:{show:true}});
                dialog.on('shown.bs.modal', function (e) {
                    dialog.setBody($tree);
                    dialog.setFoot([
                        {
                            name:"保存",
                            callback:function(){
                                var treeObj = $.fn.zTree.getZTreeObj("dialog_zTree");
                                var data=null;
                                if (treeObj!=undefined) {
                                    data = treeObj.getCheckedNodes(true);
                                };
                                config.callback(data);
                            }
                        }
                    ],true);
                })
            });
        };
        
        /**
         * tab页签
         * @param config
         */
        util.tab = function(config){

        };

        /**
         * 表格
         * @param config
         */
        util.table = function(config){

        };

        return util;
    }
);