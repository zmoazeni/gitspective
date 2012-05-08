(function() {

  window.placeArrows = function() {
    return $("#timeline li").each(function() {
      var $e;
      $e = $(this);
      if ($e.css("left") === "40px") {
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
