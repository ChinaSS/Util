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
define(["jquery"],function($){
    var cache={};
    function baseDialog(config){
        //合并参数
        config = $.extend({
            cache:true
        },config);
        //判断是否已缓存
        if (cache[config.id] && config.cache) {
            return cache[config.id].modal("show");
        };
        //创建并返回新dialog
        return new baseDialogInit(config);
    }

    function baseDialogInit(config){
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
        //dialog初始化
        this.$dialog.modal(config.modal||'show');
        //如果不缓存，关闭dialog时需要销毁Dom
        if(config.cache){
            cache[config.id] = this.$dialog;
        }else{
            this.$dialog.on('hidden.bs.modal', function (e) {
                this.remove();
            })
        }
    };

    baseDialogInit.prototype = {
        setTitle : function(title){
            if (!this.$title) {
                this.$title =  this.$dialog.find("h4[class='modal-title']");
            };
            this.$title.empty().append(title);
        },
        setBody : function(body){
            if (!this.$body) {
                this.$body = this.$dialog.find("div[class='modal-body']");
            };
            this.$body.empty().append(body);
        },
        setFoot : function(buttons,defaultClose){
            if (!this.$foot) {
                this.$foot = this.$dialog.find("div[class='modal-footer']");
            };
            var close = typeof(defaultClose)=="undefined" ? true: defaultClose;
            this.$foot.empty();
            if(buttons && buttons.length){
                for(var i= 0,b;b=buttons[i++];){
                    this.$foot.append($('<button type="button" class="btn btn-primary" '+ (b.close?'data-dismiss="modal"':'') +'>'+ b.name +'</button>').bind("click", b.callback));
                }
            }
            this.$foot.append(close?'<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>':"");
        }
    }

    baseDialog.fn = baseDialog.prototype = {

    }

    return baseDialog;
});
//@ sourceURL=baseDialog.js