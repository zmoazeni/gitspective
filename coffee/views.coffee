window.views = {}

views["error"] = """
<div class="alert alert-error">
  <a class="close" data-dismiss="alert" href="#">x</a>
  {{message}}
</div>
"""

views["index"] = """
<form class="well form-inline" novalidate>
  <div class="messages span6 offset2">
  </div>
  <input type="text" id="username-search" class="input-xlarge offset3" placeholder="Enter username..." required>
  <button type="submit" class="btn btn-large">gitspect!</button>
</form>
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