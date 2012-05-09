##
# Models
##

hasMorePages = (meta) ->
  (meta["Link"] || []).filter((link) ->
    true if link[1]["rel"] == "next"
  ).length > 0

parseISODate = (raw) -> Date.parse(raw.slice(0, raw.length - 1))

TimeStamps = {
  created_at_date: -> parseISODate(@created_at)
  created_at_string: -> @created_at_date().toString('MMMM d, yyyy')
}

class User extends Spine.Model
  @configure "User", "type", "url", "public_gists", "followers", "gravatar_id", "hireable", "avatar_url",  "public_repos", "bio", "login", "email", "html_url", "created_at", "company", "blog", "location", "following", "name"
  @include TimeStamps

class Repo extends Spine.Model
  @configure "Repo", "updated_at", "clone_url", "has_downloads", "watchers", "homepage", "git_url", "mirror_url", "fork", "ssh_url", "url", "has_wiki", "has_issues", "forks", "language", "size", "html_url", "private", "created_at", "name", "open_issues", "description", "svn_url", "pushed_at"
  @include TimeStamps

  @fetch: (user) ->
    @deleteAll()
    fetchHelper = (page) =>
      console.log("Fetching repo page #{page}")
      $.getJSON("https://api.github.com/users/#{user.login}/repos?page=#{page}&callback=?", (response) =>
        $.each(response.data, (i, repoData) -> Repo.create(repoData))
        fetchHelper(page + 1) if hasMorePages(response.meta)
      )
    fetchHelper(1)

class Event extends Spine.Model
  @configure "Event", "type", "public", "repo", "created_at", "actor", "id", "payload"
  @include TimeStamps

  @fetchPages: (user, callback, page = 1) ->
    max = page + 2 # pulls down 3 pages at a time
    fetchHelper = (currentPage, events, callback) =>
      console.log("Fetching event page #{currentPage}")
      url = "https://api.github.com/users/#{user.login}/events?page=#{currentPage}&callback=?"

      $.getJSON url, (response) =>
        $.each(response.data, (i, eventData) -> events.push(new Event(eventData)))
        if currentPage < max && hasMorePages(response.meta)
          fetchHelper(currentPage + 1, events, callback)
        else
          callback([currentPage + 1, events])

    fetchHelper(page, [], callback)

  viewType: ->
    switch @type
      when "CreateEvent"
        if @payload.ref_type == "repository"
          "repo"
        else
          "item"

      else "item"

  viewInfo: ->
    view = @viewType()
    switch view
      when "item" then [view, id:@id, title:@type]
      when "repo" then [view, id:@id, title:@repo.name]


window.Github = {User:User, Repo:Repo, Event:Event}

##
# App
##

class window.App extends Spine.Controller
  elements:
    "#messages":"messages"
    "#content": "content"
    "#timeline":"timeline"
    "#joined":  "joined"

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
    @content.find("#timeline").append(@view("joined", user:user))
    @refreshElements() # this refreshes @joined and @timeline
    @timeline.masonry()

    @page = 1
    Event.fetchPages user, ([page, events]) =>
      @page = page
      events.forEach((event) -> event.save())
      sorted = events.sort((a, b) -> b.created_at_date() - a.created_at_date())
      @appendEvents(sorted)

  appendEvents: (events) ->
    events.forEach (event) =>
      [viewType, viewArgs] = event.viewInfo()
      @joined.before(@view(viewType, viewArgs))
    @refreshTimeline()

  placeArrows: ->
    min_max = $.unique(@timeline.find(".item").map((e) -> parseInt($(this).css("left")) )).sort()
    @timeline.find(".item").each ->
      $e = $(@)
      if parseInt($e.css("left")) == min_max[0]
        $e.attr("data-align", "l")
      else
        $e.attr("data-align", "r")

  refreshTimeline: ->
    @timeline.masonry("reload")
    @placeArrows()

  navigateTo: (e) =>
    e.preventDefault()
    @navigate($(e.target).attr("href"))

  fetchUser: (username, callback) =>
    $.getJSON("https://api.github.com/users/#{username}?callback=?", (response) =>
      if response.meta.status == 404
        @messages.html(@view("error", message:"User not found"))
      else if response.meta["X-RateLimit-Remaining"] == "0"
        @messages.html(@view("error", message:"Your IP has hit your Github API limit. Please wait for it to reset"))
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

##
# Start the App
##

$ ->
  window.app = new App(el:$(".container"))
