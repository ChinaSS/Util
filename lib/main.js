require.config({
    baseUrl:"lib",
    paths:{
        "bootstrap":"modules/bootstrap/js/bootstrap.min",
        "zTree":"modules/zTree/js/jquery.ztree.all-3.5.min",
        "json2":"modules/json2/json2",
        "util":"util/Util",
        "baseDialog":"util/dialog/BaseDialog"
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

 require(["bootstrap","util"],function(util){
    //页面打开初始化


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