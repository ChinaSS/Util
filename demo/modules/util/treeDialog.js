/***
* TreeDialog
* @param config
* config = {
    title : "Title",
*   treeId : id,                       //用于生成 zTree ID
*   isCache : true,                //是否缓存ztree数据,默认为true;不缓存则显示即时数据
*   data : {},                     //json对象数据(object)或者是url地址(string)
*   selectMulti : false,
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {}
* }
***/
define(["util/dialog","zTree","css!ztree/css/zTreeStyle/zTreeStyle.css"],function(Dialog,zTree){
    //tree setting
    var _setting = {
        view: {
            selectedMulti: false,
            showLine:false,
            dblClickExpand:false
        },
        data: {
            key: { title:"t" },
            simpleData: { enable:true }
        }
    };
    var _config = {
        title : "TreeDialog",
        treeId : "",
        isCache : true,
        data : null,
        selectMulti : false,
        callback : null,
        setting : {}
    };

    function DialogInit(config){
        var setting = {
            view : { selectedMulti: config.selectMulti }
        };
        //处理url地址
        if (typeof config.data === "string") {
            setting.async={
                enable : true,
                url : config.data
            };
            config.data=null;
            config.isCache=false;//异步读取数据时,不缓存ztree
        }
        //合并参数
        config = $.extend(_config,config);
        setting = $.extend(true,_setting,config.setting,setting);

        return new TreeDialog(config,setting);
    }

    function TreeDialog(config,setting){
        var _this = this;
            treeId = config.treeId?config.treeId:"system_zTree_dialogTree";
        this.callback = config.callback;
        //初始化dialog
        this.dialog = Dialog({id:"system_dialog_treeDialog",title:config.title,dialogSize:"modal-sm",modal:"hide"});
        this.dialog.setBody("<div id='"+treeId+"' class='ztree'></div>");
        this.dialog.setFoot([
            { 
                name:"保存",
                callback:function(){
                    var that = _this;
                    var data=null;
                    if (that.tree!=undefined) {
                        data = that.tree.getSelectedNodes();
                    }
                    that.dialog.$getDialog().modal("hide");
                    that.callback(data);
                }
            }
        ],true);
        //初始化zTree
        this.tree = $.fn.zTree.init($("#"+treeId),setting,config.data);
        //显示dialog
        this.dialog.$getDialog().modal("show");
    }

    TreeDialog.fn = TreeDialog.prototype = {
        //对象方法扩展API
        extend : function(object){
            if (typeof object === "object" && object.constructor === Object){
                $.extend(TreeDialog.fn,object);
            }
        },
        //获取dialog对象
        getDialog : function(){
            return this.dialog;
        },
        //获取zTree对象
        getTree : function(){
            return this.tree;
        }
    };

    return DialogInit;
});