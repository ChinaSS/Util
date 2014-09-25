define(["jquery","bootstrap"],function($){
	var AffixTop = 280;
	//bootstrap样式控制(可选)
    $("#affix").affix({
      offset: {
        top: AffixTop,
        bottom: function () {
          return (this.bottom = $('.footer').outerHeight(true))
        }
      }
    })
    affixScrollInit();
    //初始化监听affix
    function affixScrollInit(){
		var $links =  $("#affix ul a");
		$links.on("click",function(){
			$(this).parent().addClass("active").siblings(".active").removeClass("active");
		});
		$(document).on("scroll",function(){
			var scrolltop = $(this).scrollTop();
			if (!$links.is(".active")) {
				initAffixLink($links,scrolltop);
			}
			if ($(this).height()==window.innerHeight) {
				return false;
			};
			if(scrolltop<AffixTop){
				$links.parent().removeClass("active");
			}else if (scrolltop>=($(this).height()-window.innerHeight)) {
				$links.last().parent().addClass("active").siblings(".active").removeClass("active");
				return true;
			}
			setAffixLink(scrolltop);
		});
	}
	//监听页面滚动,设置affix当前链接样式
	function setAffixLink(scrolltop){
		var $cur = $("#affix .active");
		if($cur.length==0){return false;}
		var $target = $("#"+$cur.find("a")[0].href.split("#")[1]).parent();
		if(scrolltop>$target.offset().top+$target.height()+60){
			$cur.removeClass("active").next().addClass("active");
		}else if (scrolltop<$target.offset().top&&$cur.index()!=0) {
			$cur.removeClass("active").prev().addClass("active");
		}
	}
	//根据页面滚动距离,初始化affix当前链接样式
	function initAffixLink($elems,scrolltop){
		if (scrolltop>AffixTop) {
			$elems.each(function(){
				var $target = $("#"+this.href.split("#")[1]).parent();
				if ($target.offset().top>scrolltop&&$target.prev().offset().top<scrolltop) {
					$(this).parent().prev().addClass("active").siblings(".active").removeClass("active");
				};
			});
		}
	}
});