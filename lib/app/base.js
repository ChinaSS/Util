define(["jquery","bootstrap"],function($){
    $("#affix").affix({
      offset: {
        top: 280,
        bottom: function () {
          return (this.bottom = $('.footer').outerHeight(true))
        }
      }
    })
    affixScrollInit();
    function affixScrollInit(){
		var $links =  $("#affix ul a");
		$links.on("click",function(){
			$(this).parent().addClass("active").siblings(".active").removeClass("active");
		});
		$(document).on("scroll",function(){
			var scrolltop = $(this).scrollTop();
			if (!$links.is(".active")) {
				getPosition($links,scrolltop);
			}
			if ($(this).height()==window.innerHeight) {
				return false;
			};
			if(scrolltop<=0){
				$links.first().parent().addClass("active").siblings(".active").removeClass("active");
				return true;
			}else if (scrolltop>=($(this).height()-window.innerHeight)) {
				$links.last().parent().addClass("active").siblings(".active").removeClass("active");
				return true;
			}
			setPosition(scrolltop);
		});
	}
	function setPosition(scrolltop){
		var $cur = $("#affix .active");
		if($cur.length==0){return false;}
		var $target = $("#"+$cur.find("a")[0].href.split("#")[1]).parent();
		if(scrolltop>$target.offset().top+$target.height()+60){
			$cur.removeClass("active").next().addClass("active");
		}else if (scrolltop<$target.offset().top&&$cur.index()!=0) {
			$cur.removeClass("active").prev().addClass("active");
		}
	}
	function getPosition($elems,scrolltop){
		if (scrolltop<280) {
			$elems.first().parent().addClass("active");
		}else{
			$elems.each(function(){
				var $target = $("#"+this.href.split("#")[1]).parent();
				if ($target.offset().top>scrolltop&&$target.prev().offset().top<scrolltop) {
					$(this).parent().prev().addClass("active").siblings(".active").removeClass("active");
				};
			});
		}
	}
});