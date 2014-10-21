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
    depend:{
       baseDialog:baseDialog,
       grid:grid
    }
* }
***/
define([],function(){

    function treeAndGridDialog(config){
        config.tree.setting={
            view: {
                selectedMulti: false,
                showLine:false,
                dblClickExpand:false
            },
            data: { 
                key: { title:"t" },
                simpleData: { enable : true }
            }
        };
        if (typeof config.tree.data === "string") {
            config.tree.setting.async={
                enable : true,
                url : config.data
            };
            config.tree.data=null;
            config.tree.isCache=false;//异步读取数据时,不缓存ztree
        }
        return new treeAndGridDialog.fn.init(config);
    }

    treeAndGridDialog.fn = treeAndGridDialog.prototype = {
        init : function(config){
            var baseDialog  = config.depend.baseDialog;
            var grid        = config.depend.grid;

            var treeId = config.Id?"system_dialogTreeAndGrid_"+config.Id:"system_dialogTreeAndGrid_treeId";
            var gridId = config.Id?"system_dialogTreeAndGrid_"+config.Id:"system_dialogTreeAndGrid_gridId";
            var dialog = baseDialog({id:"system_dialog_treeAndGridDialog",title:config.title,dialogSize:"modal-lg",modal:"hide"});
            dialog.setBody("<div id='"+treeId+"' style='width:20%;display:inline-block;vertical-align:top;' class='ztree'></div><div id='"+gridId+"' style='width:80%;display:inline-block;vertical-align:top;' class='grid'></div>");

            config.grid.id = gridId;
            var gridInstance = grid.init($.extend(config.grid,{placeAt:gridId}));
            dialog.setFoot([
                {
                    name:"确定",
                    callback:function(){
                        config.callback(gridInstance.getSelectedRow());
                        dialog.modal("hide");
                    }
                }
            ],true);

            /*var tree = ztree.init({
             treeId : treeId,
             setting : config.tree.setting,
             data : config.tree.data,
             isCache : config.tree.isCache
             });*/
            var tree =  $.fn.zTree.init($("#"+treeId),config.tree.setting,config.tree.data);


            dialog.modal("show");
            $.extend(this,{
                tree : tree,
                dialog : dialog,
                grid : grid
            });
        },
        destroy : function(){
            $("#system_dialog_treeAndGridDialog").remove();
        }
    };

    treeAndGridDialog.fn.init.prototype = treeAndGridDialog.fn;

    return {
        init : treeAndGridDialog
    }
});