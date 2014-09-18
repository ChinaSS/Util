define(["jquery"],function($){
    var status,lastContent,cur=-1;
    var $input,$suggest,$btn;
    var result = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
    var typeahead = {
        param: {
            id : null,
            text : "Search",
            lazyMatch : true,
            callback : function(data){
                console.log(data);
            }
        },
        fn: {},//外部api
    }
    
    /**
    *
    config = {
        id : null,          //页面锚id
        text : null,        //功能名称
        url : url,          //数据地址
        callback : null,    //绑定功能函数
        lazyMatch : true,   //延迟匹配,默认为true
    }
    */
    typeahead.fn.init = function(config){
        preload(config);
        $btn.on("click",doSearch);
        $input.on("keyup",inputValidation);
        $suggest.on("mouseover",function(){
            $suggest.children("a:focus").blur();
            cur=-1;
        }).delegate("a","click",function(){
            fillInput($(this).text());
            doSearch();
        });
        $(document)
            .on("keydown",keyEvent)
            .on("click",function(event){
                if(event.target==$input[0]){
                    inputValidation();
                    if(!status&&lastContent.length>1){$suggest.show();}
                }
                else{
                    $suggest.hide();
                }
            });
    }
    function preload(config){
        $.extend(typeahead.param,config);
        $elem = $("#"+typeahead.param.id);
        var html =  '<div class="typeahead">'+
                    '<div class="input-group">'+
                    '<input type="text" class="form-control typeahead-input">'+
                    '<span class="input-group-btn">'+
                    '<button class="btn btn-primary typeahead-submit" type="button">'+typeahead.param.text+'</button>'+
                    '</span>'+
                    '</div>'+
                    '<div class="typeahead-suggest"></div>';
                    '</div>'
        $typeahead = $elem.after(html).siblings(".typeahead");
        $elem.remove();
        $input = $typeahead.find(".typeahead-input").attr("id",typeahead.param.id);
        $btn = $typeahead.find(".typeahead-submit");
        $suggest = $typeahead.find(".typeahead-suggest");
        callback = typeahead.param.callback;
    }
    function keyEvent(event){
        if(event.which=="13"){
            if (event.target==$input[0]) {
            //doSearch(); //same action bind in certain plugin, maybe bind enter key action on btn
            }else if(event.target==$suggest.children("a:focus")[0]){
                fillInput($(event.target).text());
                //doSearch();
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
    function inputValidation(){
        var content = $.trim($input.val());
        if (content==lastContent) {return false};
        lastContent=content;
        endTimeout();
        if (content.length<1) {$suggest.hide();return false;}
        status=setTimeout(function(){
            status=null;
            cur=-1;
            doMatch();
        },400);
    }
    function fillSuggest(data){
        var count = 0;
        $suggest.empty();
        if (!data) {noSuggest();return false;};
        for (var i = data.length; --i&&count<10;) {
            var content = data[i];
            if(content.indexOf(lastContent)>-1){
                //var reg = eval("/"+lastContent+"/ig");
                var mark = "<span>"+lastContent+"</span>";
                var content = content.replace(lastContent,mark);
                $suggest.append("<a href='#'>"+content+"</a>");
                count++;
            }
        };
         if (!count) {noSuggest();return false;}
    }
    function noSuggest(){
        $suggest.append("<p>no suggest</p>");
    }
    function doMatch () {
        fillSuggest(result);
/*
        $.ajax({
            url : typeahead.param.url,
            context : $suggest[0],
            success : fillSuggest,
            error : function(){
                fillSuggest(null);
            }
        });
*/
        $suggest.show();
    }
    function doSearch (event,data) {
        if(typeof data==="undefined"){data = $.trim($input.val());}
        if (data) {
            endTimeout();
            $suggest.hide();
            callback(data)
        }
        $btn.blur();
    }
    function endTimeout(){
        if(status){clearTimeout(status);}
    }
    function fillInput(val){
        $input.val(val);
    }

    return typeahead.fn;
});