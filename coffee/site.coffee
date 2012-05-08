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
  new App(el:$(".container"))

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

  elements:
    ".messages":"messages"

  events:
    "submit form":"search"
    # "click [data-action=home], [data-action=budget]":"navigateTo"

  constructor: ->
    super
    @routes
      "/": () -> @html @view("index")

    Spine.Route.setup(history:true)
    Spine.Route.bind("navigate", -> App.trigger("unbind:all"))

  navigateTo: (e) =>
    e.preventDefault()
    @navigate($(e.target).attr("href"))

  search: (e) =>
    e.preventDefault()
    $form = $(e.target)
    username = $form.find("input").val()
    if $.isEmptyObject(username)
      @messages.html(@view("error", message:"Username is required"))
    else
      $.getJSON("https://api.github.com/users/#{username}?callback=?", (data) =>
        if data.meta.status == 404
          @messages.html(@view("error", message:"User not found"))
        else
          console.log("success")
        ).error(() => @messages.html(@view("error", message:"Something went wrong with the API")))



window.App = App
