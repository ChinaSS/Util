define(["Util","jquery"],function(util,$){
    util.typeahead({
        id:"TypeaheadId",
        data : "lib/util/typeahead/name.json",
        callback:function(data){
            //do something
        }
    });
});