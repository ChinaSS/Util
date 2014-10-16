define(["BaseDialog","Grid","GridDialog"],function(baseDialog,grid,gridDialog){
    
    var config = {
        id:"DemoOne",
        placeAt:"DemoGirdDivId",                    //存放Grid的容器ID
        pageSize:5,                                 //一页多少条数据
        hidden:false,                               //表格是否可隐藏，只显示标题，默认false
        index:"checkbox",                           //首列为单选[radio]还是多选[checkbox],默认checkbox
        layout:[
            {name:"姓名",field:"Name",sort:true,click:function(e){
                console.log(e.data);
            }},
            {name:"性别",field:"Sex",sort:"asc"},
            {name:"电话",field:"Phone",style:"width:10%;"},
            {name:"邮件",field:"Email"},
            {name:"地址",field:"Address",format:function(obj){
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

    return {
        init : function(){
            gridDialog.init({
                title : "GridDialog",
                gridConfig : config,
                depend:{
                    baseDialog:baseDialog,
                    grid:grid
                },
                callback : function(data){
                    for(var i=data.length;i--;){
                        console.log(data[i]);
                    }
                }
            });
        }
    }
});