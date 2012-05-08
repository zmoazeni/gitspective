(function() {
  var Event, Repo, User, hasMorePages,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(function() {
    return new App({
      el: $(".container")
    });
  });

  hasMorePages = function(meta) {
    return (meta["Link"] || []).filter(function(link) {
      if (link[1]["rel"] === "next") {
        return true;
      }
    }).length > 0;
  };

  User = (function(_super) {

    __extends(User, _super);

    User.name = 'User';

    function User() {
      this.created_at_date = __bind(this.created_at_date, this);
      return User.__super__.constructor.apply(this, arguments);
    }

    User.configure("User", "type", "url", "public_gists", "followers", "gravatar_id", "hireable", "avatar_url", "public_repos", "bio", "login", "email", "html_url", "created_at", "company", "blog", "location", "following", "name");

    User.prototype.created_at_date = function() {
      var sliced;
      sliced = this.created_at.slice(0, this.created_at.length - 1);
      return Date.parse(sliced).toString('MMMM d, yyyy');
    };

    return User;

  })(Spine.Model);

  Repo = (function(_super) {

    __extends(Repo, _super);

    Repo.name = 'Repo';

    function Repo() {
      return Repo.__super__.constructor.apply(this, arguments);
    }

    Repo.configure("Repo", "updated_at", "clone_url", "has_downloads", "watchers", "homepage", "git_url", "mirror_url", "fork", "ssh_url", "url", "has_wiki", "has_issues", "forks", "language", "size", "html_url", "private", "created_at", "name", "open_issues", "description", "svn_url", "pushed_at");

    Repo.fetch = function(user) {
      var fetchHelper,
        _this = this;
      this.deleteAll();
      fetchHelper = function(page) {
        console.log("Fetching repo page " + page);
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

    Event.fetchPages = function(user, callback, page) {
      var fetchHelper, max,
        _this = this;
      if (page == null) {
        page = 1;
      }
      max = page + 2;
      fetchHelper = function(currentPage, events, callback) {
        var url;
        console.log("Fetching event page " + currentPage);
        url = "https://api.github.com/users/" + user.login + "/events?page=" + currentPage + "&callback=?";
        return $.getJSON(url, function(response) {
          $.each(response.data, function(i, eventData) {
            return events.push(new Event(eventData));
          });
          if (currentPage < max && hasMorePages(response.meta)) {
            return fetchHelper(currentPage + 1, events, callback);
          } else {
            return callback([currentPage + 1, events]);
          }
        });
      };
      return fetchHelper(page, [], callback);
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
      "#content": "content"
    };

    App.prototype.events = {
      "submit form": "search"
    };

    function App() {
      this.search = __bind(this.search, this);

      this.fetchUser = __bind(this.fetchUser, this);

      this.navigateTo = __bind(this.navigateTo, this);

      this.renderUser = __bind(this.renderUser, this);

      var _this = this;
      App.__super__.constructor.apply(this, arguments);
      this.routes({
        "/": function() {
          _this.user = null;
          return _this.content.html(_this.view("index"));
        },
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

    App.prototype.renderUser = function(user) {
      var _this = this;
      Repo.fetch(user);
      this.content.html(this.view("show", {
        user: user
      }));
      this.page = 1;
      return Event.fetchPages(user, function(_arg) {
        var events, page;
        page = _arg[0], events = _arg[1];
        _this.page = page;
        return console.log(events);
      });
    };

    App.prototype.navigateTo = function(e) {
      e.preventDefault();
      return this.navigate($(e.target).attr("href"));
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

}).call(this);
