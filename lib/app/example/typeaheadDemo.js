define(["Util","jquery"],function(util,$){
    util.typeahead({
        id:"TypeaheadId",
        data : "lib/app/example/data/typeahead.json",
        callback:function(data){
            //do something
        }
    });
});