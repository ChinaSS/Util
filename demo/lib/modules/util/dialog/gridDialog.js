/***
* GridDialog
* @param config
* config = {   
*	title : "Title",               //dialog标题
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {}                   //grid setting
*   depend:{
*       baseDialog:baseDialog,
*       grid:grid
*   }
* }
***/
define([],function(){
    var gridDialog={};
    gridDialog.init=function(config){
        var baseDialog  = config.depend.baseDialog;
        var grid        = config.depend.grid;

        var gridId = config.gridId?config.gridId:"system_dialogGrid";
        var dialog = baseDialog({id:"system_dialog_gridDialog",title:config.title,dialogSize:"modal-lg",modal:"hide"});
        dialog.setBody("<div id='"+gridId+"'></div>");
        var gridInstance = grid.init($.extend(config.gridConfig,{placeAt:gridId}));
        dialog.setFoot([
            {
                name:"确认",
                callback:function(){
                    config.callback(gridInstance.getSelectedRow());
                    dialog.modal("hide");
                }
            }
        ],true);

        dialog.modal("show");
    };
    gridDialog.destroy=function(){
        $("#system_dialog_gridDialog").remove();
    };
    return gridDialog;
});