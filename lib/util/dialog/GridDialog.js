/***
* TreeDialog
* @param config
* config = {   
	title : "Title",              	   //dialog标题
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {}                   //grid setting
* }
***/
define(["baseDialog","grid"],function(baseDialog,grid){
    var gridDialog={};
    gridDialog.init=function(config){
        var gridId = config.gridId?config.gridId:"system_dialogGrid";
        var dialog = baseDialog({id:"system_dialog_gridDialog",title:config.title,dialogSize:"modal-lg",modal:"hide"});
        dialog.setBody("<div id='"+gridId+"'></div>");
        dialog.setFoot([
            {
                name:"保存",
                callback:function(){
                    var data=null;
                    dialog.modal("hide");
                    config.callback(data);
                }
            }
        ],true);
        $.extend(config.setting,{placeAt:gridId});
        grid.init(config.setting);
        dialog.modal("show");
    }
    gridDialog.destroy=function(){
        $("#system_dialog_gridDialog").remove();
    }
    return gridDialog;
});