define(["jquery","css!Util/css/util.css"],function($){
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
     * 用法：require(["Util/util"],function(u){u.alert("请填写基本信息！")})
     * @param message
     */
    util.alert =function(message){
        require(["Util/dialog"],function(Dialog){
            var dialog = Dialog({id:"system_dialog_alert",title:"AlertDialog",modal:{backdrop:"static",show:true},dialogSize:"modal-sm",height:"66px"});
            dialog.setBody(message);
            $dialog = dialog.$getDialog();
            $dialog.css({"margin-top":"13%"});
            dialog.show();
        });
    };

    /**
     * 用法：require(["Util/util"],function(u){u.confirm("确认提交？",function(){console.log("是")},function(){console.log("否")})})
     * @param message
     * @param okCallback
     * @param cancelCallback
     */
    util.confirm = function(message,okCallback,cancelCallback){
        require(["Util/dialog"],function(Dialog){
            var dialog = Dialog({id:"system_dialog_confirm",title:"ConfirmDialog",modal:{backdrop:"static",show:true},dialogSize:"modal-sm",height:"66px"});
            dialog.setBody(message);
            $dialog = dialog.$getDialog();
            $dialog.css({"margin-top":"13%"});
            $dialog.find(".modal-footer").css({"padding":"5px 20px 5px"});
            dialog.setFoot([{"name":"是","callback":okCallback,close:true},{"name":"否","callback":cancelCallback,close:true}],false);
            $dialog.find(".modal-footer .btn").css({"padding":"2px 5px"});
            dialog.show();
        });
    };
    /**
     * config = {
     *   setting : {},                   //dialogSetting
     *   template : templateURL,         //dialogBodyTemplate
     *   afterLoad : function(dialog){},   //afterDialogLoaded callback
     * }
     */
    util.contentDialog = function(config){
        $.extend({
            cache : true,
            dialogSize: "modal-lg",
            title : "Dialog",
            id : "system_dialog_contentDialog",
            modal : "hide"
        },config.setting);
        require(["Util/dialog","text!"+config.template],function(Dialog,template){
            dialog = Dialog(config.setting);
            dialog.setBody(template);
            config.afterLoad(dialog);
            dialog.show();
        });
    };

    /**
     * 弹出侧边编辑栏组件
     */
    util.slidebar = (function(){
        var cache = {};
        return function(config){
            var param = $.extend({
                "id":"",            //直接把模板放页面上
                "url":"",           //URL远程获取模板
                "width":"",
                "cache":true,
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
                    "border":"1px solid rgba(0,0,0,.2)",
                    "position":"fixed",
                    "z-index":"1040",
                    "top":0,
                    "bottom":0,
                    "right":"-"+param.width,
                    "padding":"10px",
                    "background-color":"white",
                    "overflow-y":"scroll",
                    "overflow-x":"hidden",
                    "display":""
                });
                //弹出侧边编辑栏
                $Panel.animate({right : 0}, 350,function(){
                    //回调函数执行
                    typeof(param.afterLoad)=="function" && param.afterLoad.apply(this);
                });
                //添加点击侧边栏之外的元素关闭侧边栏事件监听
                $(document.body).unbind("mouseup").bind("mouseup",function(e){
                    //不是目标区域且不是子元素,且不是自定义允许点击节点
                    if((!$Panel.is(e.target) && $Panel.has(e.target).length === 0) && !isAllowTarget(e)){
                        //关闭页面
                        $Panel.animate({right: "-"+param.width}, 150,function(){
                            //取消该回调里的所有操作，避免多次点击时，先弹出第二次的侧边栏，再回调执行第一次的如下代码
                            //$Panel.attr("style","").hide();
                            //如果不缓存,且侧边栏的DOM来自于远程连接，则删除DOM
                            //(!param.cache && param.url) && $Panel.remove();
                        });
                        //取消事件
                        $(document.body).unbind("mouseup");
                    }
                });
            };
            //如果已经把模板放在了页面上，则通过id取得
            if(param.id){
                $Panel = $("#"+param.id);
                init($Panel);
                return false;
            }
            var $Panel = cache[param.id || param.url];
            //如果已经有缓存则直接加载
            if(param.cache && $Panel){
                init($Panel);
            }else{
                //删除之前的元素(不需要缓存时，从关闭面板时的回调函数处挪到这里)
                cache[param.url] && cache[param.url].remove();
                require(['text!'+param.url],function(panel){
                    $Panel = $("<div>"+panel+"</div>");
                    //如果是URL方式获取模板，则把模板追加到body上
                    $Panel.appendTo($(document.body));
                    init($Panel);
                    cache[param.url] = $Panel;
                })
            }
        };
    })();


    return util;
});