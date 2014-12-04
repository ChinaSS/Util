/**
    config = {
        id : null,          //页面锚id
        btn : null,         //button名称, 通过是否有值判断是否启用button
        data : data,        //数据地址
        lazyMatch : true,   //延迟匹配,默认为true
        dataFormat : null,  //用于自定义每列数据的格式化输出,接受一个数据参数
        callback : null     //绑定功能函数
    }
*/
define(["jquery","css!Util/css/typeahead"],function($){
    var _param = {
        id : null,
        btn : null,
        lazyMatch : true,
        data : null,
        MAX_RESULT : 10,
        key:{
            id : "id",
            data : "data"
        },
        initValue : "",
        dataFormat : null, //function(data){处理数据格式,并返回html结构}
        callback : function(data){
            console.log(data);
        }
    };

    function TypeaheadInit(config){
        config = $.extend(_param,config);
        return new Typeahead(config);
    }

    function Typeahead(config){
        this.status = null,
        this.lastContent = config.initValue,
        this.cur = -1,
        this.config = config;

        var $elem = $("#"+config.id);
        this.$typeahead = $elem.wrap('<div class="typeahead"></div>').parent(".typeahead");
        $elem.after('<div class="typeahead-suggest"></div>');
        if(!!config.btn){
            $elem.
                wrap('<div class="input-group"></div>').
                after('<span class="input-group-btn">'+
                    '<button class="btn btn-primary typeahead-submit" type="button">'+config.btn+'</button>'+
                    '</span>');
        }

        //获取元素
        this.$input = $elem;
        this.$suggest = this.$typeahead.find(".typeahead-suggest");
        this.$submit = this.$typeahead.find(".typeahead-submit");

        $elem.val(this.lastContent);

        this.bindEvent();
    }

    Typeahead.fn = Typeahead.prototype = {
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Typeahead.fn,object);
            }
        },
        $getInput : function(){
            return this.$input;
        },
        $getSuggest : function(){
            return this.$suggest;
        },
        //绑定内部事件
        bindEvent : function(){
            this.EventModal = new EventModal(this);
        }
    };

    Typeahead.fn.extend({

    });

    //内部事件对象构造函数
    function EventModal(obj){
        this.status = obj.status,
        this.lastContent = obj.lastContent,
        this.cur = obj.cur,
        this.config = obj.config,
        this.$input = obj.$input,
        this.$suggest = obj.$suggest,
        this.$submit = obj.$submit;

        var modal = this;
        //绑定事件
        modal.$input.on("keyup",function(){
            modal.inputValidation();
        }).on("focus",function(){
            if(modal.lastContent&&!modal.status){
               modal.inputValidation();
            }
        });
        modal.$suggest.on("mouseover",function(){
            $(this).children("a:focus").blur();
            modal.cur=-1;
        }).delegate("a","click",function(event){
            //console.log(event.target==this)
            var val = $(event.target).text();
            modal.fillInput(val);
            modal.doEnd(event,$(this));
        });

        //绑定键盘事件,额外鼠标事件
        $(document).on("keydown",function(event){
            modal.keyEvent(event);
        }).on("click",function(event){
            if(event.target!=modal.$input[0]){
                modal.$suggest.hide();
            }
        });
    }

    EventModal.fn = EventModal.prototype = {
        keyEvent : function(event){ //键盘事件
            var modal = this,cur;
            if(event.which=="13"){
               if(event.target==modal.$suggest.children("a:focus")[0]){
                    modal.doEnd(event,$(event.target));
               }
            }
            else if (event.which=="40"||event.which=="38") {
                event.preventDefault();
                event.stopPropagation();
                cur = modal.cur;
                if(modal.$suggest.is(":visible")){
                    var $list = modal.$suggest.children("a");
                    var length = $list.length;
                    if(!length){return false;}
                    if (event.which=="40") {
                        cur = (++cur+length)%length;
                    }else{
                        if (cur===0) {
                            modal.cur=-1;
                            modal.$suggest.children("a:focus").blur();
                            modal.$input.focus();
                            modal.fillInput(modal.lastContent);
                            return false;
                        }else if (cur===-1) {
                            cur = cur+length;
                        }else{
                            cur = (--cur+length)%length;
                        }
                    }
                    modal.cur = cur;
                    modal.$suggest.children("a:focus").blur();
                    var val = ($($list[cur]).focus()).text();
                    modal.fillInput(val);
                }

            }
        },
        inputValidation : function(){   //检查输入
            var modal = this;
            var content = $.trim(modal.$input.val());
            modal.lastContent=content;
            modal.endTimeout();
            if (content=="") {modal.$suggest.empty().hide();return false;}
            modal.status=setTimeout(function(){
                modal.status=null;
                modal.cur=-1;
                modal.getData();
            },400);
        },
        fillSuggest : function(data){   //匹配数据并填充推荐列表
            var modal = this,
                cur = "",
                id = "",
                lastContent= this.lastContent;
            modal.$suggest.empty();
            if (!!data.length) {
                for (var i = data.length; --i>-1;) {
                    var $cur = null;
                    cur = data[i];
                    cur = (typeof cur == "object")?cur[this.config.key.data]:cur;
                    //格式化输出内容
                    if (!!modal.config.dataFormat) {
                        cur = modal.config.dataFormat(cur);
                    } else {
                        cur = cur.replace(lastContent,"<span class='match'>"+lastContent+"</span>");
                    }
                    $cur = $("<a href='#'>"+cur+"</a>");
                    $cur.data("originData",data[i]);
                    modal.$suggest.append($cur);
                }
            } else {
                modal.$suggest.append("<p>没有结果</p>");
            }
            modal.$suggest.show();
        },
        dataFilter : function(data){
            var dataArr = [],cur="",count = 0, value = "";
            for (var i = data.length; --i>-1&&count<this.config.MAX_RESULT;) {
                cur = data[i];
                if((typeof cur == "object")&&cur[this.config.key.data].indexOf(this.lastContent)>-1){
                    dataArr.push(cur);
                    count++;
                } else if((typeof cur == "string")&&cur.indexOf(this.lastContent)>-1){
                    dataArr.push(cur);
                    count++;
                }
            }
            this.fillSuggest(dataArr);
        },
        getData : function() {  //获取数据
            var modal = this,
                data = this.config.data;
            if (typeof data !== "string") {
                modal.dataFilter(data);
            }else{
                $.ajax({
                    type : "GET",
                    url : data,
                    data : modal.lastContent,
                    dataType : "json",
                    success : function(data){
                        modal.dataFilter(data);
                    },
                    error : function(){
                        console.log("ajax error");
                        return null;
                    }
                });
            }
        },
        doEnd : function(event,$elem){ //结束后,执行回调任务,并隐藏推荐列表
            event.preventDefault();
            this.fillInput($elem.text());
            this.$input.attr("id",$elem[0].id);
            this.config.callback($elem.data("originData"));
        },
        fillInput : function(val){  //回填input
            val = $.trim(val);
            this.$input.val(val);
        },
        endTimeout : function(){    //清除当前延迟匹配
            if(this.status){clearTimeout(this.status)}
        }
    }; 
    
    return TypeaheadInit;
});