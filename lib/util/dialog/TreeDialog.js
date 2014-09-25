/***
* TreeDialog
* @param config
* config = {
    title : "Title",
*   treeId : id,                       //用于生成 zTree ID
*   isCache : true,                //是否缓存ztree数据,默认为true;不缓存则显示即时数据
*   data : {},                     //json对象数据(object)或者是url地址(string)
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {}                   //ztree setting
* }
***/
define(["baseDialog","util/ztree/ztree"],function(baseDialog,ztree){
    function treeDialog(config){
        return new treeDialog.fn.init(config);
    }

    treeDialog.fn = treeDialog.prototype = {
        init : function(config){
            var treeId = config.treeId?config.treeId:"system_zTree_dialogTree";
            var dialog = baseDialog({id:"system_dialog_treeDialog",title:config.title,dialogSize:"modal-sm",modal:"hide"});
            dialog.setBody("<div id='"+treeId+"' class='ztree'></div>");
            dialog.setFoot([
                {
                    name:"保存",
                    callback:function(){
                        var treeObj = $.fn.zTree.getZTreeObj(treeId);
                        var data=null;
                        if (treeObj!=undefined) {
                            data = treeObj.getSelectedNodes();
                        };
                        dialog.modal("hide");
                        config.callback(data);
                    }
                }
            ],true);
            var tree = ztree.init({
                treeId : treeId,
                data : config.data,
                setting : config.setting,
                isCache : config.isCache
            });
            dialog.modal("show");
            return {
                dialog : dialog,
                tree : tree
            }
        },
        destroy : function(){
            $.fn.zTree.destroy("system_zTree_dialogTree");
            $("#system_dialog_treeDialog").remove();
        }
    };

    treeDialog.fn.init.prototype = treeDialog.fn;

    return {
        init : treeDialog
    };
});