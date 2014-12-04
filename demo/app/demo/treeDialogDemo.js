define(["UtilDir/treeDialog"],function(treeDialog){
    
    var nodeObj=[
        {id:1,pId:0,name:"父节点1",t:"我有子节点",open:true},
        {id:11,pId:1,name:"子节点11",t:"我的父节点是1"},
        {id:12,pId:1,name:"子节点12",t:"我的父节点是1"},
        {id:13,pId:1,name:"子节点13",t:"我的父节点是1"},
        {id:2,pId:0,name:"父节点2",t:"我有子节点"},
        {id:21,pId:2,name:"子节点21",t:"我的父节点是2"},
        {id:22,pId:2,name:"子节点22",t:"我的父节点是2"},
        {id:23,pId:2,name:"子节点23",t:"我的父节点是2"},
        {id:3,pId:0,name:"父节点2",t:"我没有子节点",isParent:true}
    ];

    function init(){
        treeDialog({
            title : "TreeDialog",
            data : nodeObj,
            selectMulti : true,
            callback : function(data){
                for(var i=data.length;i--;){
                    console.log(data[i]);
                }
            }
        });
    }
    
    return {
        init : init
    };
});