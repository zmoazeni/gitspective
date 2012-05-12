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

    Event.configure("Event", "type", "public", "repo", "created_at", "actor", "id", "payload", "commits");

    Event.include(TimeStamps);

    Event.fetchPages = function(user, page, callback) {
      var fetchHelper, max,
        _this = this;
      max = page + 2;
      fetchHelper = function(currentPage, events, callback) {
        var url;
        url = "https://api.github.com/users/" + user.login + "/events?page=" + currentPage + "&callback=?";
        return $.getJSON(url, function(response) {
          var consolidated;
          $.each(response.data, function(i, eventData) {
            return events.push(new Event(eventData));
          });
          if (currentPage < max && hasMorePages(response.meta)) {
            return fetchHelper(currentPage + 1, events, callback);
          } else {
            consolidated = _this.consolidateEvents(events);
            if (hasMorePages(response.meta)) {
              return callback([currentPage + 1, consolidated]);
            } else {
              return callback([-1, consolidated]);
            }
          }
        });
      };
      return fetchHelper(page, [], callback);
    };

    Event.consolidateEvents = function(events) {
      var e, groups, keptEvent, otherEvents, pushEvents, _, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2;
      _ref = [[], []], otherEvents = _ref[0], pushEvents = _ref[1];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        e = events[_i];
        if (e.type === "PushEvent") {
          pushEvents.push(e);
        } else {
          otherEvents.push(e);
        }
      }
      groups = {};
      for (_j = 0, _len1 = pushEvents.length; _j < _len1; _j++) {
        e = pushEvents[_j];
        groups[_name = e.groupKey()] || (groups[_name] = []);
        groups[e.groupKey()].push(e);
      }
      for (_ in groups) {
        events = groups[_];
        keptEvent = events.shift();
        keptEvent.addCommits((_ref1 = keptEvent.payload) != null ? _ref1.commits : void 0);
        for (_k = 0, _len2 = events.length; _k < _len2; _k++) {
          e = events[_k];
          keptEvent.addCommits((_ref2 = e.payload) != null ? _ref2.commits : void 0);
        }
        otherEvents.push(keptEvent);
      }
      return otherEvents;
    };

    function Event(args) {
      Event.__super__.constructor.call(this, args);
      this.commits || (this.commits = []);
    }

    Event.prototype.groupKey = function() {
      return "" + this.repo.name + "-" + (this.created_at_short_string());
    };

    Event.prototype.addCommits = function(newCommits) {
      var _this = this;
      if (newCommits) {
        return newCommits.forEach(function(e) {
          return _this.commits.push(e);
        });
      }
    };

    Event.prototype.viewType = function() {
      var defaultTypes, view;
      defaultTypes = {
        ForkEvent: "fork",
        FollowEvent: "follow",
        WatchEvent: "watch",
        PublicEvent: "public",
        DeleteEvent: "skip",
        MemberEvent: "skip",
        DownloadEvent: "skip",
        TeamAddEvent: "skip",
        ForkApplyEvent: "skip"
      };
      if (defaultTypes[this.type]) {
        return defaultTypes[this.type];
      }
      view = (function() {
        var _ref, _ref1;
        switch (this.type) {
          case "PullRequestReviewCommentEvent":
            if (this.payload.comment._links) {
              return "pull_request_comment";
            }
            break;
          case "IssueCommentEvent":
            if (this.payload.issue) {
              return "issue_comment";
            }
            break;
          case "IssuesEvent":
            if (this.payload.action === "opened") {
              return "issue";
            }
            break;
          case "CommitCommentEvent":
            if (this.payload.comment) {
              return "commit_comment";
            }
            break;
          case "PullRequestEvent":
            if (this.payload.action === "opened" && this.payload.pull_request._links) {
              return "pull_request";
            }
            break;
          case "GistEvent":
            if (this.payload.action === "create" && this.payload.gist) {
              return "gist";
            }
            break;
          case "CreateEvent":
            switch (this.payload.ref_type) {
              case "branch":
                if (this.payload.ref !== "master") {
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
            }
            break;
          case "GollumEvent":
            if (((_ref1 = this.payload.pages) != null ? _ref1.length : void 0) > 0) {
              return "gollum";
            }
            break;
          default:
            return "item";
        }
      }).call(this);
      return view || "skip";
    };

    Event.prototype.viewInfo = function() {
      var commits, context, pages, view;
      view = this.viewType();
      context = (function() {
        var _this = this;
        switch (view) {
          case "repository":
          case "watch":
          case "public":
            return {};
          case "item":
            return {
              title: this.type
            };
          case "gist":
            return {
              url: this.payload.gist.html_url
            };
          case "issue":
            return {
              url: this.payload.issue.html_url,
              title: this.payload.issue.title,
              comment: this.payload.issue.body
            };
          case "issue_comment":
            return {
              url: this.payload.issue.html_url,
              comment: this.payload.comment.body,
              type: "comment"
            };
          case "commit_comment":
            return {
              url: this.payload.comment.html_url,
              comment: this.payload.comment.body,
              type: "comment"
            };
          case "pull_request_comment":
            return {
              url: this.payload.comment._links.html.href,
              comment: this.payload.comment.body,
              type: "comment"
            };
          case "pull_request":
            return {
              url: this.payload.pull_request._links.html.href,
              comment: this.payload.pull_request.body,
              type: "issue"
            };
          case "fork":
            return {
              fork_url: this.payload.forkee.html_url,
              fork_name: "" + this.actor.login + "/" + this.payload.forkee.name,
              description: this.payload.forkee.description
            };
          case "follow":
            return {
              url: this.payload.target.html_url || ("https://github.com/" + this.payload.target.login),
              name: this.payload.target.name || this.payload.target.login,
              gravatar: this.payload.target.avatar_url,
              type: "watch"
            };
          case "tag":
          case "branch":
            return {
              name: this.payload.ref,
              url: "https://github.com/" + this.repo.name + "/tree/" + this.payload.ref,
              type: "branch"
            };
          case "push":
            commits = this.commits.map(function(c, i) {
              return {
                commit: c.sha.slice(0, 5),
                commit_url: "https://github.com/" + _this.repo.name + "/commit/" + c.sha,
                message: c.message.split("\n")[0],
                hidden: i > 2
              };
            });
            return {
              login: this.actor.login,
              num: commits.length,
              commits: commits,
              more: commits.length > 3
            };
          case "gollum":
            pages = this.payload.pages.map(function(p, i) {
              return {
                title: p.title,
                url: p.html_url,
                action: p.action,
                hidden: i > 2
              };
            });
            return {
              pages: pages,
              num: pages.length,
              more: pages.length > 3,
              type: "push"
            };
          default:
            return null;
        }
      }).call(this);
      if (context) {
        return [
          view, $.extend({
            id: this.id,
            repo: this.repo.name,
            repo_url: "https://github.com/" + this.repo.name,
            date: this.created_at_short_string(),
            type: view
          }, context)
        ];
      } else {
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
          if (_this.isHidden(viewArgs["type"])) {
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
