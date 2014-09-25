/***
* TreeDialog
* @param config
* config = {
    Id : id,                       //用于生成tree和grid的ID
*   title : "Title",               //dialog标题
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   grid : {},
*   tree : {
        data : null,
        isCache : true,
        setting : {}               //ztree 参数对象
    }
* }
***/
define(["baseDialog","util/ztree/ztree","grid"],function(baseDialog,ztree,grid){
    function treeAndGridDialog(config){
        return new treeAndGridDialog.fn.init(config);
    }
    treeAndGridDialog.fn = treeAndGridDialog.prototype = {
        init : function(config){
            var treeId = config.Id?"system_dialogTreeAndGrid_"+config.Id:"system_dialogTreeAndGrid_treeId";
            var gridId = config.Id?"system_dialogTreeAndGrid_"+config.Id:"system_dialogTreeAndGrid_gridId";
            var dialog = baseDialog({id:"system_dialog_treeAndGridDialog",title:config.title,dialogSize:"modal-lg",modal:"hide"});
            dialog.setBody("<div id='"+treeId+"' style='width:20%;display:inline-block;vertical-align:top;' class='ztree'></div><div id='"+gridId+"' style='width:80%;display:inline-block;vertical-align:top;' class='grid'></div>");
            dialog.setFoot([
                {
                    name:"保存",
                    callback:function(){
                        var data = null;
                        dialog.modal("hide");
                        config.callback(data);
                    }
                }
            ],true);
            $.extend(config.grid,{placeAt:gridId});
            var tree = ztree.init({
                treeId : treeId,
                setting : config.tree.setting,
                data : config.tree.data,
                isCache : config.tree.isCache
            });
            config.grid.id = gridId;
            grid.init(config.grid);
            dialog.modal("show");
            return {
                tree : tree,
                dialog : dialog,
                grid : grid
            }
        },
        destroy : function(){
            $("#system_dialog_treeAndGridDialog").remove();
        }
    }

    treeAndGridDialog.fn.init.prototype = treeAndGridDialog.fn;

    return {
        init : treeAndGridDialog
    }
});