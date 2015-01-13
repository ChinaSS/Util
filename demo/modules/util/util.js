define(["jquery","css!UtilDir/css/util.css"],function($){
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
     * 用法：require(["UtilDir/util"],function(u){u.alert("请填写基本信息！")})
     * @param message
     */
    util.alert =function(message,type){
        require(["UtilDir/dialog"],function(Dialog){
            var dialog = Dialog({id:"system_dialog_alert",title:(type?type:"系统信息"),modal:{backdrop:"static",show:true},dialogSize:"modal-sm",height:"66px"});
            dialog.setBody(message);
            $dialog = dialog.$getDialog();
            $dialog.css({"margin-top":"13%"});
            dialog.show();
        });
    };

    /**
     * 用法：require(["UtilDir/util"],function(u){u.confirm("确认提交？",function(){console.log("是")},function(){console.log("否")})})
     * @param message
     * @param okCallback
     * @param cancelCallback
     */
    util.confirm = function(message,okCallback,cancelCallback){//整合回调函数成一个,利用回传参数判断是否成功
        require(["UtilDir/dialog"],function(Dialog){
            var dialog = Dialog({id:"system_dialog_confirm",title:"提示信息",modal:{backdrop:"static",show:true},dialogSize:"modal-sm",height:"66px"});
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
        config.setting = $.extend({
            cache : true,
            dialogSize: "modal-lg",
            title : "Dialog",
            id : "system_dialog_contentDialog",
            modal : "hide"
        },config.setting);
        require(["UtilDir/dialog","text!"+config.template],function(Dialog,template){
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
                "close":false,      //点击侧边栏之外的区域是否能关闭侧边栏
                "allowClick":[]
            },config);

            //侧边栏对象
            var $Panel;

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

            var init = function(){
                //设置弹出面板样式
                $Panel.css({
                    "width":param.width,
                    "border":"1px solid rgba(0,0,0,.2)",
                    "position":"fixed",
                    "z-index":"1040",
                    "top":0,
                    "bottom":0,
                    "right":"-"+param.width,
                    "padding":"10px 10px 0 20px",
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
                param.close && $(document.body).unbind("mouseup").bind("mouseup",function(e) {
                    //不是目标区域且不是子元素,且不是自定义允许点击节点
                    if ((!$Panel.is(e.target) && $Panel.has(e.target).length === 0) && !isAllowTarget(e)) {
                        //关闭页面
                        closeSlidebar();
                        //取消事件
                        $(document.body).unbind("mouseup");
                    }
                });
                //增加以添加样式即可关闭侧边栏的方法
                $Panel.find(".closeBtn").on("click",function(e){
                    closeSlidebar();
                });
            };

            //关闭侧边栏方法
            var closeSlidebar = function(){
                $Panel.animate({right: "-"+param.width}, 150,function(){
                    typeof(param.afterClose)=="function" && param.afterClose.apply(this);
                    //如果不缓存,且侧边栏的DOM来自于远程连接，则删除DOM
                    (!param.cache && param.url) && $Panel.remove();
                });
            };
            //增加左侧关闭
            var addClose = function(){
                var $left = $("<div class='cs-slidebar-left'><i class='glyphicon glyphicon-chevron-right cs-slidebar-close'></i></div>");
                //添加关闭侧边栏的事件
                $left.bind("click",function(){
                    closeSlidebar($Panel);
                });
                return $left;
            };


            //如果已经把模板放在了页面上，则通过id取得
            if(param.id){
                $Panel = $("#"+param.id);
                //如果已经增加过关闭则不再增加
                !$Panel.find(">div[class='cs-slidebar-left']").length && $Panel.append(addClose());
                init();
                return false;
            }
            //-------如果为远程获取侧边栏中的内容--------
            $Panel = cache[param.id || param.url];
            //如果已经有缓存则直接加载
            if(param.cache && $Panel){
                init();
            }else{
                //删除之前的元素(不需要缓存时，从关闭面板时的回调函数处挪到这里)
                cache[param.url] && cache[param.url].remove();
                require(['text!'+param.url],function(panel){
                    $Panel = $("<div></div>").append(addClose()).append(panel);
                    //如果是URL方式获取模板，则把模板追加到body上
                    $Panel.appendTo($(document.body));
                    init();
                    cache[param.url] = $Panel;
                })
            }
        };
    })();

    return util;
});