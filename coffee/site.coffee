# window.placeArrows = ->
#   min_max = $.unique($("#timeline li").map((e) -> parseInt($(this).css("left")) )).sort()
#   $("#timeline li").each ->
#     $e = $(@)
#     if parseInt($e.css("left")) == min_max[0]
#       $e.attr("data-align", "l")
#     else
#       $e.attr("data-align", "r")

# window.refreshTimeline = ->
#   $('#timeline').masonry("reload")
#   placeArrows()

$ ->
  # $('#timeline').masonry()
  # placeArrows()
  new App(el:$(".container"))

##
# Models
##

class User extends Spine.Model
  @configure "User", "type", "url", "public_gists", "followers", "gravatar_id", "hireable", "avatar_url",  "public_repos", "bio", "login", "email", "html_url", "created_at", "company", "blog", "location", "following", "name"



##
# App
##

class App extends Spine.Controller
  elements:
    "#messages":"messages"
    "#content":"content"

  events:
    "submit form":"search"
    # "click [data-action=home], [data-action=budget]":"navigateTo"

  constructor: ->
    super
    @routes
      "/": () =>
        @user = null
        @content.html(@view("index"))
      "/timeline/:user": (params) =>
        if @user
          @renderUser(@user)
        else
          @fetchUser(params.user, @renderUser)

    Spine.Route.setup()

  renderUser: (user) =>
    @content.html(@view("show", user:user))

  navigateTo: (e) =>
    e.preventDefault()
    @navigate($(e.target).attr("href"))

  fetchUser: (username, callback) =>
    $.getJSON("https://api.github.com/users/#{username}?callback=?", (response) =>
      if response.meta.status == 404
        @messages.html(@view("error", message:"User not found"))
      else
        @messages.html("")
        @user = new User(response.data)
        callback(@user)

    ).error(() =>
      @messages.html(@view("error", message:"Something went wrong with the API"))
    )

  search: (e) =>
    e.preventDefault()
    $form = $(e.target)
    username = $form.find("input").val()
    if $.isEmptyObject(username)
      @messages.html(@view("error", message:"Username is required"))
    else
      @fetchUser(username, () => @navigate("/timeline/#{username}"))


window.App = App
