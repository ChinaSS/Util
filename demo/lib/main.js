require.config({
    baseUrl:"lib",
    paths:{
        "Bootstrap":"modules/bootstrap/js/bootstrap.min",
        "ZTree":"modules/zTree/js/jquery.ztree.all-3.5.min",
        "Date":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.min",
        "DateCN":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.cn",
        "Json2":"modules/json2/json2",
        "Base":"app/base",
        "Util":"modules/util/util",
        "Demo":"app/example",
        "BaseDialog":"modules/util/dialog/baseDialog",
        "GridDialog":"modules/util/dialog/gridDialog",
        "TreeDialog":"modules/util/dialog/treeDialog",
        "TreeAndGridDialog":"modules/util/dialog/treeAndGridDialog",
        "Grid":"modules/util/grid/grid",
        "Typeahead":"modules/util/typeahead/typeahead"
    },
    shim:{
        "Bootstrap":["jquery"],
        "ZTree":["jquery"],
        "Json2":{}
    },
    map:{
        '*':{
            'css': 'modules/requirejs/plugin/css.min',
            'text':'modules/requirejs/plugin/text'
        }
    }
});

 require(["jquery","Bootstrap"],function(){
    require(["Base"],function(){
        console.log("base loaded");
    });

    //table初始化
    require(["Demo/gridDemo"],function(grid){
        grid.init();
    });

    //初始化zTree
    require(["Demo/treeDemo"],function(tree){
        tree.init();
    });

    //初始化typeahead
    require(["Typeahead","css!modules/util/typeahead/typeahead.css"],function(typeahead){
        typeahead.init({
            id:"TypeaheadId",
            data : "lib/app/example/data/typeahead.json",
            callback:function(data){
                //do something
            }
        });
    });

    //初始化treeDialog 点击事件
    $("#treeDialogId").on("click",function(){
        require(["Demo/treeDialogDemo"],function(treeDialog){
            treeDialog.init();
        });
    });

    //初始化gridDialog 点击事件
    $("#gridDialogId").on("click",function(){
        require(["Demo/gridDialogDemo"],function(gridDialog){
            gridDialog.init();
        });
    });

    //初始化treeAndGridDialog 点击事件
    $("#treeAndGridDialogId").on("click",function(){
        require(["Demo/treeAndGridDialogDemo"],function(treeAndGridDialog){
            treeAndGridDialog.init();
        });
    });
    
    //侧边栏
    $("#sidebarButtonID").bind('click',function(){
        require(['Util',"Date","DateCN","css!modules/bootstrap/plugins/datetimepicker/css/datetimepicker.min.css"],function(util){
            //弹出侧边栏
            util.slidebar({
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