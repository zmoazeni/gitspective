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

  views["index"] = "<form class=\"form-inline\">\n  <input type=\"text\" id=\"username-search\" class=\"input-xlarge offset3\" placeholder=\"Enter username...\">\n  <button type=\"submit\" class=\"btn btn-large\">gitspect!</button>\n</form>";

  views["show"] = "<header class=\"page-header well row\">\n  <div class=\"span1\"><img src=\"{{user.avatar_url}}\" alt=\"image of {{user.name}}\"/></div>\n  <div class=\"span5\">\n    <h1>{{user.name}} <a href=\"{{user.html_url}}\">{{user.login}}</a></h1>\n    <ul>\n      {{#user.email}}\n        <li>Email: <a href=\"mailto:{{user.email}}\">{{user.email}}</a></li>\n      {{/user.email}}\n\n      {{#user.company}}\n        <li>Company: {{user.company}}</li>\n      {{/user.company}}\n\n      {{#user.created_at}}\n        <li>Joined: {{user.created_at_string}}</li>\n      {{/user.created_at}}\n    </ul>\n  </div>\n</header>\n\n<div id=\"timeline-container\" class=\"row offset1\">\n  <div id=\"timeline-line\">\n  </div>\n\n  <ol id=\"timeline\">\n  </ol>\n</div>";

  views["item"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  {{title}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["push"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Pushed {{num}} commit(s) to <a href=\"repo_url\">{{repo}}</a></h1>\n  <ol class=\"commits\">\n    {{#commits}}\n    <li {{#hidden}}style=\"display:none;\" data-more{{/hidden}}><a href=\"{{commit_url}}\">{{commit}}</a></li>\n    {{/commits}}\n\n    {{#more}}\n      <li data-more-placeholder>...</li>\n    {{/more}}\n  </ol>\n  {{#more}}\n  <div><a href=\"#\" data-show-more data-alt=\"less\" data-toggled=false>more</a></div>\n  {{/more}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["repository"] = "<li class=\"prominent\" data-id=\"{{id}}\">\n  <div class=\"well\">Created: {{title}} <div>{{date}}</div></div>\n</li>";

  views["branch"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Branched <a href=\"{{url}}\">{{name}}</a> from <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["tag"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Tagged <a href=\"{{url}}\">{{name}}</a> from <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["pull_request_comment"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Commented on a <a href=\"{{url}}\">pull request</a> for <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["issue_comment"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Commented on an <a href=\"{{url}}\">issue</a> on <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["commit_comment"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Commented on a <a href=\"{{url}}\">commit</a> on <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["pull_request"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Opened a <a href=\"{{url}}\">pull request</a> for <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  <blockquote>{{comment}}</blockquote>\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["fork"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Forked <a href=\"{{fork_url}}\">{{fork_name}}</a> from <a href=\"{{repo_url}}\">{{repo}}</a></h1>\n  {{description}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["follow"] = "<li class=\"item\" data-id=\"{{id}}\">\n  <span class=\"corner\"></span>\n  <h1>Started following <a href=\"{{url}}\">{{name}}</a></h1>\n  {{#gravatar}}\n    <div><img class=\"gravatar\" src=\"{{gravatar}}\" /></div>\n  {{/gravatar}}\n  <span class=\"date\">{{date}}</span>\n</li>";

  views["joined"] = "<li id=\"joined\" class=\"prominent\"><div class=\"well\">Joined: {{user.created_at_string}}</div></li>";

  views["static"] = "<header>\n  <h1><img src=\"https://secure.gravatar.com/avatar/d46a89672353a9c5258e187c8095ea40?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png\" alt=\"zmoazeni's gravatar\" /> Zach Moazeni (zmoazeni)</h1>\n  <ul>\n    <li>blog: http://collectiveidea.com</li>\n    <li>email: zach.moazeni@gmail.com</li>\n  </ul>\n</header>\n<div id=\"recent-repos\">\n  <h1>Recent Repos</h1>\n  <ol>\n    <li><a href=\"https://github.com/zmoazeni/my_styles.git\">my_styles</a> - My custom generators</li>\n    <li><a href=\"https://github.com/zmoazeni/my_styles.git\">harvested</a> - A Ruby Wrapper for the Harvest API http://www.getharvest.com/</li>\n    <li><a href=\"https://github.com/zmoazeni/my_styles.git\">karkeze</a> - Experimenting with Haskell and Full Text Search</li>\n  </ol>\n</div>\n\n<div id=\"recent-gists\">\n  <h1>Recent Gists</h1>\n  <ol>\n    <li><a href=\"\">https://api.github.com/gists/2550988</a></li>\n    <li><a href=\"\">https://api.github.com/gists/2512012</a></li>\n    <li><a href=\"\">https://api.github.com/gists/2550988</a></li>\n  </ol>\n</div>\n\n<section>\n  <div id=\"timeline-line\">\n  </div>\n\n  <ol id=\"timeline\">\n    <li style=\"height: 80px\"><span class=\"corner\"></span>foo</li>\n    <li><span class=\"corner\"></span>bar</li>\n    <li><span class=\"corner\"></span>foo asdlfj asdlfkj asdlfkj a alfkj aslfkj asf\n      ajf\n      a dflaskjdf alsdkfj aslfkj asdlfkj aslfkajs flaksjdf alskjfaslkfj aslfkj aslfkj aslfkjsa flkasjflaskjf aslkjf salkfj aslkfj aslfkjas lfkjsa lfakjs flksaj fl</li>\n    <li><span class=\"corner\"></span>bar</li>\n    <li><span class=\"corner\"></span>foo</li>\n    <li><span class=\"corner\"></span>bar</li>\n    <li><span class=\"corner\"></span>foo</li>\n    <li><span class=\"corner\"></span>bar</li>\n  </ol>\n</section>";

}).call(this);
