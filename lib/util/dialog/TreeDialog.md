TreeDialog
==========

##TreeDialog 样例

>html样例

**TreeDialogDemo.js**
```
define(["Util","jquery"],function(util,$){
    var nodeObj;    /* treeDialog所需数据, JSON对象 or 数据url地址 */

    /* 获取数据 */

    $("#treeDialogId").on("click",function(){

        util.treeDialog({    /* 初始化treeDialog */
            data : nodeObj,
            selectMulti : true,
            callback : function(data){
                var text = [];
                for(var i=data.length;i--;){
                    text.push("我是 "+data[i].name+"\n");
                }
                console.log(text.join(""));
            }
        });
    });
});
```
##TreeDialog API
通过javascript函数调用TreeDialog:
```
util.treeDialog(config);
```
###config参数
|名称       |类型             |默认值 |描述                                   |
|:--------- |:--------------- |:----- |:------------------------------------- |
|treeId     |string           |null   |用于标示特定tree,以缓存不同数据        |
|isCache    |boolean          |true   |是否启用tree数据缓存                   |
|data       |object , string  |null   |JSON对象或是数据URL地址                |
|selectMulti|boolean          |false  |是否启用tree数据多选功能               |
|callback   |function         |null   |选中数据回调处理函数,仅接受一个数据参数|