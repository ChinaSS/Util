/**
 * Created by YiYing on 2014/9/14.
 */
define(["grid"],function(grid){
    return {
        /**
         * 表格样例
         */
        grid:function(){
            var config = {
                id:"DemoOne",
                placeAt:"DemoGirdDivId",                                        //存放Grid的容器ID
                pageSize:20,                                                    //一页多少条数据
                index:"radio",                                                  //首列为单选还是多选,默认checkbox
                layout:[
                    {name:"姓名",field:"Name"},
                    {name:"性别",field:"Sex"},
                    {name:"电话",field:"Phone",style:"width:10%"},
                    {name:"邮件",field:"Email"},
                    {name:"地址",field:"Address",hidden:true,format:function(obj){console.log(obj);return "BJ"}}
                ],
                data:[{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"},{Name:"张三",Sex:"男",Phone:"123456",Email:"",Address:"BJ"}]
                //data:{type:"URL",value:""}
            };
            grid.init(config);
        }
    }
});