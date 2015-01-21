/**
 config = {
    id : id,        //element ID
    type : selected,  //select,checkbox
    searchAble : true,    //当数据为多层级,需树状显示时, 并提供关键字检索功能
    data : url,     //url,[]
    onSelect : function(obj){}, //obj:当前点击的数据对象
    callback : function(data,arrObj){}, //data:所有选中数据id的数组,arrObj:所有选中数据对象的数组,
    key : {
        id : "id",
        name : "name",
        data : "data"
    },
    initData:[]
 }
**/
define(["jquery","./treeSearch","css!UtilDir/css/inputSelect.css"],function($,search){
    var cache = {},
        selectEvent = "mouseup";
    function init(config){
        return new Input(config);
    }

    function Input(config){
        var $input = $("#"+config.id);
        $input.addClass("inputSelect").wrap('<div class="inputWrapper"></div>');
        if ($input.length!=1) {
            return cache[config.id];
        }
        this.config = $.extend(true,{
            type : "checkbox",
            searchAble : false,
            inputClass : "inputSelect",
            panelClass : "inputPanel",
            key : {
                id : "id",
                name : "name",
                data : "data"
            },
            initData : []
        },config);

        if(!cache[config.id]||!$input.siblings(".inputPanel").length){
            this.$input = $input;
            this.initPanel();
            bindEvent(this);
            cache[config.id]=this;
        }else{
            return cache[config.id];
        }
    }
    function bindDocumentEvent(input){
        $(document).bind(selectEvent,function(event){
            if ($(event.target).is("."+input.config.inputClass)||$(event.target).is("."+input.config.panelClass)||$(event.target).parents("."+input.config.panelClass).length>0) {return false};
            input.hidePanel();
        });
    }
    function bindEvent(input){
        //输入框点击事件
        input.$input.on(selectEvent,function(event){
            if($(this).is(":disabled,[readonly]")){
                return false;
            }
            if(input.$panel.is(":hidden")){
                $(".inputPanel:visible").siblings(".inputSelect").each(function(){
                    cache[this.id].hidePanel();
                });
                input.togglePanel();
                bindDocumentEvent(input);
            }else{
                input.togglePanel();
            }
        }).on("focus",function(){
            $(this).blur();
        });
        input.$content.on(selectEvent,".remove",function(event){
            event.preventDefault();
            event.stopPropagation();
            input.showPanel();
            bindDocumentEvent(input);
            var item = $(this).parent()[0];
            input.fillInput(item.firstChild.nodeValue,item.id);
            input.$panel.find("input:checked").each(function(){
                var id = $(this).siblings("span").data("id");
                if(id==item.id){
                    input.setCheckbox($(this).parent());
                    return false;
                }
            });
        });
        //面板点击事件
        if (input.config.type=="checkbox") {
            input.$panel.on(selectEvent,".item",function(event){
                var id = $(this).children(".text").data("id"),
                    value = $(this).children(".text").text(),
                    obj={};
                obj[input.config.key.id]=id;
                obj[input.config.key.name]=value;
                if (event.target.nodeName!="INPUT") {
                    input.setCheckbox($(this));
                }
                input.fillInput(value,id);
                input.config.onSelect?input.config.onSelect(obj):"";
            });
        } else if (input.config.type=="select") {
            input.$panel.on(selectEvent,".item",function(event){
                var id = $(this).children(".text").data("id"),
                    value = $(this).children(".text").text(),
                    obj={};
                obj[input.config.key.id]=id;
                obj[input.config.key.name]=value;
                input.clearInput();
                input.fillInput(value,id);
                input.config.onSelect?input.config.onSelect(obj):"";
                input.hidePanel();
            });
        }
        
    }
    Input.fn = Input.prototype = {
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Input.fn,object);
            }
        },
        refreshPanel : function (data) {
            this.config.data = data;
            this.getData();
        },
        dataInit : function(data){ //data 为id数组
            var dataObj={},
                idArray=[],
                i,length;
            var input = this;
            if(!data||data.constructor !== Array){
                data = data?data.split(","):[];
            }
            dataObj = this.getCurrentData();
            for (i = 0,length=dataObj.length; i < length; i++) {
                idArray.push(dataObj[i][this.config.key.id]);
            }
            if(data.join(",")==idArray.join(",")){return;}
            dataObj={};
            this.config.initData=data;
            for(i=0,length=data.length;i<length;i++){
                dataObj[data[i]]=true;
            }
            this.clearInput();
            if(this.config.type=="checkbox") {
                this.resetPanel();
            }
            if(dataObj.valueOf()=={}.valueOf()){return;}
            this.$panel.find(".item .text").each(function(){
                if(dataObj[$(this).data("id")]){
                    if (input.config.type=="checkbox") {
                        input.setCheckbox($(this).parent());
                    }
                    input.fillInput($(this).text(),$(this).data("id"));
                    return --length?true:false;
                }
            });
        }
    };

    Input.fn.extend({
        initPanel : function(){
            var offset = this.$input.offset();
            this.$panel = $("<div class='inputPanel'></div>");
            this.$content = $("<div class='inputContent'></div>");
            this.$panel.append("<div class='panelData'></div>");
            this.$input.parent().append(this.$panel).append(this.$content).css({
                "position" : "relative"
            });
            this.$content.css({
                "top" : this.$input.parent().css("padding-top"),
                "left" : this.$input.parent().css("padding-left")
            });
            search.treeInit(this.$panel.children(".panelData"));
            if (this.config.searchAble) {
                var $panelSearch = $("<input class='panelSearch form-control'>");
                this.$panel.prepend($panelSearch);
                search.listen($panelSearch);
            }
            this.getData();
        },
        getData : function(){
            var _this = this,
                data = this.config.data;
            if (typeof data !== "string") {
                _this.fillPanel(data);
            } else {
                $.ajax({
                    type : "GET",
                    url : data,
                    dataType : "json",
                    success : function(data){
                        _this.fillPanel(data);
                    },
                    error : function(){
                        _this.fillInput("数据获取失败");
                    }
                });
            }
        },
        fillPanel : function(data){
            this.refreshPanel(data);
            this.dataInit(this.config.initData);
        },
        refreshPanel : function(data){
            this.$panel.children(".panelData").empty().append(this.initItem(data));
        },
        initItem : function(items,lvl){
            var i,length,cur,li="",html="";
            var id = this.config.key.id,
                name = this.config.key.name,
                data = this.config.key.data,
                hasData = false;
            lvl = (lvl&&lvl>0)?parseInt(lvl):0;
            for(i=0,length=items.length;i<length;i++){
                cur = items[i];
                hasData = cur[data]&&cur[data].length>0;
                if(!cur){continue;}
                if (this.config.type=="select"||hasData) {
                    li =  "<a class='"+(hasData?"node":"item")+(lvl==0&&hasData?" open":"")+"'"+(hasData?"":" title='"+cur[name]+"'")+" style='padding-left:"+(10*lvl)+"px'>"+
                            "<span class='pic'></span>"+
                            "<span class='text' data-id="+cur[id]+">"+cur[name]+"</span>"+
                            "</a>";
                } else if (this.config.type=="checkbox") {
                    li =  "<a class='"+(hasData?"node":"item")+(lvl==0&&hasData?" open":"")+"'"+(hasData?"":" title='"+cur[name]+"'")+" style='padding-left:"+(10*lvl)+"px'>"+
                            "<input type='checkbox'>"+
                            "<span class='text' data-id="+cur[id]+">"+cur[name]+"</span>"+
                            "</a>";
                }
                if (hasData) {
                    li += this.initItem(cur[data],lvl+1);
                }                
                html = html + "<li"+(lvl==0?" class='top'":"")+">"+li+"</li>";
            }
            return "<ul>"+html+"</ul>";
        },
        fillInput : function(val,id){  //回填input
            var $item=null;
            if(!id){
                this.$input.val(val);
                return;
            }
            if (this.config.type=="select") { //单选
                this.$input.data("id",$.trim(id));
                this.$input.val($.trim(val));
            } else if (this.config.type=="checkbox") { //多选
                $item = this.$content.children("#"+id);
                if($item.length==0){
                    this.$content.append("<a id='"+id+"'>"+val+"<span class='remove'>x</span></a>");
                }else{
                    $item.remove();
                }
            }
        },
        getCurrentData : function(){
            var obj,objArray=[];
            var _this = this;
            if (this.config.type=="select") { //单选
                obj={};
                obj[_this.config.key.id]=this.$input.data("id");
                obj[_this.config.key.name]=this.$input.val();
                objArray.push(obj);
            } else if (this.config.type=="checkbox") { //多选
                this.$content.children("a").each(function(){
                    obj={};
                    obj[_this.config.key.id]=this.id;
                    obj[_this.config.key.name]=this.firstChild.nodeValue;
                    objArray.push(obj);
                });   
            }
            return objArray;
        },
        clearInput : function(){
            this.$input.val("");
            if (this.config.type=="select") { //单选
                this.$input.data("id","");
            } else if (this.config.type=="checkbox") { //多选
                this.$content.empty();
            }
        },
        resetPanel : function(){
            this.$panel.find("input:checked").removeAttr("checked");
        },
        showPanel : function(){
            if(!this.$panel[0].style.width){
                this.$panel.css({
                    "top" : this.$input.outerHeight()*1+this.$input.parent().css("padding-top")*1,
                    "left" : this.$input.parent().css("padding-left"),
                    "width" : this.$input.outerWidth(),
                    "max-height" : this.$input.height()*10
                });
                this.$panel.children(".panelSearch").css({
                    "width" : this.$input.width()
                });
            }
            this.$panel.children(".panelSearch").val("");
            search.reset(this.$panel.children(".panelData"));
            this.$panel.show();
        },
        hidePanel : function(){
            if(!!this.config.callback){
                var objArray = this.getCurrentData();
                var idArray = [];
                for (var i = 0,length=objArray.length; i <length; i++) {
                    idArray.push(objArray[i][this.config.key.id]);
                }
                this.config.callback(idArray,objArray);
            }
            $(document).unbind(selectEvent);//隐藏panel时,解除document事件绑定
            this.$panel.hide();
        },
        togglePanel : function(){
            this.$panel.is(":visible")?this.hidePanel():this.showPanel();
        },
        setCheckbox : function($item){
            if($item.has("input:checked").length){
                $item.find("input").removeAttr("checked");
                //$(item).find("input")[0].checked="";
            } else {
                $item.find("input")[0].checked=true;
            }
        }
    });
    
    return init;
});