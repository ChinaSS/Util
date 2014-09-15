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
                pageSize:5,                                                     //一页多少条数据
                index:"checkbox",                                               //首列为单选还是多选,默认checkbox
                layout:[
                    {name:"姓名",field:"Name"},
                    {name:"性别",field:"Sex"},
                    {name:"电话",field:"Phone",style:"width:10%"},
                    {name:"邮件",field:"Email"},
                    {name:"地址",field:"Address",hidden:true,format:function(obj){
                        //console.log(obj);
                        return "BJ"
                    }}
                ],
                data:[
                    {Name:"张三1",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三2",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三3",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三4",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三5",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三6",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三7",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三8",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三9",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三10",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三11",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三12",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三13",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三14",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"},
                    {Name:"张三15",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"CQ"},
                    {Name:"张三16",Sex:"男",Phone:"123456",Email:"zhangsan@gmail.com",Address:"BJ"}
                ]
                //data:{type:"URL",value:""}
            };
            grid.init(config);
        }
    }
});