define(["jquery"],function($){
    var status,lastContent,cur=-1;
    var $input,$suggest;
    var typeahead = {
        param: {
            id : null,
            btn : null,
            lazyMatch : true,
            data : null,
            callback : function(data){
                console.log(data);
            }
        },
        fn: {}
    };
    
    /**
    *
    config = {
        id : null,          //页面锚id
        btn : null,        //button名称, 通过是否有值判断是否启用button
        data : data,          //数据地址
        callback : null,    //绑定功能函数
        lazyMatch : true,   //延迟匹配,默认为true
    }
    */
    typeahead.fn.init = function(config){
        $.extend(typeahead.param,config);
        $elem = $("#"+typeahead.param.id);

        //写入html,清除锚点
        var html = '<div class="typeahead">';
        if(!typeahead.param.btn){
            html += '<input type="text" class="form-control typeahead-input">';
        }
        else{
            html += '<div class="input-group">'+
                    '<input type="text" class="form-control typeahead-input">'+
                    '<span class="input-group-btn">'+
                    '<button class="btn btn-primary typeahead-submit" type="button">'+typeahead.param.btn+'</button>'+
                    '</span>'+
                    '</div>';
        }
        html += '<div class="typeahead-suggest"></div></div>';
        $typeahead = $elem.after(html).siblings(".typeahead");
        $elem.remove();

        //获取元素
        $input = $typeahead.find(".typeahead-input").attr("id",typeahead.param.id);
        $suggest = $typeahead.find(".typeahead-suggest");

        //绑定事件
        if (typeahead.param.btn) {
            $typeahead.find(".typeahead-submit").on("click",doEnd);
        };
        $input
            .on("keyup",inputValidation)
            .on("focus",function(){
                if(lastContent&&!status){
                   inputValidation();
                }
            });
        $suggest.on("mouseover",function(){
            $suggest.children("a:focus").blur();
            cur=-1;
        }).delegate("a","click",function(){
            fillInput($(this).text());
            doEnd();
        });
        //绑定键盘事件,额外鼠标事件
        $(document)
            .on("keydown",keyEvent)
            .on("click",function(event){
                if(event.target!=$input[0]){
                    $suggest.hide();
                }
            });
    }
    //设置键盘事件
    function keyEvent(event){
        if(event.which=="13"){
            if (event.target==$input[0]) {
                doEnd();
            }else if(event.target==$suggest.children("a:focus")[0]){
                fillInput($(event.target).text());
            }
        }
        else if (event.which=="40"||event.which=="38") {
            event.preventDefault();
            event.stopPropagation();
            if($suggest.is(":visible")){
                var $list = $suggest.children("a");
                var length = $list.length;
                if(!length){return false;}
                if (event.which=="40") {
                    cur = (++cur+length)%length;
                }else{
                    if (cur===0) {
                        cur=-1;
                        $suggest.children("a:focus").blur();
                        $input.focus();
                        fillInput(lastContent);
                        return false;
                    }else if (cur===-1) {
                        cur=cur+length;
                    }else{
                        cur = (--cur+length)%length;
                    }
                }
                $suggest.children("a:focus").blur();
                var val = ($($list[cur]).focus()).text();
                fillInput(val);
            }
        };
    }
    //检查输入
    function inputValidation(){
        var content = $.trim($input.val());
        lastContent=content;
        endTimeout();
        if (content=="") {$suggest.empty().hide();return false;}
        status=setTimeout(function(){
            status=null;
            cur=-1;
            getData();
        },400);
    }
    //匹配数据并填充推荐列表
    function fillSuggest(data){
        var count = 0;
        data = data ? data : [];
        $suggest.empty();
        for (var i = data.length; --i>-1&&count<10;) {
            var content = data[i];
            if(content.indexOf(lastContent)>-1){
                //var reg = eval("/"+lastContent+"/ig");
                content = content.replace(lastContent,"<span>"+lastContent+"</span>");
                $suggest.append("<a href='#'>"+content+"</a>");
                count++;
            }
        };
        if (count==0) {
            $suggest.append("<p>没有内容</p>");
        }
        $suggest.show();
    }
    
    //获取数据
    function getData() {
        if (typeof typeahead.param.data === "array") {
            return typeahead.param.data;
        }else{
            $.ajax({
                type : "GET",
                url : typeahead.param.data,
                data : lastContent,
                dataType : "json",
                success : function(data){
                    return data;
                },
                error : function(){
                    console.log("ajax error");
                    return null;
                }
            });
        }
    }

    //结束后,执行回调任务,并隐藏推荐列表
    function doEnd (event,data) {
        if(typeof data==="undefined"){data = $.trim($input.val());}
        if (data) {
            endTimeout();
            $suggest.hide();
            typeahead.param.callback(data)
        }
    }

    //回填input
    function fillInput(val){
        val = $.trim(val);
        $input.val(val);
    }
    //清除当前延迟匹配
    function endTimeout(){
        if(status){clearTimeout(status);}
    }
    
    return typeahead.fn;
});