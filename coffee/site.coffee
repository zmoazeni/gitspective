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


class window.User extends Spine.Model
  @configure "User", "type", "url", "public_gists", "followers", "gravatar_id", "hireable", "avatar_url",  "public_repos", "bio", "login", "email", "html_url", "created_at", "company", "blog", "location", "following", "name"

  created_at_date: =>
    sliced = @created_at.slice(0, @created_at.length - 1)
    Date.parse(sliced).toString('MMMM d, yyyy')

class window.Repo extends Spine.Model
  @fetch: (user) ->
    @deleteAll()
    fetchHelper = (page) =>
      console.log("Fetching page #{page}")
      $.getJSON("https://api.github.com/users/#{user.login}/repos?page=#{page}&callback=?", (response) =>
        $.each(response.data, (i, repoData) -> Repo.create(repoData))
        nextExists = (response.meta["Link"] || []).filter((link) -> return true if link[1]["rel"] == "next")
        fetchHelper(page + 1) if nextExists.length > 0
      )
    fetchHelper(1)

##
# App
##

class window.App extends Spine.Controller
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
    Repo.fetch(user)
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
