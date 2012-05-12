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
  created_at_short_string: -> @created_at_date().toString('MMM d, yyyy')
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
      $.getJSON("https://api.github.com/users/#{user.login}/repos?page=#{page}&callback=?", (response) =>
        $.each(response.data, (i, repoData) -> Repo.create(repoData))
        fetchHelper(page + 1) if hasMorePages(response.meta)
      )
    fetchHelper(1)

class Event extends Spine.Model
  @configure "Event", "type", "public", "repo", "created_at", "actor", "id", "payload", "commits"
  @include TimeStamps

  @fetchPages: (user, page, callback) ->
    max = page + 2 # pulls down 3 pages at a time
    fetchHelper = (currentPage, events, callback) =>
      url = "https://api.github.com/users/#{user.login}/events?page=#{currentPage}&callback=?"

      $.getJSON url, (response) =>
        $.each(response.data, (i, eventData) -> events.push(new Event(eventData)))
        if currentPage < max && hasMorePages(response.meta)
          fetchHelper(currentPage + 1, events, callback)
        else
          consolidated = @consolidateEvents(events)
          if hasMorePages(response.meta)
            callback([currentPage + 1, consolidated])
          else
            callback([-1, consolidated])


    fetchHelper(page, [], callback)

  @consolidateEvents: (events) ->
    [otherEvents, pushEvents] = [[], []]
    for e in events
      if e.type == "PushEvent" then pushEvents.push(e) else otherEvents.push(e)

    groups = {}
    for e in pushEvents
      groups[e.groupKey()] ||= []
      groups[e.groupKey()].push(e)

    for _, events of groups
      keptEvent = events.shift()
      keptEvent.addCommits(keptEvent.payload?.commits)
      for e in events
        keptEvent.addCommits(e.payload?.commits)

      otherEvents.push(keptEvent)

    otherEvents

  constructor: (args) ->
    super(args)
    @commits ||= []

  groupKey: -> "#{@repo.name}-#{@created_at_short_string()}"

  addCommits: (newCommits) ->
    newCommits.forEach((e) => @commits.push(e)) if newCommits

  viewType: ->
    defaultTypes = {
      ForkEvent:  "fork"
      FollowEvent:"follow"
      WatchEvent: "watch"
      PublicEvent:"public"

      DeleteEvent:    "skip"
      MemberEvent:    "skip"
      DownloadEvent:  "skip"
      TeamAddEvent:   "skip"
      ForkApplyEvent: "skip"
    }

    return defaultTypes[@type] if defaultTypes[@type]

    view = switch @type
      when "PullRequestReviewCommentEvent"
        "pull_request_comment" if @payload.comment._links
      when "IssueCommentEvent"
        "issue_comment" if @payload.issue
      when "IssuesEvent"
        "issue" if @payload.action == "opened"
      when "CommitCommentEvent"
        "commit_comment" if @payload.comment
      when "PullRequestEvent"
        "pull_request" if @payload.action == "opened" && @payload.pull_request._links
      when "GistEvent"
        "gist" if @payload.action == "create" && @payload.gist
      when "CreateEvent"
        switch @payload.ref_type
          when "branch"
            "branch" if @payload.ref != "master"
          else @payload.ref_type
      when "PushEvent"
        "push" if @payload.commits?.length > 0
      when "GollumEvent"
        "gollum" if @payload.pages?.length > 0
      else "item"

    view || "skip"

  viewInfo: ->
    view = @viewType()
    context = switch view
      when "repository", "watch", "public" then {}
      when "item"
        {title:@type}
      when "gist"
        {url:@payload.gist.html_url}
      when "issue"
        {
          url:@payload.issue.html_url
          title:@payload.issue.title
          comment:@payload.issue.body
        }
      when "issue_comment"
        {
          url:@payload.issue.html_url
          comment:@payload.comment.body
          type:"comment"
        }
      when "commit_comment"
        {
          url:@payload.comment.html_url
          comment:@payload.comment.body
          type:"comment"
        }
      when "pull_request_comment"
        {
          url:@payload.comment._links.html.href
          comment:@payload.comment.body
          type:"comment"
        }
      when "pull_request"
        {
          url:@payload.pull_request._links.html.href
          comment:@payload.pull_request.body
          type:"issue"
        }
      when "fork"
        {
          fork_url:@payload.forkee.html_url
          fork_name:"#{@actor.login}/#{@payload.forkee.name}"
          description:@payload.forkee.description
        }
      when "follow"
        {
          url:(@payload.target.html_url || "https://github.com/#{@payload.target.login}")
          name:(@payload.target.name || @payload.target.login)
          gravatar:@payload.target.avatar_url
          type:"watch"
        }
      when "tag", "branch"
        {
          name:@payload.ref
          url:"https://github.com/#{@repo.name}/tree/#{@payload.ref}"
          type:"branch"
        }
      when "push"
        commits = @commits.map (c, i) =>
          commit:c.sha.slice(0, 5)
          commit_url:"https://github.com/#{@repo.name}/commit/#{c.sha}"
          message:c.message.split("\n")[0]
          hidden:i > 2

        {
          login:@actor.login
          num:commits.length
          commits:commits
          more:commits.length > 3
        }
      when "gollum"
        pages = @payload.pages.map((p, i) => {title:p.title, url:p.html_url, action:p.action, hidden:i > 2})
        {
          pages:pages
          num:pages.length
          more:pages.length > 3
          type:"push"
        }
      else null

    if context
      [
        view,
        $.extend({
          id:@id
          repo:@repo.name
          repo_url:"https://github.com/#{@repo.name}"
          date:@created_at_short_string()
          type:view
        }, context)
      ]
    else
      []


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
    "#spinner": "spinner"

  events:
    "submit form":"search"
    "click [data-show-more]":"toggleMore"
    "click .nav-pills a":"toggleFilter"

  constructor: ->
    super
    @routes
      "/": @renderIndex
      "/gitspective/": @renderIndex

      "/timeline/:user": (params) =>
        if @user
          @renderUser(@user)
        else
          @fetchUser(params.user, @renderUser)

    Spine.Route.setup()

  renderIndex: =>
    @user = null
    @content.html(@view("index"))

  renderUser: (user) =>
    Repo.fetch(user)
    @content.html(@view("show", user:user))
    @content.find("#timeline").append(@view("joined", user:user))
    @refreshElements() # this refreshes @joined and @timeline
    @timeline.masonry(itemSelector:"#timeline li:not(.hidden)")

    @page = 1
    @fetchSomeEvents()

  fetchSomeEvents: =>
    @startSpinner()
    Event.fetchPages @user, @page, ([page, events]) =>
      @page = page
      events.forEach((event) -> event.save())
      sorted = events.sort((a, b) -> b.created_at_date() - a.created_at_date())
      @stopSpinner()
      @appendEvents(sorted)

  startSpinner: =>
    @joined.before(@view("spinner"))
    @refreshElements()
    @refreshTimeline()
    new Spinner().spin(@spinner[0])

  stopSpinner: => @spinner.remove()

  appendEvents: (events) ->
    events.forEach (event) =>
      [viewType, viewArgs] = event.viewInfo()
      if viewType
        html = @view(viewType, viewArgs)
        html = $(html).addClass("hidden") if @isHidden(viewArgs["type"])
        @joined.before(html)
    @refreshTimeline()
    @attachWaypoint()

  isHidden: (type) ->
    $parent = @content.find(".nav-pills [data-type=#{type}]").parent("li")
    $parent[0] && !$parent.hasClass("active")

  attachWaypoint: ->
    if @page != -1
      @joined.waypoint (e, direction) =>
        if direction == "down"
          @fetchSomeEvents()
      , {offset: 'bottom-in-view', triggerOnce:true}

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

  toggleMore: (e) =>
    e.preventDefault()
    $e = $(e.target)
    $parent = $(e.target).parents("li")
    if $e.data("toggled")
      $parent.find("[data-more-placeholder]").show()
      $parent.find("[data-more]").hide()
    else
      $parent.find("[data-more-placeholder]").hide()
      $parent.find("[data-more]").show()
    text = $e.text()
    $e.text($e.data("alt"))
    $e.data("alt", text)
    $e.data("toggled", !$e.data("toggled"))
    @refreshTimeline()

  toggleFilter: (e) =>
    e.preventDefault()
    $e = $(e.target)
    $parent = $e.parent("li")
    $events = @timeline.find("[data-type=#{$e.data("type")}]")

    if $parent.hasClass("active")
      $events.addClass("hidden")

    else
      $events.removeClass("hidden")

    @refreshTimeline()
    $parent.toggleClass("active")

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
