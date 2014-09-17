define(["zTree","css!modules/zTree/css/zTreeStyle/zTreeStyle.css"],function(){
    var tree={},cache={};
    tree.init=function(treeId,setting,nodeObj,isCache){
        var treeObj,elem;
        elem = $("#"+treeId);
        if(isCache&&cache.length>0&&cache[treeId]){
            return cache[treeId];
        }
        treeObj = $.fn.zTree.init(elem,setting,nodeObj);
        if(isCache){
            cache[treeId]=treeObj;
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