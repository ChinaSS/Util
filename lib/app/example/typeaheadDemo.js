define(["Util","jquery"],function(util,$){
    util.typeahead({
        id:"TypeaheadId",
        callback:function(data){
            alert(data);
        }
    });
});