(function() {

  window.placeArrows = function() {
    var min_max;
    min_max = $.unique($("#timeline li").map(function(e) {
      return parseInt($(this).css("left"));
    })).sort();
    return $("#timeline li").each(function() {
      var $e;
      $e = $(this);
      if (parseInt($e.css("left")) === min_max[0]) {
        return $e.attr("data-align", "l");
      } else {
        return $e.attr("data-align", "r");
      }
    });
  };

  window.refreshTimeline = function() {
    $('#timeline').masonry("reload");
    return placeArrows();
  };

  $(function() {
    $('#timeline').masonry();
    return placeArrows();
  });

}).call(this);
