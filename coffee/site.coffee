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
  new App(el:$("#container"))

##
# Extensions
##

Spine.Controller.include
  view: (name, context) ->
    Mustache.render(views[name], context)


##
# App
##

class App extends Spine.Controller
  @extend Spine.Events

  events:
    "click [data-action=home], [data-action=budget]":"navigateTo"

  constructor: ->
    super
    @routes
      "/": () ->
        console.log("in here")
        @html @view("index")

    Spine.Route.setup(history:true)
    Spine.Route.bind("navigate", -> App.trigger("unbind:all"))

  navigateTo: (e) =>
    e.preventDefault()
    @navigate($(e.target).attr("href"))

window.App = App
