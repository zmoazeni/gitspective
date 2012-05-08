window.placeArrows = ->
  $("#timeline li").each ->
    $e = $(@)
    if $e.css("left") == "40px"
      $e.attr("data-align", "l")
    else
      $e.attr("data-align", "r")

window.refreshTimeline = ->
  $('#timeline').masonry("reload")
  placeArrows()

$ ->
  $('#timeline').masonry()
  placeArrows()
