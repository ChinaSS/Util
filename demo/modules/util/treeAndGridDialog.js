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
define(["util/dialog","util/grid","zTree","css!ztree/css/zTreeStyle/zTreeStyle.css"],function(Dialog,Grid,zTree){

    function TreeAndGridDialogInit(config){
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
        return new TreeAndGridDialog(config);
    }

    function TreeAndGridDialog(config){
        var _this = this;
        var treeId = config.Id?"system_dialogTreeAndGrid_"+config.Id:"system_dialogTreeAndGrid_treeId";
        var gridId = config.Id?"system_dialogTreeAndGrid_"+config.Id:"system_dialogTreeAndGrid_gridId";

        this.callback = config.callback;
        this.dialog = Dialog({id:"system_dialog_treeAndGridDialog",title:config.title,dialogSize:"modal-lg",modal:"hide"});
        this.dialog.setBody("<div id='"+treeId+"' style='width:20%;display:inline-block;vertical-align:top;' class='ztree'></div><div id='"+gridId+"' style='width:80%;display:inline-block;vertical-align:top;' class='grid'></div>");
        this.grid = Grid($.extend(config.grid,{placeAt:gridId,id:gridId}));
        this.dialog.setFoot([
            {
                name:"确定",
                callback:function(){
                    var that = _this;
                    that.callback(that.grid.getSelectedRow());
                    that.dialog.$getDialog().modal("hide");
                }
            }
        ],true);
        this.tree = $.fn.zTree.init($("#"+treeId),config.tree.setting,config.tree.data);
        this.dialog.$getDialog().modal("show");
    }

    TreeAndGridDialog.fn = TreeAndGridDialog.prototype = {
        //对象方法扩展API
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(TreeAndGridDialog.fn,object);
            }
        },
        //获取$dom对象
        getDialog : function(){
            return this.dialog;
        },
        //获取zTree对象
        getGrid : function(){
            return this.grid;
        },
        getTree : function(){
            return this.tree;
        }
    };

    TreeAndGridDialog.fn.extend({
        //扩展方法
    });

    return TreeAndGridDialogInit;
});