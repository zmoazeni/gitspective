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
<div class="hero-unit">
  <h1 class="offset1">A different perspective of a Github User</h1>

<form class="form-inline">
  <input type="text" id="username-search" class="input-xlarge offset3" placeholder="Enter username...">
  <button type="submit" class="btn btn-large btn-primary">gitspect!</button>
</form>
</div>
"""


views["show"] = """
<header class="page-header well row">
  <div class="span1 offset3"><img src="{{user.avatar_url}}" alt="image of {{user.name}}"/></div>
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

views["spinner"] = """
<li id="spinner" class="prominent"></li>
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
