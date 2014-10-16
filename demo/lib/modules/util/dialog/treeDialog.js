/***
* TreeDialog
* @param config
* config = {
    title : "Title",
*   treeId : id,                       //用于生成 zTree ID
*   isCache : true,                //是否缓存ztree数据,默认为true;不缓存则显示即时数据
*   data : {},                     //json对象数据(object)或者是url地址(string)
*   callback : function(data){},   //回调函数,接收JSON类型数据
*   setting : {},                   //ztree setting
*   depend:{
*       baseDialog:baseDialog
*   }
* }
***/
define([],function(){
    function treeDialog(config){
        config = $.extend({
            treeId : "",
            isCache : true,
            data : null,
            selectMulti : false,
            callback : null
        },config);
        //zTree setting
        config.setting={
            view: {
                selectedMulti: config.selectMulti,
                showLine:false,
                dblClickExpand:false
            },
            data: {
                key: {
                    title:"t"
                },
                simpleData: {
                    enable : true
                }
            }
        };
        //data为url时,设置ztree异步读取数据
        if (typeof config.data === "string") {
            config.setting.async={
                enable : true,
                url : config.data
            };
            config.data=null;
            config.isCache=false;//异步读取数据时,不缓存ztree
        }
        return new treeDialog.fn.init(config);
    }

    treeDialog.fn = treeDialog.prototype = {
        init : function(config){
            var baseDialog  = config.depend.baseDialog;

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
                        }
                        dialog.modal("hide");
                        config.callback(data);
                    }
                }
            ],true);
            //tree的缓存交由该模块实现
            /*var tree = ztree.init({
                treeId : treeId,
                data : config.data,
                setting : config.setting,
                isCache : config.isCache
            });*/
            var tree =  $.fn.zTree.init($("#"+treeId),config.setting,config.data);
            dialog.modal("show");
            
            $.extend(this,{
                tree : tree,
                dialog : dialog
            });
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