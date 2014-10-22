/**
    config = {
        id : null,          //页面锚id
        btn : null,        //button名称, 通过是否有值判断是否启用button
        data : data,          //数据地址
        callback : null,    //绑定功能函数
        lazyMatch : true,   //延迟匹配,默认为true
    }
*/
define(["jquery"],function($){
    var _param = {
        id : null,
        btn : null,
        lazyMatch : true,
        data : null,
        callback : function(data){
            console.log(data);
        }
    };
    function TypeaheadInit(config){
        config = $.extend(_param,config);
        return new Typeahead(config);
    }
    function Typeahead(config){
        this.status,
        this.lastContent,
        this.cur=-1,
        this.config = config;

        var $elem = $("#"+config.id);
        //写入html,清除锚点
        var html = '<div class="typeahead">';
        if(!config.btn){
            html += '<input type="text" class="form-control typeahead-input">';
        }
        else{
            html += '<div class="input-group">'+
                    '<input type="text" class="form-control typeahead-input">'+
                    '<span class="input-group-btn">'+
                    '<button class="btn btn-primary typeahead-submit" type="button">'+config.btn+'</button>'+
                    '</span>'+
                    '</div>';
        }
        html += '<div class="typeahead-suggest"></div></div>';
        this.$typeahead = $(html);
        $elem.before(this.$typeahead);
        $elem.remove();

        //获取元素
        this.$input = this.$typeahead.find(".typeahead-input");
        this.$suggest = this.$typeahead.find(".typeahead-suggest");

        bindEvent(this);
        
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
        }
    };

    Typeahead.fn.extend({
        
    });
    function bindEvent(obj){
        //绑定事件
        if (obj.config.btn) {
            obj.$typeahead.find(".typeahead-submit").on("click",function(event){
                doEnd(event,obj);
            });
        };
        obj.$input.on("keyup",function(){
            inputValidation(obj);
        }).on("focus",function(){
            if(obj.lastContent&&!obj.status){
               inputValidation(obj);
            }
        });
        obj.$suggest.on("mouseover",function(){
            $(this).children("a:focus").blur();
            obj.cur=-1;
        }).delegate("a","click",function(){
            //console.log(event.target==this)
            var val = $(event.target).text();
            fillInput(val,obj);
            doEnd(event,obj);
        });

        //绑定键盘事件,额外鼠标事件
        $(document).on("keydown",function(event){
            keyEvent(event,obj);
        }).on("click",function(event){
            if(event.target!=obj.$input[0]){
                obj.$suggest.hide();
            }
        });
    };
    //设置键盘事件
    function keyEvent(event,obj){
        if(event.which=="13"){
            if (event.target==obj.$input[0]) {
                doEnd(event,obj);
            }else if(event.target==obj.$suggest.children("a:focus")[0]){
                fillInput($(event.target).text(),obj);
            }
        }
        else if (event.which=="40"||event.which=="38") {
            event.preventDefault();
            event.stopPropagation();
            if(obj.$suggest.is(":visible")){
                var $list = obj.$suggest.children("a");
                var length = $list.length;
                if(!length){return false;}
                if (event.which=="40") {
                    obj.cur = (++obj.cur+length)%length;
                }else{
                    if (obj.cur===0) {
                        obj.cur=-1;
                        obj.$suggest.children("a:focus").blur();
                        obj.$input.focus();
                        fillInput(obj.lastContent,obj);
                        return false;
                    }else if (obj.cur===-1) {
                        obj.cur=obj.cur+length;
                    }else{
                        obj.cur = (--obj.cur+length)%length;
                    }
                }
                obj.$suggest.children("a:focus").blur();
                var val = ($($list[obj.cur]).focus()).text();
                fillInput(val,obj);
            }
        };
    }

    //检查输入
    function inputValidation(obj){
        var content = $.trim(obj.$input.val());
        obj.lastContent=content;
        endTimeout(obj.status);
        if (content=="") {obj.$suggest.empty().hide();return false;}
        obj.status=setTimeout(function(){
            obj.status=null;
            obj.cur=-1;
            getData(obj);
        },400);
    }

    //匹配数据并填充推荐列表
    function fillSuggest(data,obj){
        var count = 0;
        data = data ? data : [];
        obj.$suggest.empty();
        for (var i = data.length; --i>-1&&count<10;) {
            var content = data[i];
            if(content.indexOf(obj.lastContent)>-1){
                //var reg = eval("/"+lastContent+"/ig");
                content = content.replace(obj.lastContent,"<span>"+obj.lastContent+"</span>");
                obj.$suggest.append("<a href='#'>"+content+"</a>");
                count++;
            }
        };
        if (count==0) {
            obj.$suggest.append("<p>no suggest</p>");
        }
        obj.$suggest.show();
    }
    
    //获取数据
    function getData(obj) {
        var data = obj.config.data;
        if (typeof data !== "string") {
            fillSuggest(data,obj);
        }else{
            $.ajax({
                type : "GET",
                url : data,
                data : obj.lastContent,
                dataType : "json",
                success : function(data){
                    fillSuggest(data,obj);
                },
                error : function(){
                    console.log("ajax error");
                    return null;
                }
            });
        }
    }
    //结束后,执行回调任务,并隐藏推荐列表
    function doEnd(event,obj) {
        var data = $.trim(obj.$input.val());
        if (data) {
            endTimeout(obj.status);
            obj.$suggest.hide();
            obj.config.callback(data)
        }
    }

    //回填input
    function fillInput(val,obj){
        val = $.trim(val);
        obj.$input.val(val);
    }
    //清除当前延迟匹配
    function endTimeout(status){
        if(status){clearTimeout(status);}
    }
    
    return TypeaheadInit;
});