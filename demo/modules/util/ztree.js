/***
* @param config = {
    treeId : id,     //ztree ID
    setting : {},    //ztree 参数
    data : {},    //ztree 数据对象
    isCache : true   //是否缓存ztree
}
***/
define(["zTree","css!../../zTree/css/zTreeStyle/zTreeStyle.css"],function(){
    var tree={},cache={};
    tree.init=function(config){
        var treeObj,elem=$("#"+config.treeId);
        if(config.isCache&&cache.length>0&&cache[config.treeId]){
            return cache[config.treeId];
        }
        treeObj = $.fn.zTree.init(elem,config.setting,config.data);
        if(config.isCache){
            cache[config.treeId]=treeObj;
        }
        return treeObj;
    }
    tree.destroy=function(id){
        $.fn.zTree.destroy(id);
        delete cache[id];
    }
    console.log("tree loaded");
    return tree;
});