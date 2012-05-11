(function() {

  Spine.Controller.include({
    view: function(name, context) {
      if (views[name]) {
        return Mustache.render(views[name], context);
      } else {
        throw "Can't find view " + name;
      }
    }
  });

  window.views = {};

  views["error"] = "<div class=\"alert alert-error span6\">\n  <a class=\"close\" data-dismiss=\"alert\" href=\"#\">x</a>\n  {{message}}\n</div>";

  views["index"] = "<div class=\"hero-unit\">\n  <h1 class=\"offset1\">A different perspective of a Github User</h1>\n\n<form class=\"form-inline\">\n  <input type=\"text\" id=\"username-search\" class=\"input-xlarge offset3\" placeholder=\"Enter username...\">\n  <button type=\"submit\" class=\"btn btn-large btn-primary\">gitspect!</button>\n</form>\n</div>";

  views["show"] = "<header class=\"page-header well row\">\n  <div class=\"span1 offset3\"><img src=\"{{user.avatar_url}}\" alt=\"image of {{user.name}}\"/></div>\n  <div class=\"span5\">\n    <h1>{{user.name}} <a href=\"{{user.html_url}}\">{{user.login}}</a></h1>\n    <ul>\n      {{#user.email}}\n        <li>Email: <a href=\"mailto:{{user.email}}\">{{user.email}}</a></li>\n      {{/user.email}}\n\n      {{#user.company}}\n        <li>Company: {{user.company}}</li>\n      {{/user.company}}\n\n      {{#user.created_at}}\n        <li>Joined: {{user.created_at_string}}</li>\n      {{/user.created_at}}\n    </ul>\n  </div>\n\n  <a href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-count=\"none\" data-text=\"My gitspective: \">Tweet</a>\n  <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=\"//platform.twitter.com/widgets.js\";fjs.parentNode.insertBefore(js,fjs);}}(document,\"script\",\"twitter-wjs\");</script>\n</header>\n\n<div class\"row\">\n  <ul class=\"nav nav-pills\">\n    <li class=\"active\"><a href=\"#\" data-type=\"push\">Push</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"fork\">Fork</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"gist\">Gist</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"branch\">Branch</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"watch\">Follow</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"comment\">Comment</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"issue\">Issue</a></li>\n    <li class=\"active\"><a href=\"#\" data-type=\"item\">Unstyled</a></li>\n  </ul>\n</div>\n\n<div id=\"timeline-container\" class=\"row offset1\">\n  <div id=\"timeline-line\">\n  </div>\n\n  <ol id=\"timeline\">\n  </ol>\n</div>";

  views["spinner"] = "<li id=\"spinner\" class=\"prominent\"></li>";

  views["item"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  {{title}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["push"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Pushed {{num}} commit(s) to <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <ol class=\"commits\">\n    {{#commits}}\n    <li {{#hidden}}style=\"display:none;\" data-more{{/hidden}}><a href=\"{{commit_url}}\">{{commit}} - {{message}}</a></li>\n    {{/commits}}\n\n    {{#more}}\n      <li data-more-placeholder>...</li>\n    {{/more}}\n  </ol>\n  {{#more}}\n  <div><a href=\"#\" data-show-more data-alt=\"less\" data-toggled=false>more</a></div>\n  {{/more}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["gollum"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Updated {{num}} page(s) for <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <ol class=\"commits\">\n    {{#pages}}\n    <li {{#hidden}}style=\"display:none;\" data-more{{/hidden}}>{{action}}: <a href=\"{{url}}\">{{title}}</a></li>\n    {{/pages}}\n\n    {{#more}}\n      <li data-more-placeholder>...</li>\n    {{/more}}\n  </ol>\n  {{#more}}\n  <div><a href=\"#\" data-show-more data-alt=\"less\" data-toggled=false>more</a></div>\n  {{/more}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["repository"] = "<li class=\"prominent\" data-id=\"{{id}}\">\n  <div class=\"well\">Created: <a href=\"{{repo_url}}\">{{repo}}</a> <div>{{date}}</div></div>\n</li>";

  views["public"] = "<li class=\"prominent\" data-id=\"{{id}}\">\n  <div class=\"well\">Made public: <a href=\"{{repo_url}}\">{{repo}}</a> <div>{{date}}</div></div>\n</li>";

  views["watch"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Began watching <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["branch"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Branched <a href=\"{{url}}\">{{name}}</a> from <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["tag"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Tagged <a href=\"{{url}}\">{{name}}</a> from <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["pull_request_comment"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Commented on a <a href=\"{{url}}\">pull request</a> for <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["issue"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Opened an <a href=\"{{url}}\">issue</a> on <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{title}}</blockquote>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["gist"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Created a <a href=\"{{url}}\">gist</a></h1>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["issue_comment"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Commented on an <a href=\"{{url}}\">issue</a> on <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["commit_comment"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Commented on a <a href=\"{{url}}\">commit</a> on <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["pull_request"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Opened a <a href=\"{{url}}\">pull request</a> for <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["fork"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Forked <a href=\"{{fork_url}}\">{{fork_name}}</a> from <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  {{description}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["follow"] = "<li class=\"item\" data-id=\"{{id}}\" data-type=\"{{type}}\">\n  <span class=\"corner\"></span>\n  <h1>Started following <a href=\"{{url}}\">{{name}}</a></h1>\n  {{#gravatar}}\n    <div><img class=\"gravatar\" src=\"{{gravatar}}\" /></div>\n  {{/gravatar}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["joined"] = "<li id=\"joined\" class=\"prominent\"><div class=\"well\">Joined: {{user.created_at_string}}</div></li>";

}).call(this);
