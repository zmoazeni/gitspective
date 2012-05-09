(function() {
  var Event, Repo, TimeStamps, User, hasMorePages, parseISODate,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  hasMorePages = function(meta) {
    return (meta["Link"] || []).filter(function(link) {
      if (link[1]["rel"] === "next") {
        return true;
      }
    }).length > 0;
  };

  parseISODate = function(raw) {
    return Date.parse(raw.slice(0, raw.length - 1));
  };

  TimeStamps = {
    created_at_date: function() {
      return parseISODate(this.created_at);
    },
    created_at_string: function() {
      return this.created_at_date().toString('MMMM d, yyyy');
    },
    created_at_short_string: function() {
      return this.created_at_date().toString('MMM d, yyyy');
    }
  };

  User = (function(_super) {

    __extends(User, _super);

    User.name = 'User';

    function User() {
      return User.__super__.constructor.apply(this, arguments);
    }

    User.configure("User", "type", "url", "public_gists", "followers", "gravatar_id", "hireable", "avatar_url", "public_repos", "bio", "login", "email", "html_url", "created_at", "company", "blog", "location", "following", "name");

    User.include(TimeStamps);

    return User;

  })(Spine.Model);

  Repo = (function(_super) {

    __extends(Repo, _super);

    Repo.name = 'Repo';

    function Repo() {
      return Repo.__super__.constructor.apply(this, arguments);
    }

    Repo.configure("Repo", "updated_at", "clone_url", "has_downloads", "watchers", "homepage", "git_url", "mirror_url", "fork", "ssh_url", "url", "has_wiki", "has_issues", "forks", "language", "size", "html_url", "private", "created_at", "name", "open_issues", "description", "svn_url", "pushed_at");

    Repo.include(TimeStamps);

    Repo.fetch = function(user) {
      var fetchHelper,
        _this = this;
      this.deleteAll();
      fetchHelper = function(page) {
        return $.getJSON("https://api.github.com/users/" + user.login + "/repos?page=" + page + "&callback=?", function(response) {
          $.each(response.data, function(i, repoData) {
            return Repo.create(repoData);
          });
          if (hasMorePages(response.meta)) {
            return fetchHelper(page + 1);
          }
        });
      };
      return fetchHelper(1);
    };

    return Repo;

  })(Spine.Model);

  Event = (function(_super) {

    __extends(Event, _super);

    Event.name = 'Event';

    function Event() {
      return Event.__super__.constructor.apply(this, arguments);
    }

    Event.configure("Event", "type", "public", "repo", "created_at", "actor", "id", "payload");

    Event.include(TimeStamps);

    Event.fetchPages = function(user, page, callback) {
      var fetchHelper, max,
        _this = this;
      max = page + 2;
      fetchHelper = function(currentPage, events, callback) {
        var url;
        url = "https://api.github.com/users/" + user.login + "/events?page=" + currentPage + "&callback=?";
        return $.getJSON(url, function(response) {
          $.each(response.data, function(i, eventData) {
            return events.push(new Event(eventData));
          });
          if (currentPage < max && hasMorePages(response.meta)) {
            return fetchHelper(currentPage + 1, events, callback);
          } else if (hasMorePages(response.meta)) {
            return callback([currentPage + 1, events]);
          } else {
            return callback([-1, events]);
          }
        });
      };
      return fetchHelper(page, [], callback);
    };

    Event.prototype.viewType = function() {
      var _ref;
      switch (this.type) {
        case "PullRequestReviewCommentEvent":
          return "pull_request_comment";
        case "IssueCommentEvent":
          if (this.payload.issue) {
            return "issue_comment";
          } else {
            return "skip";
          }
          break;
        case "IssuesEvent":
          if (this.payload.action === "opened") {
            return "issue";
          } else {
            return "skip";
          }
          break;
        case "CommitCommentEvent":
          if (this.payload.comment) {
            return "commit_comment";
          } else {
            return "skip";
          }
          break;
        case "ForkEvent":
          return "fork";
        case "FollowEvent":
          return "follow";
        case "PullRequestEvent":
          if (this.payload.action === "opened") {
            return "pull_request";
          } else {
            return "skip";
          }
          break;
        case "GistEvent":
          if (this.payload.action === "create") {
            return "gist";
          } else {
            return "skip";
          }
          break;
        case "CreateEvent":
          switch (this.payload.ref_type) {
            case "branch":
              if (this.payload.ref === "master") {
                return "skip";
              } else {
                return "branch";
              }
              break;
            default:
              return this.payload.ref_type;
          }
          break;
        case "PushEvent":
          if (((_ref = this.payload.commits) != null ? _ref.length : void 0) > 0) {
            return "push";
          } else {
            return "skip";
          }
          break;
        default:
          return "item";
      }
    };

    Event.prototype.viewInfo = function() {
      var commits, view,
        _this = this;
      view = this.viewType();
      switch (view) {
        case "item":
          return [
            view, {
              id: this.id,
              title: this.type,
              date: this.created_at_short_string()
            }
          ];
        case "gist":
          return [
            view, {
              id: this.id,
              url: this.payload.gist.html_url,
              date: this.created_at_short_string()
            }
          ];
        case "issue":
          return [
            view, {
              id: this.id,
              url: this.payload.issue.html_url,
              title: this.payload.issue.title,
              comment: this.payload.issue.body,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "issue_comment":
          return [
            view, {
              id: this.id,
              url: this.payload.issue.html_url,
              comment: this.payload.comment.body,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "pull_request_comment":
          return [
            view, {
              id: this.id,
              url: this.payload.comment._links.html.href,
              comment: this.payload.comment.body,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "commit_comment":
          return [
            view, {
              id: this.id,
              url: this.payload.comment.html_url,
              comment: this.payload.comment.body,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "pull_request":
          return [
            view, {
              id: this.id,
              url: this.payload.pull_request._links.html.href,
              comment: this.payload.pull_request.body,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "fork":
          return [
            view, {
              id: this.id,
              fork_url: this.payload.forkee.html_url,
              fork_name: "" + this.actor.login + "/" + this.payload.forkee.name,
              description: this.payload.forkee.description,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "follow":
          return [
            view, {
              id: this.id,
              url: this.payload.target.html_url,
              name: this.payload.target.name,
              gravatar: this.payload.target.avatar_url,
              date: this.created_at_short_string()
            }
          ];
        case "repository":
          return [
            view, {
              id: this.id,
              title: this.repo.name,
              date: this.created_at_short_string()
            }
          ];
        case "tag":
        case "branch":
          return [
            view, {
              id: this.id,
              name: this.payload.ref,
              url: "https://github.com/" + this.repo.name + "/tree/" + this.payload.ref,
              date: this.created_at_short_string(),
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name
            }
          ];
        case "push":
          commits = this.payload.commits.map(function(c, i) {
            return {
              commit: c.sha,
              commit_url: "https://github.com/" + _this.repo.name + "/commit/" + c.sha,
              hidden: i > 2
            };
          });
          return [
            view, {
              id: this.id,
              login: this.actor.login,
              num: this.payload.commits.length,
              commits: commits,
              repo_url: "https://github.com/" + this.repo.name,
              repo: this.repo.name,
              date: this.created_at_short_string(),
              more: this.payload.commits.length > 3
            }
          ];
        default:
          return [];
      }
    };

    return Event;

  })(Spine.Model);

  window.Github = {
    User: User,
    Repo: Repo,
    Event: Event
  };

  window.App = (function(_super) {

    __extends(App, _super);

    App.name = 'App';

    App.prototype.elements = {
      "#messages": "messages",
      "#content": "content",
      "#timeline": "timeline",
      "#joined": "joined",
      "#spinner": "spinner"
    };

    App.prototype.events = {
      "submit form": "search",
      "click [data-show-more]": "toggleMore",
      "click .nav-pills a": "toggleFilter"
    };

    function App() {
      this.search = __bind(this.search, this);

      this.fetchUser = __bind(this.fetchUser, this);

      this.toggleFilter = __bind(this.toggleFilter, this);

      this.toggleMore = __bind(this.toggleMore, this);

      this.navigateTo = __bind(this.navigateTo, this);

      this.stopSpinner = __bind(this.stopSpinner, this);

      this.startSpinner = __bind(this.startSpinner, this);

      this.fetchSomeEvents = __bind(this.fetchSomeEvents, this);

      this.renderUser = __bind(this.renderUser, this);

      this.renderIndex = __bind(this.renderIndex, this);

      var _this = this;
      App.__super__.constructor.apply(this, arguments);
      this.routes({
        "/": this.renderIndex,
        "/gitspective/": this.renderIndex,
        "/timeline/:user": function(params) {
          if (_this.user) {
            return _this.renderUser(_this.user);
          } else {
            return _this.fetchUser(params.user, _this.renderUser);
          }
        }
      });
      Spine.Route.setup();
    }

    App.prototype.renderIndex = function() {
      this.user = null;
      return this.content.html(this.view("index"));
    };

    App.prototype.renderUser = function(user) {
      Repo.fetch(user);
      this.content.html(this.view("show", {
        user: user
      }));
      this.content.find("#timeline").append(this.view("joined", {
        user: user
      }));
      this.refreshElements();
      this.timeline.masonry({
        itemSelector: "#timeline li:not(.hidden)"
      });
      this.page = 1;
      return this.fetchSomeEvents();
    };

    App.prototype.fetchSomeEvents = function() {
      var _this = this;
      this.startSpinner();
      return Event.fetchPages(this.user, this.page, function(_arg) {
        var events, page, sorted;
        page = _arg[0], events = _arg[1];
        _this.page = page;
        events.forEach(function(event) {
          return event.save();
        });
        sorted = events.sort(function(a, b) {
          return b.created_at_date() - a.created_at_date();
        });
        _this.stopSpinner();
        return _this.appendEvents(sorted);
      });
    };

    App.prototype.startSpinner = function() {
      this.joined.before(this.view("spinner"));
      this.refreshElements();
      this.refreshTimeline();
      return new Spinner().spin(this.spinner[0]);
    };

    App.prototype.stopSpinner = function() {
      return this.spinner.remove();
    };

    App.prototype.appendEvents = function(events) {
      var _this = this;
      events.forEach(function(event) {
        var html, viewArgs, viewType, _ref;
        _ref = event.viewInfo(), viewType = _ref[0], viewArgs = _ref[1];
        if (viewType) {
          html = _this.view(viewType, viewArgs);
          if (_this.isHidden(viewType)) {
            html = $(html).addClass("hidden");
          }
          return _this.joined.before(html);
        }
      });
      this.refreshTimeline();
      return this.attachWaypoint();
    };

    App.prototype.isHidden = function(type) {
      var $parent;
      $parent = this.content.find(".nav-pills [data-type=" + type + "]").parent("li");
      return $parent[0] && !$parent.hasClass("active");
    };

    App.prototype.attachWaypoint = function() {
      var _this = this;
      if (this.page !== -1) {
        return this.joined.waypoint(function(e, direction) {
          if (direction === "down") {
            return _this.fetchSomeEvents();
          }
        }, {
          offset: 'bottom-in-view',
          triggerOnce: true
        });
      }
    };

    App.prototype.placeArrows = function() {
      var min_max;
      min_max = $.unique(this.timeline.find(".item").map(function(e) {
        return parseInt($(this).css("left"));
      })).sort();
      return this.timeline.find(".item").each(function() {
        var $e;
        $e = $(this);
        if (parseInt($e.css("left")) === min_max[0]) {
          return $e.attr("data-align", "l");
        } else {
          return $e.attr("data-align", "r");
        }
      });
    };

    App.prototype.refreshTimeline = function() {
      this.timeline.masonry("reload");
      return this.placeArrows();
    };

    App.prototype.navigateTo = function(e) {
      e.preventDefault();
      return this.navigate($(e.target).attr("href"));
    };

    App.prototype.toggleMore = function(e) {
      var $e, $parent, text;
      e.preventDefault();
      $e = $(e.target);
      $parent = $(e.target).parents("li");
      if ($e.data("toggled")) {
        $parent.find("[data-more-placeholder]").show();
        $parent.find("[data-more]").hide();
      } else {
        $parent.find("[data-more-placeholder]").hide();
        $parent.find("[data-more]").show();
      }
      text = $e.text();
      $e.text($e.data("alt"));
      $e.data("alt", text);
      $e.data("toggled", !$e.data("toggled"));
      return this.refreshTimeline();
    };

    App.prototype.toggleFilter = function(e) {
      var $e, $events, $parent;
      e.preventDefault();
      $e = $(e.target);
      $parent = $e.parent("li");
      $events = this.timeline.find("[data-type=" + ($e.data("type")) + "]");
      if ($parent.hasClass("active")) {
        $events.addClass("hidden");
      } else {
        $events.removeClass("hidden");
      }
      this.refreshTimeline();
      return $parent.toggleClass("active");
    };

    App.prototype.fetchUser = function(username, callback) {
      var _this = this;
      return $.getJSON("https://api.github.com/users/" + username + "?callback=?", function(response) {
        if (response.meta.status === 404) {
          return _this.messages.html(_this.view("error", {
            message: "User not found"
          }));
        } else if (response.meta["X-RateLimit-Remaining"] === "0") {
          return _this.messages.html(_this.view("error", {
            message: "Your IP has hit your Github API limit. Please wait for it to reset"
          }));
        } else {
          _this.messages.html("");
          _this.user = new User(response.data);
          return callback(_this.user);
        }
      }).error(function() {
        return _this.messages.html(_this.view("error", {
          message: "Something went wrong with the API"
        }));
      });
    };

    App.prototype.search = function(e) {
      var $form, username,
        _this = this;
      e.preventDefault();
      $form = $(e.target);
      username = $form.find("input").val();
      if ($.isEmptyObject(username)) {
        return this.messages.html(this.view("error", {
          message: "Username is required"
        }));
      } else {
        return this.fetchUser(username, function() {
          return _this.navigate("/timeline/" + username);
        });
      }
    };

    return App;

  })(Spine.Controller);

  $(function() {
    return window.app = new App({
      el: $(".container")
    });
  });

}).call(this);
