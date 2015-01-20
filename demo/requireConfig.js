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
var root;
function getStaticPath(){
	if(!root){
		var pathname=document.location.pathname;
		root=pathname.replace(/index.html/,"");
	}
    return root;
}