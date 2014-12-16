/**
 config = {
    id : id,        //element ID
    type : selected,  //select,checkbox
    searchAble : true,    //当数据为多层级,需树状显示时, 并提供关键字检索功能
    data : url,     //url,[]
    onSelect : function(obj){}, //obj:当前点击的数据对象
    callback : function(data){}, //data:所有选中id的数组
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
        this.$input = $("#"+config.id);
        this.$input.addClass("inputSelect");
        if (this.$input.length!=1) {
            return;
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
            initData : null
        },config);

        if(!cache[config.id]||!this.$input.siblings(".inputPanel").length){
            this.initPanel();
            bindEvent(this);
            cache[config.id]=this;
        }else{
            this.$panel = cache[config.id].$panel.empty();
        }
        this.getData();
    }
    
    function bindEvent(input){
        //输入框点击事件
        input.$input.on(selectEvent,function(event){
            input.togglePanel();
            $(document).bind(selectEvent,function(event){
                if ($(event.target).is("."+input.config.inputClass)||$(event.target).is("."+input.config.panelClass)||$(event.target).parents("."+input.config.panelClass).length>0) {return false};
                input.hidePanel();
                $(document).unbind(selectEvent);
            })
        }).on("focus",function(){
            $(this).blur();
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
                    input.setCheckbox(this);
                }
                input.fillInput(value,id);
                input.config.onSelect(obj);
            });
        } else if (input.config.type=="select") {
            input.$panel.on(selectEvent,".item",function(event){
                var id = $(this).children(".text").data("id"),
                    value = $(this).children(".text").text(),
                    obj={};
                obj[input.config.id]=id;
                obj[input.config.name]=value;
                input.clearInput();
                input.fillInput(value,id);
                input.config.onSelect(obj);
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
        dataInit : function(data){ //data 为id数组
            var dataObj = {},
                i,length;
            this.config.initData = data;
            for(i=0,length=data.length;i<length;i++){
                dataObj[data[i]]=true;
            }
            this.clearInput();
            if(this.config.type=="checkbox") {
                this.resetPanel();
            }
            this.$panel.find(".item .text").each(function(){
                if(dataObj[$(this).data("id")]){
                    $(this)[selectEvent]();
                }
            });
        },
        refreshPanel : function(data){
            this.$panel.children(".panelData").empty().append(this.initItem(data));
        }
    };

    Input.fn.extend({
        initPanel : function(){
            var offset = this.$input.offset();
            this.$panel = $("<div class='inputPanel'></div>");
            this.$input.parent().append(this.$panel);
        },
        getData : function(){
            var _this = this,
                data = this.config.data;
            _this.clearInput();
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
            var html = this.initItem(data);
            this.$panel.append("<div class='panelData'>"+html+"</div>");
            search.treeInit(this.$panel.children(".panelData"));
            if (this.config.searchAble) {
                var $panelSearch = $("<input class='panelSearch form-control'>");
                this.$panel.prepend($panelSearch);
                search.listen(this.$panel.children(".panelSearch"));
            }
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
                    li =  "<a class='"+(hasData?"node":"item")+(lvl==0&&hasData?" open":"")+"' style='padding-left:"+(10*lvl)+"px'>"+
                            "<span class='pic'></span>"+
                            "<span class='text' data-id="+cur[id]+">"+cur[name]+"</span>"+
                            "</a>";
                } else if (this.config.type=="checkbox") {
                    li =  "<a class='item' style='padding-left:"+10*lvl+"px'>"+
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
            var oldValue = this.$input.val(),
                oldIds = this.$input.data("ids");
            if (this.config.type=="select") { //单选
                this.$input.data("ids",$.trim(id));
                this.$input.val($.trim(val));
            } else if (this.config.type=="checkbox") { //多选
                id?this.$input.data("ids",this.toggleData(id,oldIds)):null;
                val?this.$input.val(this.toggleData(val,oldValue)):null;
            }
        },
        toggleData : function(data,oldData){
            data = $.trim(data);
            if (!oldData) {
                return data;
            } else {
                if(oldData.indexOf(data)>-1){
                    var dataArr = oldData.split(","),
                        cur="",
                        i;
                    for (i = 0; i < dataArr.length; i++) {
                        cur = $.trim(dataArr[i]);
                        if (cur==data) {
                            dataArr.splice(i,1);
                            data="";
                            break;
                        }
                    }
                    if (data) {
                        dataArr.push(data);
                    }
                    data = dataArr.join(",");
                } else {
                    data = oldData+","+data;
                }
            }            
            return data;
        },
        clearInput : function(){
            this.$input.val("");
            this.$input.data("ids","");
        },
        resetPanel : function(){
            this.$panel.find("input:checked").removeAttr("checked");
        },
        showPanel : function(){
            if(!this.$panel[0].style.width){
                this.$panel.parent().css({
                    "position" : "relative"
                });
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
            this.$panel.hide();
            if(!!this.config.callback){
                var oldStatus={},
                    initData = this.config.initData;
                for(var i = 0;i<initData.length;i++){
                    oldStatus[initData[i]]=true;
                }
                this.config.callback(this.$input.data("ids")?this.$input.data("ids").split(","):"",oldStatus);
            }
        },
        togglePanel : function(){
            this.$panel.is(":visible")?this.hidePanel():this.showPanel();
        },
        setCheckbox : function(item){
            if($(item).has("input:checked").length){
                $(item).find("input").removeAttr("checked");
                //$(item).find("input")[0].checked="";
            } else {
                $(item).find("input")[0].checked=true;
            }
        }
    });
    
    return init;
});