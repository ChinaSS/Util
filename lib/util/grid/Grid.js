/**
 * 表格配置
 * @param config
 Demo:
 {
    id:"DemoOne",
    placeAt:"DemoGirdDivId",                                    //存放Grid的容器ID
    pageSize:5,                                                 //一页多少条数据
    index:"checkbox",                                           //首列为单选还是多选,默认checkbox
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
 }
 */
define(["jquery","Util","css!util/grid/Grid.css","css!modules/Font-Awesome/css/font-awesome.min.css"],function($,Util){
    var result = {}, cache = {};

    /**
     * 表格初始化
     * @param config
     */
    result.init = function(config){
        var grid = new Grid(config);
        grid.render();
        //添加缓存
        cache[config.id] = grid;
    };

    /**
     * 表格对象
     * @param config
     * @constructor
     */
    function Grid(config){
        this.config = config;
        //this.DOM = {};                      //Grid DOM对象
        //真分页时，后端返回数据类型结构为此结构即可
        this.pageInfo = {
            curPage:1,                      //默认当前为表格的第一页
            curPageData:[],                 //当前页数据
            allDataCount:0,                 //所有数据总条数
            pageCount:0                     //总页数
        };
    }

    /**
     * 渲染表格
     */
    Grid.prototype.render = function(){
        var config = this.config;
        //得到容器对象
        var $gridPanel = $("#"+config.placeAt).addClass("s_grid").empty();
        //Title栏
        (config.title||typeof(config.hidden)!="undefined") && $gridPanel.append('<div class="s_grid_title"></div>');

        var $gridContent = $('<div class="s_grid_content"></div>');
        //操作栏
        this.config.toolbar && $gridContent.append('<div class="s_grid_toolbar"></div>');
        //表头、表格数据存放面板
        $gridContent.append('<div><table class="table table-hover"><thead></thead><tbody></tbody></table></div>');

        //初始化渲染数据
        this.initRenderInfo();

        //分页,大于一页才增加存放分页的面板
        this.pageInfo.pageCount>1 && $gridContent.append('<div class="s_grid_pagination"></div>');
        //hidden为true时默认隐藏表格
        (typeof(config.hidden)=="boolean" && config.hidden) && $gridContent.css({"display":"none"});

        $gridPanel.append($gridContent);

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
    };


    /**
     * 获取选中行
     * @returns Array
     */
    Grid.prototype.getSelectedRow = function(){
        //var selected = [];
        //this.DOM.find('tr td:first-child :checkbox');
        //return selected;
    };

    /**
     * 得到表格数据
     * 对于真分页只能得到当前页数据，假分页可以得到所有数据
     * @returns data
     */
    Grid.prototype.getData = function(){
        //var data = this.

        return this.data;
    };

    Grid.prototype.getRow = function(){

    };

    Grid.prototype.addRow = function(){

    };

    Grid.prototype.removeRow = function(){

    };

    /**
     * 清空表格数据
     */
    Grid.prototype.clear = function(){

    };

    /**
     *渲染表格Title
     */
    Grid.prototype.renderTitle = function(){
        var config  = this.config;
        var $title = $("#"+config.placeAt).find('.s_grid_title').empty().append(config.title || '数据列表');
        if(typeof(config.hidden)!="undefined"){
            var $switch = $('<i class="fa"></i>');
            config.hidden ? $switch.addClass("fa-chevron-circle-up") : $switch.addClass("fa-chevron-circle-down");
            //表格内容显示隐藏控制
            $switch.bind('click',function(e){
                var target = e.target;
                var $gridContent = $(e.target).parents(".s_grid").find(".s_grid_content");
                if(target.className=="fa fa-chevron-circle-up"){
                    $(target).removeClass("fa-chevron-circle-up").addClass("fa-chevron-circle-down");
                    $gridContent.slideDown();
                }else if(target.className=="fa fa-chevron-circle-down"){
                    $(target).removeClass("fa-chevron-circle-down").addClass("fa-chevron-circle-up");
                    $gridContent.slideUp();
                }
            });
            $title.append($switch);
        }
    };

    /**
     * 创建操作栏
     */
    Grid.prototype.renderToolbar = function(){
        var grid = this;
        var $toolbar = $("#"+grid.config.placeAt).find('.s_grid_toolbar');
        if(!$toolbar.length){return}

        var $ul = $('<ul></ul>');
        for(var i= 0;i<grid.config.toolbar.length;i++){
            var item = grid.config.toolbar[i];
            $('<li '+(i==0?'class="first"':"")+'><a><i class="'+item.class+'">&nbsp;</i>'+ item.name +'</a></li>')
                .bind("click",grid,item.callback)
                .appendTo($ul);
        }
        $toolbar.append($ul);
    };

    /**
     * 创建表头
     */
    Grid.prototype.renderGridHead = function(){
        var config = this.config,_this=this;
        if(typeof(config.index)=="string"){
           var index =  config.index=="checkbox" ? $(createIndex(config)).css({width:"20px"}).bind('click',function(event){
               //全选、全不选控制
               var target = event.target;
               if(target.nodeName.toLowerCase()=="input"){
                   $(target).parents("table").find("tr td:first-child :checkbox").each(function(index,elemen){
                       elemen.checked = target.checked;
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
                    //重新渲染表格数据
                    _this.initRenderInfo();
                    _this.renderGridContent();
                    _this.renderPagination();
                });
            }
            $head.append($td);
        }
        $('#'+this.config.placeAt).find('thead').append($head);
    };

    /**
     * 创建表格数据行
     */
    Grid.prototype.renderGridContent = function(){
        var grid = this;
        var config = grid.config,data=grid.pageInfo.curPageData;

        var $dataContent = $('#'+this.config.placeAt).find('tbody').empty();
        var index = createIndex(config);
        for(var i= 0,row;row=data[i++];){
            var $tr = $('<tr></tr>').append(index);
            for(var j=0,item;item=config.layout[j++];){
                var tdValue = row[item.field]=="undefined"?"":row[item.field];
                var param = {"value":tdValue,"config":config,"data":data,"rowIndex":i,"cellIndex":j};
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
                if(e.target.nodeName.toLowerCase()!="input"){
                    var index = $(this).find('td:first input')[0];
                    index.checked = !index.checked;
                }
            });
            $dataContent.append($tr);
        }
    };

    /**
     * 获取表格要展示的数据
     * @returns  Real Data
     */
    Grid.prototype.initRenderInfo = function(){
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
                    this.pageInfo = getRealData(this);
                    break;
                case "SQL":
                    this.pageInfo = getRealData(this);
                    break;
                default :
                    return [];
            }
        }
    };

    /**
     * 从后端获取表格数据
     * @param grid
     * @returns {{}}
     */
    var getRealData = function(grid){
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
            data:{"data":JSON.stringify({
                pageSize:grid.config.pageSize,
                curPage:grid.pageInfo.curPage,
                sort:sort
            })},
            success: function(returnData){
                result = returnData;
            },
            error:function(jqXHR,status,errorThrown){
                console.log(errorThrown);
            }
        });
        return result;
    };

    /**
     * 创建首列
     * @param config
     * @returns 首列HTML
     */
    var createIndex = function(config){
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
    };


    /**
     * 创建分页栏
     */
    Grid.prototype.renderPagination = function(){
        var arr = [],_this=this;
        var $pagination = $("#"+this.config.placeAt).find('.s_grid_pagination');
        if(!$pagination.length){return}

        arr.push('<a title="第一页" class="GoToFirst"><i class="fa fa-step-backward"></i></a>');
        arr.push('<a title="上一页" class="GoToPrev"><i class="fa fa-caret-left"></i></a>');
        arr.push('<span style="float:left;padding-left:7px;padding-right:7px">第&nbsp;<input type="text" value="<%= curPage %>"/>&nbsp;页</span>');
        arr.push('<a title="下一页" class="GoToNext"><i class="fa fa-caret-right"></i></a>');
        arr.push('<a title="最后一页" class="GoToEnd"><i class="fa fa-step-forward"></i></a>');
        arr.push('<span style="float:right"><%= rowStart %>-<%= rowEnd %>&nbsp;&nbsp;&nbsp;&nbsp;共<%= count %>条</span>');

        //总页数
        var pageCount = _this.pageInfo.pageCount;

        //分页HTML模板生成
        var curPage = this.pageInfo.curPage;
        var allDataCount = this.pageInfo.allDataCount;
        var html = Util.template(arr.join(""),{
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
            if((nodeName=="i" && target.className=="fa fa-step-backward") || (nodeName=="a" && target.className=="GoToFirst")){
                curPage = 1;
            }else if((nodeName=="i" && target.className=="fa fa-caret-left") || (nodeName=="a" && target.className=="GoToPrev")){
                curPage = curPage>1 ? curPage-1 : 1;
            }else if((nodeName=="i" && target.className=="a fa-caret-right") || (nodeName=="a" && target.className=="GoToNext")){
                curPage = curPage==pageCount ? curPage : (curPage+1);
            }else if((nodeName=="i" && target.className=="fa fa-step-forward") || (nodeName=="a" && target.className=="GoToEnd")){
                curPage = pageCount;
            }else{
                return;
            }
            //页数大于等于最大页数时，设置为最大页数
            _this.pageInfo.curPage = (curPage>=pageCount ? pageCount : curPage);
            //重新渲染表格
            _this.initRenderInfo();
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
            _this.initRenderInfo();
            _this.renderGridContent();
            _this.renderPagination();
        });
    };

    /**
     * 获取表格对象
     * @param id
     * @returns grid
     */
    result.getGrid = function(id){
        return cache[id];
    };

    return result;
});