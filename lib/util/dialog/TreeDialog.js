/***
* TreeDialog
* @param config
* config = {
*   id : id,                       //用于生成 zTree ID
*   isCache : true,                //是否缓存ztree数据,默认为true;不缓存则显示即时数据
*   data : {},                     //json对象数据(object)或者是url地址(string)
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {}                   //ztree setting
* }
***/
define(["baseDialog","util/ztree/ztree"],function(baseDialog,ztree){
    var treeDialog={};
    treeDialog.init=function(config){
        var treeid = config.treeId?config.treeId:"system_zTree_dialogTree";
        var dialog = baseDialog({id:"system_dialog_treeDialog",dialogSize:"modal-sm"});
        dialog.setBody("<div id='"+treeid+"' class='ztree'></div>");
        dialog.setFoot([
            {
                name:"保存",
                callback:function(){
                    var treeObj = $.fn.zTree.getZTreeObj(treeid);
                    var data=null;
                    if (treeObj!=undefined) {
                        data = treeObj.getSelectedNodes();
                    };
                    dialog.modal("hide");
                    config.callback(data);
                }
            }
        ],true);
        ztree.init(treeid,config.setting,config.data,config.isCache);
        dialog.modal("show");
    }
    treeDialog.destroy=function(){
        $.fn.zTree.destroy("system_zTree_dialogTree");
        $("#system_dialog_treeDialog").remove();
    }
    return treeDialog;
});