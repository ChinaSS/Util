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
        {name:"姓名",field:"Name",click:function(e){}},
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

define(["jquery","css!Util/css/grid.css"],function($){
    var cache={};
    /**
     * 简单模板引擎
     */
    var template = (function(){
        var cache = {};
        return function(str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ? cache[str] = cache[str] || util.template(document.getElementById(str).innerHTML) :
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +
                    // Convert the template into pure JavaScript
                    str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        };
    })();

    function init(config){
        //创建表格对象
        var grid = new Grid($.extend({
            pageSize: 10,
            trEvent: {}
        },config));
        //渲染表格
        grid.render();
        //添加缓存
        cache[config.id] = grid;
        return grid;
    }

    function Grid(config){
        this.config = config;
        this.selected = {};
        //真分页时，后端返回数据类型结构为此结构即可
        this.pageInfo = {
            curPage:1,                      //默认当前为表格的第一页
            curPageData:[],                 //当前页数据
            allDataCount:0,                 //所有数据总条数
            pageCount:0                     //总页数
        };
    }

     //模块通用方法(扩展)
    Grid.fn = Grid.prototype = {
        //对象方法扩展API
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(Grid.fn,object);
            }
        }
    };

    /**
     * 表格刷新
     */
    Grid.prototype.refresh = function(){
        this.selected = {};
        this.pageInfo = {
            curPage:1,                      //默认当前为表格的第一页
            curPageData:[],                 //当前页数据
            allDataCount:0,                 //所有数据总条数
            pageCount:0                     //总页数
        };
        this.render();
    };

    //扩展Grid渲染方法
    Grid.fn.extend({
        render : function(){
            if (!this.$gridPanel) {
                this.$gridPanel = $("#"+this.config.placeAt).addClass("s_grid");
            }
            //得到容器对象
            this.$gridPanel.empty();
            //填充html
            var html = '<div class="s_grid_title"></div>'+
                       '<div class="s_grid_content'+(this.config.hidden?' hide':'')+'">'+
                       '<div class="s_grid_toolbar"></div>'+     //操作栏面板
                       '<div class="s_grid_data"><table class="table table-hover"><thead></thead><tbody></tbody></table></div>'+
                       '<div class="s_grid_pagination"></div></div>';
            this.$gridPanel.append(html);
            //渲染表格Title
            this.renderTitle();
            //渲染Toolbar
            this.renderToolbar();
            //渲染表格Head
            this.renderGridHead();
            //渲染表格内容
            this.renderGridContent();
            //渲染分页栏
            this.renderPagination();
        },
        /** 渲染表格Title **/
        renderTitle : function(){
            var config  = this.config;
            var $title = $("#"+config.placeAt).find('.s_grid_title').empty();
            if((typeof(config.title)=='undefined' && config.hidden!=true)){
                $title.remove();
                return
            }
            $title.append(config.title || '数据列表');
            if(typeof(config.hidden)!="undefined"){
                var $switch = $('<i class="glyphicon"></i>');
                config.hidden ? $switch.addClass("glyphicon-plus-sign") : $switch.addClass("glyphicon-minus-sign");
                //表格内容显示隐藏控制
                $switch.bind('click',function(e){
                    var target = e.target;
                    var $gridContent = $(e.target).parents(".s_grid").find(".s_grid_content");
                    if(target.className=="glyphicon glyphicon-plus-sign"){
                        $(target).removeClass("glyphicon-plus-sign").addClass("glyphicon-minus-sign");
                        $gridContent.slideDown();
                    }else if(target.className=="glyphicon glyphicon-minus-sign"){
                        $(target).removeClass("glyphicon-minus-sign").addClass("glyphicon-plus-sign");
                        $gridContent.slideUp();
                    }
                });
                $title.append($switch);
            }
        },
        /** 创建操作栏 **/
        renderToolbar : function(){
            var $toolbar = $("#"+this.config.placeAt).find('.s_grid_toolbar');
            if(!this.config.toolbar){
                $toolbar.remove();return;
            }

            var $ul = $('<ul></ul>');
            for(var i= 0;i<this.config.toolbar.length;i++){
                var item = this.config.toolbar[i];
                $('<li '+(i==0?'class="first"':"")+'><a><i class="'+item.class+'">&nbsp;</i>'+ item.name +'</a></li>')
                    .bind("click",this,item.callback)
                    .appendTo($ul);
            }
            $toolbar.append($ul);
        },
        /** 创建表头 **/
        renderGridHead : function(){
            var config = this.config,_this=this;
            if(typeof(config.index)=="string"){
               var index =  config.index=="checkbox" ? $(this.createIndex(config)).css({width:"20px"}).bind('click',function(event){
                   //全选、全不选控制
                   var target = event.target;
                   if(target.nodeName.toLowerCase()=="input"){
                       $(target).parents("table").find("tr td:first-child :checkbox").each(function(index,element){
                           element.checked = target.checked;
                           //除去title行,修改Selected
                           index>0 && _this.modifySelected(_this,index,element.checked);
                       });
                   }
               }) : "<td width='20px'></td>";
            }
            var $head = $('<tr></tr>').append(index);
            for(var i= 0,item;item=config.layout[i++];){
                //列排序相关
                var sort = typeof(item.sort)!="undefined"?'&nbsp;&nbsp;<i class="fa fa-sort"></i>':"";
                var $td = $('<td '+ (typeof(item.style)!="undefined"?'style="'+item.style+'"':'') +'>'+ item.name+''+sort +'</td>');
                //需要支持排序时为列增加排序事件
                if(sort){
                    $td.bind('click',function(e){
                        var sort,index;
                        sort = e.target.nodeName.toLowerCase()=="td" ? e.target.lastChild : e.target;
                        var curTd = e.target.nodeName.toLowerCase()=="td" ? e.target : e.target.parentNode;
                        //判断当前是第几列
                        $(curTd).parents("tr").children().each(function(i){
                            if($(this).is(curTd)){
                                index = i-1;
                            }
                        });
                        if(sort.className=="fa fa-sort-asc"){
                            $(sort).removeClass().addClass('fa fa-sort-desc');
                            config.layout[index].sort = "desc";
                        }else{
                            $(sort).removeClass().addClass('fa fa-sort-asc');
                            config.layout[index].sort = "asc";
                        }
                        _this.pageInfo.curPage = 1;
                        //清空Selected
                        _this.selected = {};
                        //重新渲染表格数据
                        _this.renderGridContent();
                        _this.renderPagination();
                    });
                }
                $head.append($td);
            }
            $('#'+this.config.placeAt).find('thead').append($head);
        },
        /** 创建表格数据行 **/
        renderGridContent : function(){
            //初始化渲染数据
            this.initRenderInfo();
            var _this = this;
            var config = this.config,
                data=this.pageInfo.curPageData;

            var $dataContent = $('#'+this.config.placeAt).find('tbody').empty();

            var index = this.createIndex(config);
            for(var i= 0,row;row = data[i++];){
                //判断当前行是否为选中状态
                var $index = $(index);
                if(this.selected[this.pageInfo.curPage+"_"+i]){
                    $index.find(":checkbox")[0].checked = true;
                }
                var $tr = $('<tr></tr>').append($index);
                for(var j=0,item;item=config.layout[j++];){
                    var tdValue = row[item.field]=="undefined"?"":row[item.field];
                    var param = {"row":row,"value":tdValue,"config":config,"data":data,"rowIndex":i,"cellIndex":j};
                    //单元格支持format
                    if(typeof(item.format)=="function"){
                        tdValue = item.format.apply(this,[param])
                    }
                    //事件支持
                    if(typeof(item.click)=="function"){
                        tdValue = $('<a>'+tdValue+'</a>').bind('click',param,item.click);
                    }
                    $('<td '+ (typeof(item.style)!="undefined"?'style="'+item.style+'"':'') +'></td>').append(tdValue).appendTo($tr);
                }
                //每行添加点击选中控制
                $tr.bind('click',function(e){
                    var index = $(this).find('td:first input')[0];
                    index.checked = $(index).is(e.target) ? index.checked : (!index.checked);
                    //判断当前是第几行
                    var $tr = e.target.nodeName.toLowerCase()=="tr" ? $(e.target) : $(e.target).parents("tr"),trIndex;
                    for(var i= 0,item;item=$dataContent.children()[i++];){
                        $tr.is(item) && (trIndex = i);
                    }
                    //从selected中添加或删除
                    _this.modifySelected(_this,trIndex,index.checked);
                });
                $tr[0].index=i-1;
                $dataContent.append($tr);
            }
            var eventArr = this.config.trEvent;
            if(!!eventArr){
                for(var type in eventArr){
                    if(eventArr.hasOwnProperty(type)){
                        $dataContent.on(type,"tr",function (e) {
                            var eventType = type;
                            eventArr[eventType](data[this.index]);
                        });
                    }
                }
            }
            //最后一页时，添加空行填充满表格
            if(data.length<_this.config.pageSize){
                var emptyTrIndex = _this.config.index ? '<td></td>' : '';
                for(var m=0;m<_this.config.pageSize-data.length;m++){
                    var $emptyTr = $("<tr "+(m>0? "class='emptyRow'" :"height='38px'")+"></tr>").append(emptyTrIndex);
                    for(var n=0,col;col=config.layout[n++];){
                        $emptyTr.append('<td>&nbsp;</td>');
                    }
                    $dataContent.append($emptyTr);
                }
            }
        },
        /** 创建分页栏 **/
        renderPagination : function(){
            var arr = [],_this=this;
            var $pagination = $("#"+this.config.placeAt).find('.s_grid_pagination');
            //数据少于一页时不创建分页栏
            if(this.pageInfo.pageCount<=1){
                $pagination.remove();
                return
            }

            arr.push('<a title="第一页" class="GoToFirst"><i class="glyphicon glyphicon-step-backward"></i></a>');
            arr.push('<a title="上一页" class="GoToPrev"><i class="glyphicon glyphicon-chevron-left" style="font-size:13px"></i></a>');
            arr.push('<span style="float:left;padding-left:7px;padding-right:7px">第&nbsp;<input type="text" value="<%= curPage %>"/>&nbsp;页</span>');
            arr.push('<a title="下一页" class="GoToNext"><i class="glyphicon glyphicon-chevron-right" style="font-size:13px"></i></a>');
            arr.push('<a title="最后一页" class="GoToEnd"><i class="glyphicon glyphicon-step-forward"></i></a>');
            arr.push('<span style="float:right"><%= rowStart %>-<%= rowEnd %>&nbsp;&nbsp;&nbsp;&nbsp;共<%= count %>条</span>');

            //总页数
            var pageCount = _this.pageInfo.pageCount;

            //分页HTML模板生成
            var curPage = this.pageInfo.curPage;
            var allDataCount = this.pageInfo.allDataCount;
            var html = template(arr.join(""),{
                curPage:curPage,
                rowStart:curPage==1 ? 1 : ((curPage-1)*this.config.pageSize+1),
                rowEnd:(curPage*this.config.pageSize)>=allDataCount ? allDataCount : curPage*this.config.pageSize,
                count:allDataCount
            });

            $pagination.unbind().empty().append(html);

            //监听翻页操作事件
            $pagination.bind("click",function(event){
                var target = event.target;
                var nodeName = target.nodeName.toLowerCase();
                var curPage = parseInt($(this).find("input").val());
                if((nodeName=="i" && target.className=="glyphicon glyphicon-step-backward") || (nodeName=="a" && target.className=="GoToFirst")){
                    curPage = 1;
                }else if((nodeName=="i" && target.className=="glyphicon glyphicon-chevron-left") || (nodeName=="a" && target.className=="GoToPrev")){
                    curPage = curPage>1 ? curPage-1 : 1;
                }else if((nodeName=="i" && target.className=="glyphicon glyphicon-chevron-right") || (nodeName=="a" && target.className=="GoToNext")){
                    curPage = curPage==pageCount ? curPage : (curPage+1);
                }else if((nodeName=="i" && target.className=="glyphicon glyphicon-step-forward") || (nodeName=="a" && target.className=="GoToEnd")){
                    curPage = pageCount;
                }else{
                    return;
                }
                //页数大于等于最大页数时，设置为最大页数
                _this.pageInfo.curPage = (curPage>=pageCount ? pageCount : curPage);
                //重新渲染表格
                _this.renderGridContent();
                _this.renderPagination();

            });
            //手动输入页数监听
            $pagination.find("input").blur(function(){
                //如果大于最后一页则为最后一页，如果小于1则为第一页
                var curPage = parseInt(this.value);
                if(curPage>=pageCount){
                    curPage = pageCount;
                }else if(curPage<=1){
                    curPage = 1;
                }
                _this.pageInfo.curPage = curPage;
                //重新渲染表格
                _this.renderGridContent();
                _this.renderPagination();
            });
        }
    });

    Grid.fn.extend({
        getSelectedRow : function(){
            var selected = [];
            for(var key in this.selected){
                selected.push(this.selected[key]);
            }
            return selected;
        },

        /**
         * 对Selected做操作
         * @param grid          表格对象
         * @param rowIndex      行号
         * @param flag          增加/删除
         */
        modifySelected : function(grid,rowIndex,flag){
            if(flag){
                grid.selected[grid.pageInfo.curPage+'_'+rowIndex] =  grid.pageInfo.curPageData[rowIndex-1];
            }else{
                delete grid.selected[grid.pageInfo.curPage+'_'+rowIndex];
            }
        },

        initRenderInfo : function(){
            var config = this.config;
            if(Object.prototype.toString.call(config.data) === '[object Array]'){
                //计算总页数,如果不能整除，则需要取整加1
                var page = parseInt((config.data.length/config.pageSize));
                var pageCount = config.data.length%config.pageSize==0 ? page : (page+1);
                //分割数据，取得当前页需要展示的数据
                var curPage = this.pageInfo.curPage;
                var rowStart = curPage==1 ? 1 : ((curPage-1)*config.pageSize+1);
                var rowEnd = (curPage*config.pageSize)>=config.data.length ? config.data.length : curPage*config.pageSize;
                var curPageData = [];
                for(var i=rowStart;i<=rowEnd;i++){
                    curPageData.push(config.data[i-1]);
                }
                this.pageInfo = {
                    curPage:curPage,                                //当前页
                    curPageData:curPageData,                        //当前页数据
                    allDataCount:config.data.length,                //数据总条数
                    pageCount:pageCount                             //总共多少页
                };
            }else{
                switch (config.data.type){
                    case "URL":
                        $.extend(this.pageInfo,this.getRealData(this));
                        break;
                    case "SQL":
                        $.extend(this.pageInfo,this.getRealData(this));
                        break;
                    default :
                        return [];
                }
            }
        },

        /**
         * 获取表格要展示的数据
         * @returns  Real Data
         */
        getRealData : function(grid){
            var result={},sort={};
            //取得排序信息
            for(var i= 0,item;item=grid.config.layout[i++];){
                if(typeof(item.sort)!="undefined"){
                    sort[item.field] = item.sort=="desc" ? "desc" :"asc";
                }
            }
            $.ajax({
                type: 'POST',
                async: false,
                url: (grid.config.data.type=="URL" ? grid.config.data.value : "/util/v1/gird"),
                dataType: "json",
                data: $.extend({
                    "pageSize": grid.config.pageSize,
                    "pageNumber": grid.pageInfo.curPage
                },this.config.formData),
                success: function(returnData){
                    result = returnData;
                },
                error:function(jqXHR,status,errorThrown){
                    console.log(errorThrown);
                }
            });
            result.pageCount = Math.ceil(result.allDataCount/grid.config.pageSize);
            if(typeof this.config.dataFormat!="undefined"){
                result = formatData(result,this.config.dataFormat);
            }
            return result;
        },

        /**
         * 创建首列
         * @param config
         * @returns 首列HTML
         */
        createIndex : function(config){
            var index = "";
            switch(config.index){
                case "checkbox":
                    index = '<td><input type="checkbox"/></td>';
                    break;
                case  "radio":
                    index = '<td><input type="radio" name="s_gird_'+ config.id +'_radio"/></td>';
                    break;
            }
            return index;
        },

        getData : function(){
            return this.data;
        },

        getRow : function(){

        },

        addRow : function(){

        },

        removeRow : function(){

        }
    });


    /**
     * 获取表格对象
     * @param id
     * @returns grid
     */
    var getGrid = function(id){
        return cache[id];
    };

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

    return {
        "init":init,
        "getGrid":getGrid
    }
});