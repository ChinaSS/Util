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
    util.template = (function(){
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
        require(["BaseDialog"],function(baseDialog){
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
        require(["BaseDialog"],function(baseDialog){
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
     * 弹出侧边编辑栏组件
     */
    util.sidebarDetial = (function(){
        var cache = {};
        return function(config){
            var param = $.extend({
                "id":"",            //直接把模板放页面上
                "url":"",           //URL远程获取模板
                "width":"",
                "allowClick":[]
            },config);

            var isAllowTarget = function(e){
                //增加对boostrap date组件的支持(由于该组件的HTML自动追加在body上)
                var arr = param.allowClick.concat($('.datetimepicker'));
                for(var i= 0,item;item=arr[i++];){
                    if($(item).is(e.target) || $(item).has(e.target).length){
                        return true;
                    }
                }
                return false;
            };

            var init = function($Panel){
                //设置弹出面板样式
                $Panel.css({
                    "width":param.width,
                    "right":"-"+param.width,
                    "border":"1px solid rgba(0,0,0,.2)",
                    "position":"absolute",
                    "z-index":"3000",
                    "top":0,
                    "padding":"10px",
                    "background-color":"white",
                    "overflow-y":"scroll",
                    "overflow-x":"hidden",
                    "height":document.body.clientHeight,
                    "display":""
                });
                //弹出侧边编辑栏
                $Panel.animate({right: 0}, 300);
                //回调函数执行
                typeof(param.afterLoad)=="function" && param.afterLoad.apply(this);
                //添加点击侧边栏之外的元素关闭侧边栏事件监听
                $(document.body).mouseup(function(e){
                    //不是目标区域且不是子元素,且不是自定义允许点击节点
                    if((!$Panel.is(e.target) && $Panel.has(e.target).length === 0) && !isAllowTarget(e)){
                        //关闭页面
                        $Panel.animate({right: "-"+param.width}, 300,function(){
                            $Panel.attr("style","").hide();
                        });
                        //取消事件
                        $(document.body).unbind("mouseup");
                    }
                });
            };

            //如果已经有缓存则直接加载
            var $Panel = cache[param.id || param.url];
            if($Panel){
                init($Panel);
                return;
            }
            //如果已经把模板放在了页面上，则通过id取得
            if(param.id){
                $Panel = $("#"+param.id);
                init($Panel);
                cache[param.id] = $Panel;
            }else{
                require(['text!'+param.url],function(panel){
                    var $Panel = $(panel);
                    //如果是URL方式获取模板，则把模板追加到body上
                    $Panel.appendTo($(document.body));
                    init($Panel);
                    cache[param.url] = $Panel;
                })
            }
        };
    })();


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
    /*util.treeDialog = function(config){
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
                    selectedMulti: config.selectMulti,
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
            };
            config.data=null;
            config.isCache=false;//异步读取数据时,不缓存ztree
        }
        require(["/dialog/TreeDialog"],function(treeDialog){
            treeDialog.init(config);
        });
    };*/

    /*util.gridDialog = function(config){
        if (typeof config.setting.data === "string") {
            config.setting.data = {
                type : "URL",
                value : config.setting.data
            }
        }
        require(["/dialog/GridDialog"],function(gridDialog){
            gridDialog.init(config);
        });
    };*/

   /* util.treeAndGridDialog = function(config){
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
            };
            config.tree.data=null;
            config.tree.isCache=false;//异步读取数据时,不缓存ztree
        }


        require(["/dialog/TreeAndGridDialog"],function(treeAndGridDialog){
            treeAndGridDialog.init(config);
        });
    };*/
    return util;
});