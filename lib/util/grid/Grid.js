/**
 * 表格配置
 * @param config
 Demo:
 {
    id:"DemoOne",
    pageSize:5,                                                 //一页多少条数据
    index:true,                                                 //是否需要首列选择，默认true
    indexType:"checkbox",                                       //首列为单选还是多选,默认checkbox
    layout:[
        {name:"姓名",field:"Name"},
        {name:"性别",field:"Sex"},
        {name:"电话",field:"Phone",style:"width:10%"},
        {name:"邮件",field:"Email"},
        {name:"地址",field:"Address",hidden:true,format:function(obj){console.log(obj);return "BJ"}}
    ],
    data:[{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"},{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"}]
    //data:{type:"URL",value:""}
    //data:{type:"view",value:"vwDraft",server:"",dbPath:"Test/newTest.nsf",key:{value:"",exactMatch:false}}
    //data:{type:"formula",value:'SELECT Form="mainform" & TFCurNodeID="FlowStartNode"',server:"",dbPath:"Test/newTest.nsf"}
 }
 */
define(["jquery"],function($){
    var gird = {}, cache = {};

    /**
     * 表格初始化
     * @param config
     */
    grid.init = function(config){
        //操作栏

        //表格数据

        //分页

        //增加到指定容器上

    };


    var createToolbar = function(config){

    };

    var createContent = function(config){

    };

    var createPagination = function(config){

    };

    /**
     * 获取表格对象
     * @param id
     * @returns grid
     */
    grid.getGrid = function(id){
        return cache["id"];
    };

    return grid;
});