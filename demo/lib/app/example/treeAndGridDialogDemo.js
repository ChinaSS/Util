define(["BaseDialog","Grid","TreeAndGridDialog","ZTree","css!modules/zTree/css/zTreeStyle/zTreeStyle.css"],function(baseDialog,grid,treeAndGridDialog){
    var gridConfig = {
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
    };
    
    var tree = {
        isCache : true,             //是否缓存ztree数据,默认为true;不缓存则显示即时数据
        data: [
            {id:1,pId:0,name:"父节点1",t:"我有子节点",open:true},
            {id:11,pId:1,name:"子节点11",t:"我的父节点是1"},
            {id:12,pId:1,name:"子节点12",t:"我的父节点是1"},
            {id:13,pId:1,name:"子节点13",t:"我的父节点是1"},
            {id:2,pId:0,name:"父节点2",t:"我有子节点"},
            {id:21,pId:2,name:"子节点21",t:"我的父节点是2"},
            {id:22,pId:2,name:"子节点22",t:"我的父节点是2"},
            {id:23,pId:2,name:"子节点23",t:"我的父节点是2"},
            {id:3,pId:0,name:"父节点2",t:"我没有子节点",isParent:true},
        ]
    };
    
    function init(){
        treeAndGridDialog.init({
            title : "TreeAndGridDialog",
            grid : gridConfig,
            tree : tree,
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
    return {
        init : init
    }
});