/**
    config = {
        id : null,          //页面锚id
        btn : "",         //button名称, 通过是否有值判断是否启用button
        data : data,        //数据地址
        filter : false,     //是否对数据启用前端匹配
        lazyMatch : true,   //延迟匹配,默认为true
        key : null,         //
        dataFormat : null,  //自定义每列的数据显示格式的对象数组, 每个对象定义一列数据
        callback : null     //绑定功能函数
    }
*/
define(["jquery","css!UtilDir/css/typeahead.css"],function($){
    function TypeaheadInit(config){
        var _param = {
            id : null,
            btn : "",
            lazyMatch : true,
            data : [],
            filter : false,
            MAX_RESULT : 100,
            key:{
                id : "id",
                data : "data"
            },
            dataFormat : null, //
            callback : function(data){
                console.log(data);
            }
        };
        config.key = $.extend(_param.key,config.key);
        config = $.extend(_param,config);
        return new Typeahead(config);
    }

    function Typeahead(config){
        this.status = null,
        this.lastContent = "",
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

        this.bindEvent();
    }

    Typeahead.fn = Typeahead.prototype = {
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Typeahead.fn,object);
            }
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
        $.extend(this,obj);
        var modal = this;
        //绑定事件
        modal.$input.on("keyup",function(event){
            modal.keyEvent(event);
        }).on("focus",function(){
            modal.inputValidation();
        }).on("blur",function(){
            if(modal.$suggest.is(":visible")){
                modal.hideSuggest();
            }
        });
        modal.$suggest.
            on("mouseenter",function(){
                $(this).children("a.cur").removeClass("cur");
            }).
            on("mouseleave",function(event){
                $(event.target).addClass("cur");
            }).
            delegate("a","mousedown",function(event){
                if(!!modal.config.dataFormat){
                    modal.lastContent = $(this).children("."+modal.config.key.data).text();
                }else{
                    modal.lastContent = $(this).text();
                }
                modal.doEnd(event,$(this));
            });
    }

    EventModal.fn = EventModal.prototype = {
        keyEvent : function(event){ //键盘事件
            var modal = this;
            var $list = modal.$suggest.children("a"),
                length = $list.length;
            var $cur = $list.filter(".cur"),
                cur = $list.index($cur);
            if(event.which=="13"){
                if($cur.length>0){
                    modal.lastContent = $cur.text();
                    modal.doEnd(event,$cur);
                }
            }
            else if (event.which=="40"||event.which=="38") {
                event.preventDefault();
                event.stopPropagation();

                if(!!length&&modal.$suggest.is(":visible")){
                    if (event.which=="40") {
                        cur = (++cur+length)%length;
                    }else{
                        if (cur===0) {
                            $($list[0]).removeClass("cur");
                            modal.fillInput(modal.lastContent);
                            return;
                        }else if (cur===-1) {
                            cur = cur+length;
                        }else{
                            cur = (--cur+length)%length;
                        }
                    }
                    $cur.removeClass("cur");
                    modal.fillInput($($list[cur]).addClass("cur").text());
                }else{
                    //history
                }
            } else {
                modal.inputValidation();
            }
        },
        inputValidation : function(){   //检查输入
            var modal = this;
            var content = $.trim(modal.$input.val());
            modal.lastContent=content;
            modal.endTimeout();
            if (content=="") {
                modal.$suggest.empty();
                modal.$suggest.append("<p>请输入汉字进行搜索</p>");
                modal.$suggest.show();
                return false;
            }
            modal.status=setTimeout(function(){
                modal.status=null;
                modal.getData();
            },400);
        },
        fillSuggest : function(data){   //处理匹配数据并填充推荐列表
            var modal = this,
                cur = "",
                dataFormat = modal.config.dataFormat,
                lastContent= this.lastContent;
            modal.$suggest.empty();
            if(!!this.config.filter){
                data = modal.dataFilter(data);
            }
            if (!!data.length) {
                if(!!dataFormat){
                    var formatHtml="";
                    for(var j=0, length=dataFormat.length;j<length;j++){
                        formatHtml+="<span style='width:"+(dataFormat[j]["width"]?dataFormat[j]["width"]:100/dataFormat.length)+"%'>"+dataFormat[j]["field"]+"</span>";
                    }
                    modal.$suggest.append("<p>"+formatHtml+"</p>");
                }
                for (var i = data.length; --i>-1;) {
                    var $cur = null;
                    cur = data[i];
                    //格式化输出内容
                    if (!!dataFormat) {
                        formatHtml="";
                        for(j=0, length=dataFormat.length;j<length;j++){
                            var value = data[i][dataFormat[j]["key"]];
                            formatHtml+="<span class="+dataFormat[j]["key"]+" style='width:"+(dataFormat[j]["width"]?dataFormat[j]["width"]:100/dataFormat.length)+"%'>"+value?value:""+"</span>";
                        }
                        cur = formatHtml;
                    } else {
                        cur = (typeof cur == "object")?cur[this.config.key.data]:cur;
                        cur = cur.replace(lastContent,"<i class='match'>"+lastContent+"</i>");
                        cur = "<span>"+cur+"</span>";
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
        dataFilter : function(data){    //过滤匹配数据
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
            return dataArr;
        },
        getData : function() {  //获取数据
            var modal = this,
                data = this.config.data;
            if (typeof data !== "string") {
                modal.fillSuggest(data);
            } else {
                $.ajax({
                    type : "POST",
                    url : data,
                    data : {
                      q : modal.lastContent
                    },
                    dataType : "json",
                    success : function(data){
                    	modal.fillSuggest(data);
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
            this.hideSuggest();
            this.fillInput(this.lastContent);
            this.config.callback($elem.data("originData"));
        },
        hideSuggest : function(){
            this.$suggest.hide();
            this.$suggest.children("a.cur").removeClass("cur");
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