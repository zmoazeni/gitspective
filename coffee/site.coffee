window.placeArrows = ->
  min_max = $.unique($("#timeline li").map((e) -> parseInt($(this).css("left")) )).sort()
  $("#timeline li").each ->
    $e = $(@)
    if parseInt($e.css("left")) == min_max[0]
      $e.attr("data-align", "l")
    else
      $e.attr("data-align", "r")

window.refreshTimeline = ->
  $('#timeline').masonry("reload")
  placeArrows()

$ ->
  $('#timeline').masonry()
  placeArrows()
