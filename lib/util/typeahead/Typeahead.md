Typeahead
==========

##Typeahead 样例

>html样例

**TypeaheadDemo.js**
```
define(["Util","jquery"],function(util,$){
    util.typeahead({    /* 初始化typeahead */
        id:"TypeaheadId",
        callback:function(data){
            alert(data);
        }
    });
});
```
##Typeahead API
通过javascript函数调用TreeDialog:
```
util.typeahead(config);
```
###config参数
|名称|类型|默认值|描述|
|:|
|id        |string          |null   |锚点id,在该元素处初始化typeahead  |
|text      |string          |null   |设置按钮文本                     |
|data      |object , string |null   |JSON对象或是数据URL地址           |
|lazyMatch |boolean         |true   |是否启用延迟匹配,优化查询性能      |
|callback  |function        |null   |回调处理函数,接受一个数据参数      |
