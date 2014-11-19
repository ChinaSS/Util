/**
 config = {
    id : id,        //element ID
    type : selected,  //select,checkbox
    searchAble : true,    //当数据为多层级,需树状显示时, 并提供关键字检索功能
    data : url,     //url,[]
    callback: function(){},
    key : {
        name : "name",
        data : "data",
        checked : "checked"
    }
 }
**/
define(["jquery","./treeSearch"],function($,search){
    function init(config){
        return new Input(config);
    }

    function Input(config){
        this.$input = $("#"+config.id);
        if (this.$input.length!=1) {
            return;
        }
        this.config = $.extend(true,{
            type : "checkbox",
            searchAble : false,
            panelID : "inputPanel",
            key : {
                id : "id",
                name : "name",
                data : "data",
                checked : "checked"
            }
        },config);
        this.initPanel();
        bindEvent(this);
        this.getData();
    }
    
    function bindEvent(input){
        //输入框点击事件
        input.$input.on("mouseup",function(event){
            input.togglePanel();
            $(document).bind("mouseup",function(event){
                if ($(event.target).is("#"+input.config.id)||$(event.target).is("#"+input.config.panelID)||$(event.target).parents("#"+input.config.panelID).length>0) {return false};
                input.hidePanel();
                $(document).unbind("mouseup");
            })
        }).on("focus",function(){
            $(this).blur();
        });
        //面板点击事件
        if (input.config.tree) {

        } else if (input.config.type=="checkbox") {
            input.$panel.on("mouseup",".item",function(event){
                if (event.target.nodeName!="INPUT") {
                    input.setCheckbox(this);
                    input.fillInput($(this).children(".text").text(),$(this).children(".text").data("id"));
                }
            }).on("change","input[type='checkbox']",function(event){
                if (event.target.nodeName=="INPUT") {
                    input.fillInput($(this).siblings(".text").text(),$(this).siblings(".text").data("id"));
                }
            });
        } else if (input.config.type=="select") {
            input.$panel.on("mouseup",".item",function(event){
                input.clearInput();
                input.fillInput($(this).children(".text").text(),$(this).children(".text").data("id"));
                input.hidePanel();
            });
        }
        
    }
    Input.fn = Input.prototype = {
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Input.fn,object);
            }
        }
    };

    Input.fn.extend({
        initPanel : function(){
            var offset = this.$input.offset();
            this.$panel = $("<div id='inputPanel'></div>");
            this.$panel.css({
                "position" : "absolute",
                "display" : "none",
                "z-index" : "999",
                "top" : offset.top+this.$input.outerHeight(),
                "left" : offset.left,
                "width" : this.$input.innerWidth(),
                "max-height" : this.$input.innerWidth()*1.5
            });
            $(document.body).append(this.$panel);
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
            this.$panel.append("<div id='panelData'>"+html+"</div>");
            search.treeInit(this.$panel.children("#panelData"));
            if (this.config.searchAble) {
                var $panelSearch = $("<input id='panelSearch'>");
                $panelSearch.css({
                    "width" : this.$input.innerWidth()-6,
                    "border" : "1px solid #ccc"
                });
                this.$panel.prepend($panelSearch);
                search.listen(this.$panel.children("#panelSearch"));
            };
        },
        initItem : function(items,lvl){
            var i,length,cur,li="",html="";
            var id = this.config.key.id,
                name = this.config.key.name,
                data = this.config.key.data,
                checked = this.config.key.checked;
            lvl = (lvl&&lvl>0)?parseInt(lvl):0;
            for(i=0,length=items.length;i<length;i++){
                cur = items[i];
                if(!cur){continue;}
                if (this.config.type=="select"||cur[data]) {
                    li =  "<a class='"+(cur[data]?"node":"item")+(lvl==0&&cur[data]?" open":"")+"' style='padding-left:"+20*lvl+"px'>"+
                            "<span class='pic'></span>"+
                            "<span class='text' data-id="+cur[id]+">"+cur[name]+"</span>"+
                            "</a>";
                } else if (this.config.type=="checkbox") {
                    li =  "<a class='item' style='padding-left:"+20*lvl+"px'>"+
                            "<input type='checkbox'"+(cur[checked]?" checked":"")+">"+
                            "<span class='text' data-id="+cur[id]+">"+cur[name]+"</span>"+
                            "</a>";
                    if (cur[checked]) {
                        this.fillInput(cur[name],cur[id]);
                    }
                }
                if (cur[data]) {
                    li += this.initItem(cur[data],lvl+1);
                };                
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
                        };
                    };
                    if (data) {
                        dataArr.push(data);
                    };
                    data = dataArr.join(",");
                } else {
                    data = oldData+","+data;
                }
            }            
            return data;
        },
        clearInput : function(){
            this.$input.val("");
        },
        showPanel : function(){
            this.$panel.show();
        },
        hidePanel : function(){
            this.$panel.hide();
        },
        togglePanel : function(){
            this.$panel.toggle();
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