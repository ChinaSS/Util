/**
 * 弹出框组件
config = {
    id:"TestDialog",
    cache:false,                        //是否缓存，默认为true
    title:"测试窗口",
    width:"400px",
    height:"100px",
    dialogSize:"",                      //modal-lg或modal-sm
    body:"窗口中间内容",
    buttons:buttons
};
**/
define(["jquery"],function($){
    var cache={};

    function DialogInit(config){
        //合并参数
        config = $.extend({
            cache:true
        },config);
        //判断是否已缓存
        if (cache[config.id] && config.cache) {
            return cache[config.id];
        }
        //创建并返回新dialog
        return new Dialog(config);
    }

    function Dialog(config){
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
        //生成dialog元素
        this.$dialog = $(dialogHTML.join(""));
        //生成body内容
        this.setBody(config.body||"");
        //生成底部buttons
        this.setFoot(config.buttons||[]);
        //将dialog添加到DOM页面
        $("body").append(this.$dialog);
        //如果不缓存，关闭dialog时需要销毁Dom
        if(config.cache){
            cache[config.id] = this;
        }else{
            this.$dialog.on('hidden.bs.modal', function (e) {
                this.remove();
            })
        }
    }
    //模块通用方法(扩展)
    Dialog.fn = Dialog.prototype = {
        //对象方法扩展API
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Dialog.fn,object);
            }
        },
        $getDialog : function(){
            return this.$dialog;
        },
        show : function(){
            this.$dialog.modal("show");
        },
        hide : function(){
            this.$dialog.modal("hide");
        }
    };

    //对象原型方法
    Dialog.fn.extend({
        setTitle : function(title){
            if (!this.$title) {
                this.$title =  this.$dialog.find("h4[class='modal-title']");
            }
            this.$title.empty().append(title);
        },
        setBody : function(body){
            if (!this.$body) {
                this.$body = this.$dialog.find("div[class='modal-body']");
            }
            this.$body.empty().append(body);
        },
        setFoot : function(buttons,defaultClose){
            var dialog = this;
            if (!this.$foot) {
                this.$foot = this.$dialog.find("div[class='modal-footer']");
            }
            var close = typeof(defaultClose)=="undefined" ? true: defaultClose;
            this.$foot.empty();
            if(buttons && buttons.length){
                for(var i= 0,b;b=buttons[i++];){
                    this.$foot.append(
                        $('<button type="button" class="btn btn-primary" >'+ b.name +'</button>')
                            .bind("click",(function(){
                                var callback = b.callback;
                                return function () {
                                    callback(dialog);
                                }
                            })())
                    );
                }
            }
            this.$foot.append(close?'<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>':"");
        }
    });
    

    return DialogInit;
});