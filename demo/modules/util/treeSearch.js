define(["jquery"],function($){
var lastItems=[];

//初始化点击事件
function initTree($tree){
	$tree.on("click",".node",function(event){
		event.preventDefault();
		event.stopPropagation();
		$(this).toggleClass("open");
		$(this).siblings("ul").toggle();
	});
}

//延迟搜索
function listener($elem){
	var $tree=$elem.siblings("div");
	var trigger=null;
	var lastContent=null;
	$elem.on("keyup",function(event){
		var tree=$tree[0];
		if($.trim($(this).val())==lastContent&&event.which!="13"){return false;};
		lastContent=$.trim($(this).val());
		if(trigger){window.clearTimeout(trigger);}
		if (event.which==13) {doSearch(lastContent,tree);return true;};
		trigger=window.setTimeout(function(){
			trigger=null;
			doSearch(lastContent,tree);
		},400);
	})
}
//对整个树节点遍历
function doSearch(input,tree){
	var $items=$(tree).find(">ul>li");
	var data=$.trim(input);
	resetTree($(tree));
	if (data.length) {
		var index=0;
		do{
			$items.each(function(){
				if((hasContent(this,data)&&this.nodeName=="UL")||!hasContent(this,data)&&this.nodeName=="LI"){
					lastItems[index++]=this;
				}
			});
			$items=$items.filter(":visible").children("ul,li");
		}while($items.length);
	}else{
		$items.find("ul").hide().find("li").show();
		$items.find(">ul").show();
		$items.find(">.node").addClass("open");
	}
}
//重置树结构
function resetTree($tree){
	if (lastItems.length){
		$(lastItems).each(function(){
			if (this.nodeName=="UL") {
				$(this).hide();
			}
			else{
				$(this).show();
			}
		});
		lastItems=[];
	};
	$tree.find("a.open").removeClass("open");
}
//判断元素是否含有文本,并控制是否显示
function hasContent(elem,data){
	var $elem=$(elem);
	if (!$elem.find(":contains("+data+")").length) {
		$(elem).hide();
		return false;
	}else{
		$(elem).show();
		if($(elem).siblings(".node").length>0){
			$(elem).siblings(".node").addClass("open");
		}
		return true;
	}
}

return {
	treeInit : initTree,
	listen : listener,
	reset : resetTree
}

});