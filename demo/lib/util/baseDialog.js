/**
 * 弹出框组件
 Example：
 require(["baseDialog"],function(baseDialog){
     //为弹出框增加操作按钮
     var buttons = [];
     buttons.push(
         {name:"确定",callback:function(){
             //此处写扩展代码

         }}
     );
     var dialog = baseDialog({
                id:"TestDialog",
                cache:false,                        //是否缓存，默认为true
                title:"测试窗口",
                width:"400px",
                height:"100px",
                dialogSize:"",                      //modal-lg或modal-sm
                body:"窗口中间内容",
                buttons:buttons
            });
     dialog.setBody("修改内容");
 })
 */
(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"],factory);
    }else{
        var u = window.util || (window.util = {});
        u.baseDialog || (u.baseDialog = factory(jQuery));
    }
})(function($){
    var cache = {};
    return function(param){
        var config = $.extend({
            cache:true
        },param);
        //缓存控制
        if(cache[config.id] && config.cache){
            return cache[config.id].modal("show");
        }
        //Dialog HTML字符串
        var dialogHTML = [];
        dialogHTML.push('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" id="'+ config.id +'">');
        var width = config.width?"width:"+config.width:"";
        dialogHTML.push('<div class="modal-dialog '+(config.dialogSize||"")+'" style="'+width+'">');
        dialogHTML.push('<div class="modal-content">');
        dialogHTML.push('<div class="modal-header">');
        dialogHTML.push('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
        dialogHTML.push('<h4 class="modal-title">'+ (config.title||"") +'</h4>');
        dialogHTML.push('</div>');
        var height = config.height?"min-height:"+config.height:"";
        dialogHTML.push('<div class="modal-body" style="'+height+'"></div>');
        var footStyle = 'style="border-bottom-right-radius:6px;border-bottom-left-radius:6px;padding:10px 20px 10px;background-color:#eff3f8;"';
        dialogHTML.push('<div class="modal-footer" '+footStyle+'></div>');
        dialogHTML.push('</div></div></div>');
        var $root   = $(dialogHTML.join(""));

        /**
         * 设置窗口按钮
         * @param buttons 按钮列表
         * @param defaultClose  boolean是否默认设置关闭按钮
         * @returns {*}
         */
        var setFoot = function(buttons,defaultClose){
            var close = typeof(defaultClose)=="undefined" ? true: defaultClose;
            if(buttons && buttons.length){
                var $foot = $root.find("div[class='modal-footer']").empty();
                for(var i= 0,b;b=buttons[i++];){
                    $foot.append($('<button type="button" class="btn btn-primary" '+ (b.close?'data-dismiss="modal"':'') +'>'+ b.name +'</button>').bind("click", b.callback));
                }
                return $foot.append(close?'<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>':"");
            }
        };

        //增加body内容
        var $body   = $root.find("div[class='modal-body']").append(config.body || "");
        //增加操作按钮
        setFoot(config.buttons);
        //把dialog的DOM放到body上
        $("body").append($root);
        //dialog初始化
        var dialog = $("#"+config.id).modal(config.modal || 'show');
        //如果不缓存，关闭dialog时需要销毁Dom
        if(config.cache){
            cache[config.id] = dialog;
        }else{
            dialog.on('hidden.bs.modal', function (e) {
                dialog.remove();
            })
        }

        //==========================Dialog操作相关方法=====================
        /**
         * 取得body
         * @returns {*}
         */
        dialog.getBody = function(){
            return $body;
        };
        /**
         * 设置body
         * @param body
         */
        dialog.setBody = function(body){
            $body.empty().append(body);
        };
        /**
         * 取得foot
         * @returns {*}
         */
        dialog.getFoot = function(){
            return $root.find("div[class='modal-footer']");
        };
        /**
         * foot操作栏
         * @type {setFoot}
         */
        dialog.setFoot = setFoot;
        /**
         * 设置title
         * @param title
         */
        dialog.setTitle = function(title){
            $root.find("h4[class='modal-title']").empty().append(title);
        };
        return dialog;
    };
});
//@ sourceURL=baseDialog.js