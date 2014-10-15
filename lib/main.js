require.config({
    baseUrl:"lib",
    paths:{
        "bootstrap":"modules/bootstrap/js/bootstrap.min",
        "zTree":"modules/zTree/js/jquery.ztree.all-3.5.min",
        "date":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.min",
        "dateCN":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.cn",
        "json2":"modules/json2/json2",
        "base":"app/base",
        "Util":"util/Util",
        "demo":"app/example",
        "baseDialog":"util/dialog/BaseDialog",
        "grid":"util/grid/Grid"
    },
    shim:{
        "bootstrap":["jquery"],
        "ztree":["jquery"],
        "json2":{}
    },
    map:{
        '*':{
            'css': 'modules/requirejs/plugin/css.min',
            'text':'modules/requirejs/plugin/text'
        }
    }
});

 require(["jquery","bootstrap"],function(){
    require(["base"],function(){
        console.log("base loaded");
    });
    //table初始化
    require(["demo/GridDemo"],function(grid){
        grid.init("DemoGirdDivId");
        console.log("grid loaded");
    });
    //初始化zTree
    require(["demo/treeDemo"],function(tree){
        tree.init("TreeId");
        console.log("zTree loaded");
    });
    //初始化typeahead
    require(["demo/typeaheadDemo"],function(typeahead){
        typeahead.init("TypeaheadId");
        console.log("typeaheadDemo loaded");
    });
    //初始化treeDialog 点击事件
    $("#treeDialogId").on("click",function(){
        require(["demo/treeDialogDemo"],function(treeDialog){
            treeDialog.init();
            console.log("treeDialogDemo loaded");
        });
    });
    //初始化gridDialog 点击事件
    $("#gridDialogId").on("click",function(){
        require(["demo/gridDialogDemo"],function(gridDialog){
            gridDialog.init();
            console.log("gridDialogDemo loaded");
        });
    });
    //初始化treeAndGridDialog 点击事件
    $("#treeAndGridDialogId").on("click",function(){
        require(["demo/treeAndGridDialogDemo"],function(treeAndGridDialog){
            treeAndGridDialog.init();
            console.log("treeAndGridDialogDemo loaded");
        });
    });
    
    //侧边栏
    $("#sidebarButtonID").bind('click',function(){
        require(['Util',"date","dateCN","css!modules/bootstrap/plugins/datetimepicker/css/datetimepicker.min.css"],function(util){
            //弹出侧边栏
            util.sidebarDetial({
                url:'app/example/views/EditArtistInfo.html',
                width:'800px',
                'afterLoad':function(){
                    //日期组件事件绑定
                    $(".form-date").datetimepicker({format: 'yyyy-mm-dd',language: 'cn',autoclose: true,minView:2});
                }
            });
        })
    });
     //未登录或session过期时ajax处理
     /*$(document)
     .ajaxSuccess(function(event,request,settings){
         //服务端的过滤器发现未登录时设置头信息LOGIN-AUTH的值为login
         if(request.getResponseHeader('LOGIN-AUTH') === 'login'){
             require(["util"],function(util){
                 util.confirm("您没有登录或会话已过期请重新登录，是否立即跳转到登录页？",function(){
                     window.location = util.getServerPath();
                 })
             });
         }
     })
     .ajaxSend(function(){
         require(["util"],function(util){
         });
     })
     .ajaxError(function (event, jqxhr, settings, thrownError) {
         require(["util"],function(util){

         });
     });*/
 });