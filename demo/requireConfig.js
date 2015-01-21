require.config({
    baseUrl: getStaticPath(),
    paths:{
        "ZTree":"modules/zTree/js/jquery.ztree.all-3.5.min",
        "Bootstrap":"modules/bootstrap/js/bootstrap.min",
        "Date":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.min",
        "DateCN":"modules/bootstrap/plugins/datetimepicker/js/datetimepicker.cn",
        "Json2":"modules/json2/json2",
        /*目录地址映射*/
        "UtilDir":"modules/util",
        /*CSS文件路径映射*/
        "ZTreeCss":"modules/zTree/css/zTreeStyle/zTreeStyle"
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

(function(w){

    //静态文件目录名称
    var staticDir = "/static";
    var projectName = document.location.pathname.substring(0,document.location.pathname.indexOf(staticDir+"/"));
    /**
     * 得到项目名称
     * 默认为:8080（即origin）与static目录之间的部分
     * https://chinass.github.io/example/static/index.html即项目名称为example
     * @returns {*}
     */
    w.getServer = function(){
        return projectName;
    };

    /*
     * 全局静态资源路径
     * @returns {string}
     */
    w.getStaticPath = function(){
        return getServer()+staticDir;
    }
})(window);