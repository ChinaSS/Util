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
            require(["util/ztree/ztree"],function(){
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
        /***
        * TreeDialog
        * @param config
        * config = {
        *   id : id,                    //用于生成 zTree ID
        *   isCache : true,             //是否缓存ztree数据,默认为true;不缓存则显示即时数据
        *   data:{},                    //json对象数据(object)或者是url地址(string)
        *   selectMuti:false,           //是否多选,默认为false
        *   callback:function(data){}   //回调函数,接收JSON类型数据
        * }
        ***/
        util.treeDialog = function(config){
            config = $.extend({
                treeId : "",
                isCache : true,
                data : null,
                selectMulti : false,
                callback : null
            },config);
            //zTree setting
            config.setting={
                    view: {
                        selectedMulti: false,
                        showLine:false,
                        dblClickExpand:false
                    },
                    data: {
                        key: {
                            title:"t"
                        },
                        simpleData: {
                            enable : true
                        }
                    }
            };
            //data为url时,设置ztree异步读取数据
            if (typeof config.data === "string") {
                config.setting.async={
                    enable : true,
                    url : config.data
                }
                config.data=null;
                config.isCache=false;//异步读取数据时,不缓存ztree
            }
            require(["util/dialog/TreeDialog"],function(treeDialog){
                treeDialog.init(config);
            });
        };
        /***
        *   input自动补全
        *   @param config
        *   config = {
        *       id : null,          //页面锚id
        *       text : null,        //按钮文字
                data : null,        //JSON对象或数据URL地址
        *       callback : null,    //绑定功能函数
        *       lazyMatch : true,   //延迟匹配,优化查询开销,默认为true
        *   }
        ***/
        util.typeahead = function(config){
            require(["util/typeahead/typeahead","css!util/typeahead/typeahead.css"],function(typeahead){
                typeahead.init(config);
            });
        };

        /***
        *   GridDialog
        *   @param config
        *   config = {
        *       id : null,          //页面锚id
        *       text : null,        //按钮文字
                data : null,        //JSON对象或数据URL地址
        *       callback : null,    //绑定功能函数
        *       lazyMatch : true,   //延迟匹配,优化查询开销,默认为true
        *   }
        ***/
        util.gridDialog = function(config){
            require(["util/dialog/GridDialog"],function(gridDialog){
                gridDialog.init(config);
            });
        };
        util.treeAndGridDialog = function(config){
            config.tree.setting={
                    view: {
                        selectedMulti: false,
                        showLine:false,
                        dblClickExpand:false
                    },
                    data: {
                        key: {
                            title:"t"
                        },
                        simpleData: {
                            enable : true
                        }
                    }
            };
            if (typeof config.tree.data === "string") {
                config.tree.setting.async={
                    enable : true,
                    url : config.data
                }
                config.tree.data=null;
                config.tree.isCache=false;//异步读取数据时,不缓存ztree
            }
            require(["util/dialog/TreeAndGridDialog"],function(treeAndGridDialog){
                treeAndGridDialog.init(config);
            });
        }
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