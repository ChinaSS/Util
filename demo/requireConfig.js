require.config({
    baseUrl: getStaticPath(),
    paths:{
        "Angular":"modules/angular/angular.min",
        "Angular-route":"modules/angular/angular-route.min",
        "JQuery.validate":"modules/jquery/plugins/validate/jquery.validate.min",
        "JQuery.validate.extra":"modules/jquery/plugins/validate/additional-methods",
        "JQuery.validate.message":"modules/jquery/plugins/validate/localization/messages_zh",
        "ZTree":"modules/zTree/js/jquery.ztree.all-3.5.min",
        "ZTreeCss":"modules/zTree/css/zTreeStyle/zTreeStyle",
        "WebUploader":"modules/webuploader/webuploader.nolog.min",
        "Bootstrap":"modules/bootstrap/js/bootstrap.min",
        "Date":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.min",
        "DateCN":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.cn",
        "Util":"modules/util",
        "Json2":"modules/json2/json2"
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
function getStaticPath(){
    return "/Util/demo/";
    //return "";
}