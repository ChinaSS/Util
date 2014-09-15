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
        util.zTree = function(element, settings, nodeObj){
            var setting = {
                view: {
                    selectedMulti:false,
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
                },
                callback: {
                    onClick : function(event, treeId, treeNode){
                        if (treeNode.t!=null) {
                            console.log("我是 "+treeNode.name+" "+treeNode.t);
                        }else{
                            console.log("我是 "+treeNode.name);
                        }
                    }
                }
            }
            var nodeObject=[
                {id:1,pId:0,name:"父节点1",t:"我有子节点",open:true},
                {id:11,pId:1,name:"子节点11",t:"我的父节点是1"},
                {id:12,pId:1,name:"子节点12",t:"我的父节点是1"},
                {id:13,pId:1,name:"子节点13",t:"我的父节点是1"},
                {id:2,pId:0,name:"父节点2",t:"我有子节点"},
                {id:21,pId:2,name:"子节点21",t:"我的父节点是2"},
                {id:22,pId:2,name:"子节点22",t:"我的父节点是2"},
                {id:23,pId:2,name:"子节点23",t:"我的父节点是2"},
                {id:3,pId:0,name:"父节点2",t:"我没有子节点",isParent:true},
            ];
            $.extend(setting,settings);
            nodeObj = nodeObj?nodeObj:nodeObject;
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

        /* treeDialog 
        util.treeDialog = function(config,setting,nodeObj,callback){
            require(["baseDialog","zTree","css!modules/zTree/css/zTreeStyle/zTreeStyle.css"],function(baseDialog){
                var $tree = $("<div class='ztree'></div>");
                $.extend(setting,{
                    callback:{
                        onDblClick: function(event, treeId, treeNode){
                            callback(treeNode);
                        }
                    }
                });
                $.fn.zTree.init($tree,setting,nodeObj);
                var dialog = baseDialog(config);
                dialog.on('shown.bs.modal', function (e) {
                    dialog.setBody(tree);
                })
            });
            
        };
        */
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