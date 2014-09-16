define(["jquery","bootstrap"],function($){
    $("#affix").affix({
      offset: {
        top: 280,
        bottom: function () {
          return (this.bottom = $('.footer').outerHeight(true))
        }
      }
    })
});