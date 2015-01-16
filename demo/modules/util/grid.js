/**
 * 注意：该模块依赖JQuery与bootstrap
 * 表格配置
 * @param config
 Demo:
 {
    id:"DemoOne",
    placeAt:"DemoGirdDivId",            //存放Grid的容器ID
    pageSize:5,                         //一页多少条数据
    title:'<i class="fa fa-table" style="color:#2898e0"></i>&nbsp;人员信息列表',
    hidden:false,                       //表格是否可隐藏，只显示标题
    index:"checkbox",                   //首列为单选[radio]还是多选[checkbox],默认checkbox
    cache:false,
    layout:[
        {name:"姓名",field:"Name",click:function(e){
            data = e.data;
        }},
        {name:"性别",field:"Sex"},
        {name:"电话",field:"Phone",style:"width:10%"},
        {name:"邮件",field:"Email"},
        {name:"地址",field:"Address",hidden:true,format:function(obj){console.log(obj);return "BJ"}}
    ],
    toolbar:[
        {name:"添加",class:"fa fa-plus-circle",callback:function(event){console.log('添加')}},
        {name:"删除",class:"fa fa-trash-o",callback:function(event){console.log('删除')}},
        {name:"查询",class:"fa fa-search",callback:function(event){console.log(event.data)}},
        {name:"导出",class:"fa fa-download",callback:function(event){console.log('导出')}}
    ],
    data:[{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"},{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"}]
    //data:{type:"URL",value:""}                                //只要data值的类型数组都视为假分页，为对象视为真分页
    formData:{                                  //数据请求的额外参数
        name : 'value'
    },
    dataFormat:{                                //前后台字段名转换
        'data':'format'
    },
    trEvent:{
        'mouseup':function(){}
    }
 }
 */

define(["jquery","css!UtilDir/css/grid.css"],function($){
    var cache={};

    function initGrid(config){
        //创建表格对象
        var grid = new Grid($.extend({
            pageSize: 10,
            trEvent: {},
            sort:{
                field: null,
                order: "desc"
            }
        },config));
        //添加缓存
        cache[config.id] = grid;
        return grid;
    }

    initGrid.getGrid = function(id){
        return cache[id];
    };

    initGrid.dropCache = function(){
        cache={};
    };

    function Grid(config){
        this._config = config;
        //真分页时，后端返回数据类型结构为此结构即可
        this._pageInfo = {
            pageNumber:1,                      //默认当前为表格的第一页
            pageData:[],                 //当前页数据
            dataCount:0,                 //所有数据总条数
            pageCount:0                     //总页数
        };
        this.render(true);
    }
    
     //模块通用方法(扩展)
    Grid.fn = Grid.prototype = {
        //对象方法扩展API
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Grid.fn,object);
            }
        },

        setConfig : function(newConfig){
            $.extend(this._config,newConfig);
        },

        getGridPanel : function(){
            return this._$gridPanel?this._$gridPanel:$("#"+this._config.placeAt);
        },

        //初始化渲染表格
        render : function(type){
            if (!!type) {
                //grid HTML Structure
                var html = '<div class="s_grid_title"></div>'+
                           '<div class="s_grid_content'+(this.config.hidden?' hide':'')+'">'+
                               '<div class="s_grid_toolbar"></div>'+     //操作栏面板
                               '<div class="s_grid_table"></div>'+
                               '<div class="s_grid_pagination"></div>'+
                            '</div>';
                //获取 grid 对象, 
                this._$gridPanel = this.getGridPanel();
                this._$gridPanel.addClass("s_grid").empty().append(html);
            };

            //初始化 grid 各个部分
            this.renderTitle(type);
            this.renderToolbar(type);
            this.renderTable(type);
            this.renderPagination(type);

        },

        renderTitle : function(type){
            var $title = this._$gridPanel.children(".s_grid_title");
            if(!!type){
                $title.empty();
                var html = '<span class="title"></span>';
                if(typeof(config.hidden)!="undefined"){
                    html += '<i class="glyphicon'+config.hidden?' glyphicon-plus-sign':' glyphicon-minus-sign'+'"></i>';
                    //表格内容显示隐藏控制
                    $title.on('click','.glyphicon',function(e){
                        $title.siblings(".s_grid_content").slideToggle();
                        $(this).toggleClass("glyphicon-plus-sign glyphicon-minus-sign");
                    });
                }
                $title.append(html);
            }
            $title.children(".title").text(config.title || '数据列表');
        },

        renderToolbar : function(type){
            var $toolbar = this._$gridPanel.find(".s_grid_toolbar");
            if(!!type){
                $toolbar.empty();
                if(!!this.config.toolbar&&this.config.toolbar.length>0){
                    var $ul = $('<ul></ul>');
                    for(var i = 0, length=this.config.toolbar.length;i<length;i++){
                        var item = this.config.toolbar[i];
                        $('<li '+(i==0?'class="first"':"")+'><a><i class="'+item.class+'"></i>'+ item.name +'</a></li>')
                            .bind("click",this,item.callback)
                            .appendTo($ul);
                    }
                    $toolbar.append($ul);
                }
            }
        },

        renderTable : function(type){
            var $table = this._$gridPanel.find(".s_grid_table");
            if(!!type){
                $table.empty();
                $table.append('<table><thead></thead><tbody></tbody></table>');
                this.renderTableHead(type);
                this.renderTableBody(type);
            }
        },

        renderTableHead : function(type){
            var $tableHead = this._$gridPanel.find(".s_grid_table thead");
            var _this = this;
            if(!!type){
                $tableHead.empty();
                //render head
                var html = '<td>'+_this._config.index=="checkbox"?'<input type="checkbox">':''+'</td>';
                var layout = _this._config.layout;
                for(var i=0,item;item=layout[i++];){
                    html += '<td align="'+item.align?item.align:'left'+'"'+item.width?(' width="'+item.width+'"'):''+' class="'+item.field+'">'+item.name+item.sort?'<i class="fa fa-sort"></i>':''+'</td>';
                }
                $tableHead.append('<tr>'+html+'</tr>');
                //bindEvent
                $tableHead.on("click","td",function(event){
                    var nodeName = event.target.nodeName,
                        field = null,
                        order = "desc";
                    if (nodeName=="INPUT") {
                        var checked = $(this).is(":checked");
                        $tableHead.siblings("tbody").find("input").each(function(){
                            if (checked) {
                                $(this).prop("checked","checked");
                            } else {
                                $(this).removeProp("checked");
                            }
                        });
                    } else {
                        field = this.className?this.className:null;
                        if(!!field){
                            $(this).parent().children(".curSort").removeClass("curSort");
                            $(this).addClass("curSort").children(".fa-sort").toggleClass("desc");
                            order = $(this).children(".fa-sort").is(".desc")?"desc":"asc";
                            _this.sortTableData(field,order,false);
                        }
                    }
                });
            }
        },

        renderTableBody : function(type){
            if(!!type){
                this.renderData(type);
            }
        },

        renderPagination : function(type){
            //数据少于一页时不创建分页栏
            if(this._pageInfo.pageCount<=1){ return false; }
            var $pagination = this._$gridPanel.find(".s_grid_pagination");
            var _this = this;
            if(!!type){
                $pagination.empty();
                //render pagination
                var html = '<a title="第一页" class="GoToFirst"><i class="glyphicon glyphicon-step-backward"></i></a>'+
                            '<a title="上一页" class="GoToPrev"><i class="glyphicon glyphicon-chevron-left"></i></a>'+
                            '<span class="curPage">第<input type="text" value="'+_this._pageInfo.pageNumber+'"/>页</span>'+
                            '<a title="下一页" class="GoToNext"><i class="glyphicon glyphicon-chevron-right"></i></a>'+
                            '<a title="最后一页" class="GoToEnd"><i class="glyphicon glyphicon-step-forward"></i></a>';
                for (var i = 1; i < _this._pageInfo.pageCount+1; i++) {
                    html += '<a class="'+(_this._pageInfo.pageNumber==i)?'curPage':''+'">'+i+'</a>';
                }
                html += '<span class="pageCount">共'+_this._pageInfo.pageCount+'条</span>';
                html += '<a title="刷新" class="refresh"><i class="glyphicon glyphicon-refresh"></i></a>';
                $pagination.append(html);
                $pagination.on("click","a",function(){
                    var className = this.className;
                    if(className.indexOf("GoTo")>-1){
                        var type = className.substring(4);
                        pageNumber = _this._pageInfo.pageNumber;
                        pageCount = _this._pageInfo.pageCount;
                        switch(type){
                            case 'First' : 
                                _this._pageInfo.pageNumber=1;
                                break;
                            case 'End' : 
                                _this._pageInfo.pageNumber=pageCount;
                                break;
                            case 'Prev' : 
                                _this._pageInfo.pageNumber=(pageNumber==1)?pageNumber:pageNumber-1;
                                break;
                            case 'Next' : 
                                _this._pageInfo.pageNumber=(pageNumber==pageCount)?pageNumber:pageNumber+1;
                                break;
                        }
                        
                    }else if (className!="refresh"&&className!="curPage") {
                        _this._pageInfo.pageNumber = $(this).text();
                    }else if (className=="refresh"){
                        
                    }else{
                        return false;
                    }
                    _this.renderData(true);
                    _this.renderPagination(false);
                }).on("blur","input",function(){
                    _this._pageInfo.pageNumber = $(this).val();
                    _this.renderData(true);
                    _this.renderPagination(false);
                });
            } else {
                $pagination.find(".curPage").each(function(){
                    if(this.nodeName == 'A'){
                        $(this).siblings(".curPage").removeClass("curPage").end().addClass("curPage");
                    }else if (this.nodeName == 'SPAN') {
                        $(this).children("input").val(_this._pageInfo.pageNumber);
                    }
                });
            }
        },

        renderData : function(type){
            var $tableBody = this._$gridPanel.find(".s_grid_table tbody");
            $tableBody.empty();
            var _this = this;
            if(!!type){
                _this.getData(_this.renderData);
            }else{
                var rows = _this._pageInfo.pageData,
                    $tr,trValue,tdValue;
                //render data
                for (var i = 0,row; row = rows[i++];) {
                    $tr = $("<tr></tr>");
                    $tr.data("index",i);
                    trValue = '<td><input type="'+_this._config.index=="checkbox"?'checkbox':'radio'+'"></td>';

                    for (var j=0,item;item=_this._config.layout[j++];) {
                        tdValue = row[item.field]?row[item.field]:"";
                        tdValue = item.format?item.format(nodeValue):nodeValue;
                        tdValue = item.click?'<a class="'+item.field+'">'+tdValue+'</a>';
                        trValue += '<td>'+tdValue+'</td>';
                    }

                    $tr.append(trValue);
                    $tableBody.append($tr);
                }
                _this._layoutEventObj={};
                for (var i = 0, layout;layout=_this._config.layout[i++];) {
                    if (!!layout.click) {
                        _this._layoutEventObj[layout.field]=layout.click;
                    };
                }
                $tableBody.on("click","a",function(event){
                    var rowData = _this._pageInfo.pageData[$(this).data("index")];
                    event.data = {
                        "row" : rowData
                    };
                    _this._layoutEventObj[this.className](event);
                })
            }
        },

        getData : function(callback){
            if (this._config.data.type=="URL") {
                this.getAjaxData(callback);
            } else {
                this._pageInfo.pageData = this._config.data;
                callback(false);
            }
        },

        getAjaxData : function(callback){
            var _this = this;
            $.ajax({
                type: 'POST',
                url: _this._config.data.value,
                dataType: "json",
                data: $.extend({
                    "pageSize": _this._config.pageSize,
                    "pageNumber": _this._pageInfo.pageNumber,
                    "field": _this._config.sort.field,
                    "order": _this._config.sort.order
                },this.config.formData),
                success: function(returnData){
                    returnData.pageCount = Math.ceil(returnData.dataCount/_this._config.pageSize);
                    if(typeof _this._config.dataFormat!="undefined"){
                        //returnData = formatData(returnData,_this._config.dataFormat); datatransfer
                    }
                    $.extend(_this._pageInfo,returnData);
                    callback(false);
                    return true;
                },
                error:function(jqXHR,status,errorThrown){
                    console.log(errorThrown);
                    return false;
                }
            });
        },

        sortTableData : function(field,order,type){
            if (arguments.length<2) {return false;}
            if (!!type) {
                $.extend(this._config.sort,{
                    field : field,
                    order : order
                });
                this.renderData(true);
            } else {
                this._pageInfo.pageData = sortData(this._pageInfo.pageData,field,order);
                this.renderData(false);
            }
        }
    };

    Grid.fn.extend({
        getSelectedRow : function(){
            var selectedArr = [];
            var _this = this;
            $tableBody = _this._$gridPanel.find(".s_grid_table tbody");
            $tableBody.find("input:checked").each(function(){
                var index = $(this).closest("tr").data("index");
                if (!index) { return true;}
                selectedArr.push(_this._pageInfo.pageData[index]);
            });
            return selected;
        }
    });

    /* 
     * 排序函数
     * sortData
     */
    function sortData(data,field,order){
        var result = null;
        if (!data||data.length==0) {return data;}
        // sort data
        result = data; //测试逻辑
        return result;
    }

    /*
     * 转换数据格式
     * pageInfo
     */
    function formatData(data,format){
        var i = null, list = {
            "total" : "allDataCount",
            "data" : "curPageData"
        };
        //遍历替换列表
        for (i in format ){
            if (format.hasOwnProperty(i)) {
                if(format[i].indexOf('.')>-1){
                    var arr = format[i].split('.'), j,transferData;
                    for(j=1,transferData=data[arr[0]];j<arr.length;j++){
                        transferData = transferData[arr[j]];
                    }
                    data[list[i]] = transferData;
                }else{
                    data[list[i]] = data[format[i]];
                }
                delete data[format[i]];
            }
        }
        return data;
    }

    return initGrid;
});