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
			$(this).parent().addClass("on").siblings(".on").removeClass("on");
		})
		getPosition($links);
		window.onresize=function(){
			getPosition($links);
		}
		$(document).on("scroll",function(){
			var scrolltop = $(this).scrollTop();
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
			$links.each(function(){
				if (scrolltop>=$(this).data("top")&&scrolltop<$(this).data("bottom")){
					if(!$(this).hasClass("active")){
						$(this).parent().addClass("active").siblings(".active").removeClass("active");
					}
					return true;
				};
			})
		})
	}
	function getPosition($elems){
		$elems.each(function(){
			var $target = $("#"+this.href.split("#")[1]).parent();
			$(this).data("top",$target.offset().top).data("bottom",$target.offset().top+$target.height());
		});
	}
});