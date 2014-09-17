define(["baseDialog","ztree"],function(baseDialog,ztree){
    var treeDialog={};
    treeDialog.init=function(setting,nodeObj,callback,isCache){
        var treeid = "system_zTree_dialogTree";
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
                    callback(data);
                }
            }
        ],true);
        ztree.init(treeid,setting,nodeObj,isCache);
        dialog.modal("show");
    }
    treeDialog.destroy=function(){
        $.fn.zTree.destroy("system_zTree_dialogTree");
        $("#system_dialog_treeDialog").remove();
    }
    return treeDialog;
});