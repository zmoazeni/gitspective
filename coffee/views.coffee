Spine.Controller.include
  view: (name, context) ->
    if views[name]
      Mustache.render(views[name], context)
    else
      throw "Can't find view #{name}"

window.views = {}

views["error"] = """
<div class="alert alert-error span6">
  <a class="close" data-dismiss="alert" href="#">x</a>
  {{message}}
</div>
"""

views["index"] = """
<form class="form-inline">
  <input type="text" id="username-search" class="input-xlarge offset3" placeholder="Enter username...">
  <button type="submit" class="btn btn-large">gitspect!</button>
</form>
"""


views["show"] = """
<header class="page-header well row">
  <div class="span1"><img src="{{user.avatar_url}}" alt="image of {{user.name}}"/></div>
  <div class="span5">
    <h1>{{user.name}} <a href="{{user.html_url}}">{{user.login}}</a></h1>
    <ul>
      {{#user.email}}
        <li>Email: <a href="mailto:{{user.email}}">{{user.email}}</a></li>
      {{/user.email}}

      {{#user.company}}
        <li>Company: {{user.company}}</li>
      {{/user.company}}

      {{#user.created_at}}
        <li>Joined: {{user.created_at_string}}</li>
      {{/user.created_at}}
    </ul>
  </div>
</header>

<div id="timeline-container" class="row offset1">
  <div id="timeline-line">
  </div>

  <ol id="timeline">
  </ol>
</div>
"""

views["item"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  {{title}}
  <span class="date">{{date}}</span>
</li>
"""

views["push"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Pushed {{num}} commit(s) to <a href="repo_url">{{repo}}</a></h1>
  <ol class="commits">
    {{#commits}}
    <li {{#hidden}}style="display:none;" data-more{{/hidden}}><a href="{{commit_url}}">{{commit}}</a></li>
    {{/commits}}

    {{#more}}
      <li data-more-placeholder>...</li>
    {{/more}}
  </ol>
  {{#more}}
  <div><a href="#" data-show-more data-alt="less" data-toggled=false>more</a></div>
  {{/more}}
  <span class="date">{{date}}</span>
</li>
"""

views["repository"] = """
<li class="prominent" data-id="{{id}}">
  <div class="well">Created: {{title}} <div>{{date}}</div></div>
</li>
"""

views["branch"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Branched <a href="{{url}}">{{name}}</a> from <a href="{{repo_url}}">{{repo}}</a></h1>
  <span class="date">{{date}}</span>
</li>
"""

views["tag"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Tagged <a href="{{url}}">{{name}}</a> from <a href="{{repo_url}}">{{repo}}</a></h1>
  <span class="date">{{date}}</span>
</li>
"""

views["pull_request_comment"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Commented on a <a href="{{url}}">pull request</a> for <a href="{{repo_url}}">{{repo}}</a></h1>
  <blockquote>{{comment}}</blockquote>
  <span class="date">{{date}}</span>
</li>
"""

views["issue"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Opened an <a href="{{url}}">issue</a> on <a href="{{repo_url}}">{{repo}}</a></h1>
  <blockquote>{{title}}</blockquote>
  <blockquote>{{comment}}</blockquote>
  <span class="date">{{date}}</span>
</li>
"""

views["gist"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Created a <a href="{{url}}">gist</a></h1>
  <span class="date">{{date}}</span>
</li>
"""

views["issue_comment"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Commented on an <a href="{{url}}">issue</a> on <a href="{{repo_url}}">{{repo}}</a></h1>
  <blockquote>{{comment}}</blockquote>
  <span class="date">{{date}}</span>
</li>
"""

views["commit_comment"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Commented on a <a href="{{url}}">commit</a> on <a href="{{repo_url}}">{{repo}}</a></h1>
  <blockquote>{{comment}}</blockquote>
  <span class="date">{{date}}</span>
</li>
"""

views["pull_request"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Opened a <a href="{{url}}">pull request</a> for <a href="{{repo_url}}">{{repo}}</a></h1>
  <blockquote>{{comment}}</blockquote>
  <span class="date">{{date}}</span>
</li>
"""

views["fork"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Forked <a href="{{fork_url}}">{{fork_name}}</a> from <a href="{{repo_url}}">{{repo}}</a></h1>
  {{description}}
  <span class="date">{{date}}</span>
</li>
"""

views["follow"] = """
<li class="item" data-id="{{id}}">
  <span class="corner"></span>
  <h1>Started following <a href="{{url}}">{{name}}</a></h1>
  {{#gravatar}}
    <div><img class="gravatar" src="{{gravatar}}" /></div>
  {{/gravatar}}
  <span class="date">{{date}}</span>
</li>
"""

views["joined"] = """
<li id="joined" class="prominent"><div class="well">Joined: {{user.created_at_string}}</div></li>
"""

views["static"] = """
    <header>
      <h1><img src="https://secure.gravatar.com/avatar/d46a89672353a9c5258e187c8095ea40?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-140.png" alt="zmoazeni's gravatar" /> Zach Moazeni (zmoazeni)</h1>
      <ul>
        <li>blog: http://collectiveidea.com</li>
        <li>email: zach.moazeni@gmail.com</li>
      </ul>
    </header>
    <div id="recent-repos">
      <h1>Recent Repos</h1>
      <ol>
        <li><a href="https://github.com/zmoazeni/my_styles.git">my_styles</a> - My custom generators</li>
        <li><a href="https://github.com/zmoazeni/my_styles.git">harvested</a> - A Ruby Wrapper for the Harvest API http://www.getharvest.com/</li>
        <li><a href="https://github.com/zmoazeni/my_styles.git">karkeze</a> - Experimenting with Haskell and Full Text Search</li>
      </ol>
    </div>

    <div id="recent-gists">
      <h1>Recent Gists</h1>
      <ol>
        <li><a href="">https://api.github.com/gists/2550988</a></li>
        <li><a href="">https://api.github.com/gists/2512012</a></li>
        <li><a href="">https://api.github.com/gists/2550988</a></li>
      </ol>
    </div>

    <section>
      <div id="timeline-line">
      </div>

      <ol id="timeline">
        <li style="height: 80px"><span class="corner"></span>foo</li>
        <li><span class="corner"></span>bar</li>
        <li><span class="corner"></span>foo asdlfj asdlfkj asdlfkj a alfkj aslfkj asf
          ajf
          a dflaskjdf alsdkfj aslfkj asdlfkj aslfkajs flaksjdf alskjfaslkfj aslfkj aslfkj aslfkjsa flkasjflaskjf aslkjf salkfj aslkfj aslfkjas lfkjsa lfakjs flksaj fl</li>
        <li><span class="corner"></span>bar</li>
        <li><span class="corner"></span>foo</li>
        <li><span class="corner"></span>bar</li>
        <li><span class="corner"></span>foo</li>
        <li><span class="corner"></span>bar</li>
      </ol>
    </section>
"""