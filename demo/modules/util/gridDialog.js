/***
* GridDialog
* @param config
* config = {   
*	title : "Title",               //dialog标题
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {}                   //grid config
* }
***/
define(["Util/dialog","Util/grid"],function(Dialog,Grid){
    var _setting = {};
    var _config = {
        title : "Grid Dialog"
    };

    function DialogInit(config){
        var setting = config.setting;
        delete config.setting;
        //合并参数
        config = $.extend(_config,config);
        setting = $.extend(true,_setting,setting);
        
        return new GridDialog(config,setting);
    }

    function GridDialog(config,setting){
        this.callback = config.callback;
        var _this = this,
            gridId = setting.gridId?setting.gridId:"system_dialogGrid";
        //初始化dialog
        this.dialog = Dialog({id:"system_dialog_gridDialog",title:config.title,dialogSize:"modal-lg",modal:"hide"});
        this.dialog.setBody("<div id='"+gridId+"'></div>");
        //初始化grid
        this.grid = Grid($.extend(setting,{placeAt:gridId}));
        this.dialog.setFoot([
            {
                name:"确认",
                callback:function(){
                    var that = _this;
                    that.callback(that.grid.getSelectedRow());
                    that.dialog.$getDialog().modal("hide");
                }
            }
        ],true);
        this.dialog.$getDialog().modal("show");
    }

    GridDialog.fn = GridDialog.prototype = {
        //对象方法扩展API
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(GridDialog.fn,object);
            }
        },
        //获取$dom对象
        getDialog : function(){
            return this.dialog;
        },
        //获取zTree对象
        getGrid : function(){
            return this.grid;
        }
    };

    return DialogInit;
});