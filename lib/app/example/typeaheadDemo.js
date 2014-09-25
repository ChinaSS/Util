define(["Util","jquery"],function(util,$){
    function init(id){
        util.typeahead({
	        id:id,
	        data : "lib/app/example/data/typeahead.json",
	        callback:function(data){
	            //do something
	        }
	    });
    }
    return {
        init : init
    }
});