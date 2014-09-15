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
        {name:"姓名",field:"Name"},
        {name:"性别",field:"Sex"},
        {name:"电话",field:"Phone",style:"width:10%"},
        {name:"邮件",field:"Email"},
        {name:"地址",field:"Address",hidden:true,format:function(obj){console.log(obj);return "BJ"}}
    ],
    toolbar:[
        {name:"添加",callback:function(gird){}},
        {name:"删除",callback:function(gird){}},
        {name:"查询",callback:function(gird){}},
        {name:"导出",callback:function(gird){}}
    ]
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
        //得到容器对象
        var gridPanel = $("#"+this.config.placeAt).addClass("s_grid").empty();
        //操作栏
        gridPanel.append(createToolbar(this));
        //表格表头、表格数据
        this.pageInfo = getRealDataAdapter(this);
        gridPanel.append('<div><table class="table table-hover">'+createHeadRow(this.config)+''+createDataRows(this)+'</table></div>');
        //分页,大于一页才渲染
        this.pageInfo.pageCount>1 && gridPanel.append(this.createPagination(this.config));
    };

    /**
     * 得到表格数据
     * 对于真分页只能得到当前页数据，假分页可以得到所有数据
     * @returns data
     */
    Grid.prototype.getData = function(){
        return this.data;
    };

    Grid.prototype.getRow = function(){

    };

    Grid.prototype.addRow = function(){

    };

    Grid.prototype.removeRow = function(){

    };

    Grid.prototype.clear = function(){

    };


    /**
     * 创建操作栏
     * @param grid
     * @returns toobar
     */
    var createToolbar = function(grid){
        var toolbar = $('<ul></ul>');
        for(var i= 0;i<grid.config.toolbar.length;i++){
            var item = grid.config.toolbar[i];
            $('<li '+(i==0?'class="first"':"")+'><a><i class="'+item.class+'">&nbsp;</i>'+ item.name +'</a></li>')
                .bind("click",grid,item.callback)
                .appendTo(toolbar);
        }

        return $('<div class="s_grid_toolbar"></div>').append(toolbar);
    };

    /**
     * 创建表头
     * @param config
     * @returns Head HTML
     */
    var createHeadRow = function(config){
        var head = $('<tr>'+ (typeof(config.index)=="string"?
            (config.index=="checkbox"?$(createIndex(config)).css({width:"20px"}).get(0).outerHTML:"<td width='20px'></td>")
            : "") +'</tr>');
        for(var i= 0,item;item=config.layout[i++];){
            head.append('<td>'+ item.name +'</td>');
        }
        return head.get(0).outerHTML;
    };

    /**
     * 创建表格数据行
     * @param grid    表格对象
     * @returns {*}
     */
    var createDataRows = function(grid){
        var config = grid.config,data=grid.pageInfo.curPageData;

        var rowArr = [];
        var index = createIndex(config);
        for(var i= 0,row;row=data[i++];){
            var tdHTML = "";
            for(var j=0,item;item=config.layout[j++];){
                var tdValue = row[item.field]=="undefined"?"":row[item.field];
                //单元格支持format
                if(typeof(item.format)=="function"){
                    tdValue = item.format.apply(this,[{"value":tdValue,"config":config,"data":data,"rowIndex":i,"cellIndex":j}])
                }
                tdHTML+='<td>'+tdValue+'</td>';
            }
            rowArr.push("<tr>"+ index + tdHTML+"</tr>");
        }
        return rowArr.join("");
    };

    /**
     * 获取表格要展示的数据
     * @param grid
     * @returns  Real Data
     */
    var getRealDataAdapter = function(grid){
        var config = grid.config;
        if(Object.prototype.toString.call(config.data) === '[object Array]'){
            //计算总页数,如果不能整除，则需要取整加1
            var page = parseInt((config.data.length/config.pageSize));
            var pageCount = config.data.length%config.pageSize==0 ? page : (page+1);
            //分割数据，取得当前页需要展示的数据
            var curPage = grid.pageInfo.curPage;
            var rowStart = curPage==1 ? 1 : ((curPage-1)*config.pageSize+1);
            var rowEnd = (curPage*config.pageSize)>=config.data.length ? config.data.length : curPage*config.pageSize;
            var curPageData = [];
            for(var i=rowStart;i<=rowEnd;i++){
                curPageData.push(config.data[i-1]);
            }
            return {
                curPage:curPage,                                //当前页
                curPageData:curPageData,                        //当前页数据
                allDataCount:config.data.length,                //数据总条数
                pageCount:pageCount                             //总共多少页
            };
        }else{
            switch (config.data.type){
                case "URL":
                    return getRealData(gird);
                    break;
                case "SQL":
                    return getRealData(gird);
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
        var result={};
        $.ajax({
            type: 'POST',
            async: false,
            url: (grid.config.data.type=="URL" ? grid.config.data.value : "/util/v1/gird"),
            dataType: "json",
            data:{"data":JSON.stringify({
                pageSize:grid.config.pageSize,
                curPage:grid.pageInfo.curPage
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
     * @param config
     * @returns Pagination $(HTML)
     */
    Grid.prototype.createPagination = function(config){
        var arr = [],_this=this;
        arr.push('<a title="第一页" class="GoToFirst"><i class="fa fa-step-backward"></i></a>');
        arr.push('<a title="上一页" class="GoToPrev"><i class="fa fa-caret-left"></i></a>');
        arr.push('<span style="float:left;padding-left:7px;padding-right:7px">第&nbsp;<input type="text" value="<%= curPage %>"/>&nbsp;页</span>');
        arr.push('<a title="下一页" class="GoToNext"><i class="fa fa-caret-right"></i></a>');
        arr.push('<a title="最后一页" class="GoToEnd"><i class="fa fa-step-forward"></i></a>');
        arr.push('<span style="float:right"><%= rowStart %>-<%= rowEnd %>&nbsp;&nbsp;&nbsp;&nbsp;共<%= count %>条</span>');
        var html = '<div class="s_grid_pagination">'+ arr.join("") +'</div>';

        //总页数
        var pageCount = _this.pageInfo.pageCount;

        //分页HTML模板生成
        var curPage = this.pageInfo.curPage;
        var allDataCount = this.pageInfo.allDataCount;
        var $html = $(Util.template(html,{
            curPage:curPage,
            rowStart:curPage==1 ? 1 : ((curPage-1)*this.config.pageSize+1),
            rowEnd:(curPage*this.config.pageSize)>=allDataCount ? allDataCount : curPage*this.config.pageSize,
            count:allDataCount
        }));

        //监听翻页操作事件
        $html.bind("click",function(event){
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
            _this.render();

        });
        //手动输入页数监听
        $html.find("input").blur(function(){
            //如果大于最后一页则为最后一页，如果小于1则为第一页
            var curPage = parseInt(this.value);
            if(curPage>=pageCount){
                curPage = pageCount;
            }else if(curPage<=1){
                curPage = 1;
            }
            _this.pageInfo.curPage = curPage;
            //重新渲染表格
            _this.render();
        });

        return $html;
    };

    /**
     * 获取表格对象
     * @param id
     * @returns grid
     */
    result.getGrid = function(id){
        return cache["id"];
    };

    return result;
});