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
        this.status=null,
        this.lastContent="",
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
        this.$submit = this.$typeahead.find(".typeahead-submit");

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
    	this.status=obj.status,
        this.lastContent=obj.lastContent,
        this.cur=obj.cur,
        this.config=obj.config;

        this.$input = obj.$input,
        this.$suggest = obj.$suggest,
        this.$submit = obj.$submit;

        var modal = this;
        //绑定事件
        if (modal.config.btn) {
            modal.$submit.on("click",function(){
            	modal.doEnd();
            });
        }
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
        }).delegate("a","click",function(){
            //console.log(event.target==this)
            var val = $(event.target).text();
            modal.fillInput(val);
            modal.doEnd();
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
    	keyEvent : function(event){	//键盘事件
    		var modal = this,cur;
	        if(event.which=="13"){
	            if (event.target==modal.$input[0]) {
	                modal.doEnd();
	            }else if(event.target==modal.$suggest.children("a:focus")[0]){
	                modal.fillInput($(event.target).text());
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
	    inputValidation : function(){	//检查输入
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
	    fillSuggest : function(data){	//匹配数据并填充推荐列表
	        var modal = this,
	        	count = 0,
	        	lastContent= this.lastContent;
	        data = data ? data : [];
	        modal.$suggest.empty();
	        for (var i = data.length; --i>-1&&count<10;) {
	            var content = data[i];
	            if(content.indexOf(lastContent)>-1){
	                //var reg = eval("/"+lastContent+"/ig");
	                content = content.replace(lastContent,"<span>"+lastContent+"</span>");
	                modal.$suggest.append("<a href='#'>"+content+"</a>");
	                count++;
	            }
	        }
	        if (count==0) {
	            modal.$suggest.append("<p>no suggest</p>");
	        }
	        modal.$suggest.show();
	    },
	    getData : function() {	//获取数据
	    	var modal = this,
	        	data = this.config.data;
	        if (typeof data !== "string") {
	            modal.fillSuggest(data);
	        }else{
	            $.ajax({
	                type : "GET",
	                url : data,
	                data : modal.lastContent,
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
	    doEnd : function(){	//结束后,执行回调任务,并隐藏推荐列表
	        var data = $.trim(this.$input.val());
	        if (data) {
	            this.endTimeout();
	            this.$suggest.hide();
	            this.config.callback(data)
	        }
	    },
	    fillInput : function(val){	//回填input
	        val = $.trim(val);
	        this.$input.val(val);
	    },
	    endTimeout : function(){	//清除当前延迟匹配
	        if(this.status){clearTimeout(this.status)}
	    }
    }; 
    
    return TypeaheadInit;
});