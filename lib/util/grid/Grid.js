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
    data:[{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"},{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"}]
    //data:{type:"URL",value:""}
 }
 */
define(["jquery","Util","css!util/grid/Grid.css","css!/Util/css/Font-Awesome/css/font-awesome.min.css"],function($,Util){
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
     * 创建操作栏
     * @param config
     * @returns toobar
     */
    var createToolbar = function(config){

        return "";
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
     * @param config    表格配置对象
     * @param data      表格实际数据
     * @returns {*}
     */
    var createDataRows = function(config,data){
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
     * 获取真实数据适配器
     * @param config
     * @returns  Real Data
     */
    var getRealDataAdapter = function(config){
        if(Object.prototype.toString.call(config.data) === '[object Array]'){
            return config.data;
        }else{
            switch (config.data.type){
                case "URL":
                    return getRealData(config);
                    break;
                case "SQL":
                    return getRealData(config);
                    break;
                default :
                    return [];
            }
        }
    };

    /**
     * 从后端获取表格数据
     * @param config
     * @returns {{}}
     */
    var getRealData = function(config){
        var result={};
        $.ajax({
            type: 'POST',
            async: false,
            url: (data.type=="URL" ? data.value : "/util/v1/gird"),
            dataType: "json",
            data:{"data":JSON.stringify(config.layout)},
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
    var createPagination = function(config){
        var arr = [];
        arr.push('<a title="第一页" class="GoToFirst"><i class="fa fa-step-backward"></i></a>');
        arr.push('<a title="上一页" class="GoToPrev"><i class="fa fa-caret-left"></i></a>');
        arr.push('<span style="float:left;padding-left:7px;padding-right:7px">第&nbsp;<input type="text" value="<%= curPage %>"/>&nbsp;页</span>');
        arr.push('<a title="下一页" class="GoToNext"><i class="fa fa-caret-right"></i></a>');
        arr.push('<a title="最后一页" class="GoToEnd"><i class="fa fa-step-forward"></i></a>');
        arr.push('<span style="float:right"><%= rowStart %>-<%= rowEnd %>&nbsp;&nbsp;&nbsp;&nbsp;共<%= count %>条</span>');
        var html = '<div class="s_grid_pagination">'+ arr.join("") +'</div>';

        //example:
        var data = {
            curPage:2,
            rowStart:21,
            rowEnd:40,
            count:100
        };
        var $html = $(Util.template(html,data));
        //监听操作事件
        $html.bind("click",function(event){
            //console.log(event);
            var target = event.target;
            var nodeName = target.nodeName;
            var curPage = this.find("input").val();
            if((nodeName=="i" && target.className=="fa fa-step-backward") || (nodeName=="a" && target.className=="GoToFirst")){
                curPage = 1;
            }else if((nodeName=="i" && target.className=="fa fa-caret-left") || (nodeName=="a" && target.className=="GoToPrev")){
                curPage = curPage>1 ? curPage-1 : 1;
            }else if((nodeName=="i" && target.className=="a fa-caret-right") || (nodeName=="a" && target.className=="GoToNext")){
                curPage = 1;
            }else if((nodeName=="i" && target.className=="fa fa-step-forward") || (nodeName=="a" && target.className=="GoToEnd")){
                curPage = 1;
            }
            //重新渲染表格数据

            //重新渲染分页栏


        });
        //手动输入页数监听
        $html.find("input").blur(function(){
            //如果大于最后一页则为最后一页，如果小于1则为第一页

            //重新渲染表格

        });

        return $html;
    };

    /**
     * 表格对象
     * @param config
     * @constructor
     */
    function Grid(config){
        this.config = config;
        this.data = getRealDataAdapter(config);
    }

    /**
     * 渲染表格
     */
    Grid.prototype.render = function(){
        //得到容器对象
        var gridPanel = $("#"+this.config.placeAt).addClass("s_grid");
        //操作栏
        gridPanel.append(createToolbar(this.config));
        //表格表头、表格数据
        gridPanel.append('<div><table class="table table-hover">'+createHeadRow(this.config)+''+createDataRows(this.config,this.data)+'</table></div>');
        //分页
        gridPanel.append(createPagination(this.config));
    };

    /**
     * 得到表格数据
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
     * 获取表格对象
     * @param id
     * @returns grid
     */
    result.getGrid = function(id){
        return cache["id"];
    };

    return result;
});