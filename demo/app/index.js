define(["jquery","Bootstrap"],function(){
    require(["app/affix"],function(){
        console.log("base loaded");
    });

    //table初始化
    require(["app/demo/gridDemo"],function(grid){
        grid.init();
    });

    //初始化zTree
    require(["app/demo/treeDemo"],function(tree){
        tree.init();
    });

    //初始化typeahead
    require(["util/typeahead","css!util/css/typeahead.css"],function(typeahead){
        typeahead({
            id:"TypeaheadId",
            data : "/Util/demo/app/data/typeahead.json",
            callback:function(data){
                //do something
                alert("test");
            }
        });
    });

    //初始化treeDialog 点击事件
    $("#treeDialogId").on("click",function(){
        require(["app/demo/treeDialogDemo"],function(treeDialog){
            treeDialog.init();
        });
    });

    //初始化gridDialog 点击事件
    $("#gridDialogId").on("click",function(){
        require(["app/demo/gridDialogDemo"],function(gridDialog){
            gridDialog.init();
        });
    });

    //初始化treeAndGridDialog 点击事件
    $("#treeAndGridDialogId").on("click",function(){
        require(["app/demo/treeAndGridDialogDemo"],function(treeAndGridDialog){
            treeAndGridDialog.init();
        });
    });
    
    //侧边栏
    $("#sidebarButtonID").bind('click',function(e){
        require(['util/util',"Date","DateCN","css!bootstrap/plugins/datetimepicker/css/datetimepicker.min.css"],function(util){
            //弹出侧边栏
            util.slidebar({
                url:'/Util/demo/app/views/EditArtistInfo.html',
                width:'800px',
                allowClick:[e.target],
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