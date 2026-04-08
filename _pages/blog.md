---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 10
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="neo-blog-page">

  <div class="neo-blog-header">
    <p class="neo-blog-eyebrow">KOHSHEEN TIKU</p>
    <h1 class="neo-blog-title">Blogs</h1>
  </div>

  <hr class="neo-blog-divider">

  <div class="neo-blog-list">
    {% if page.pagination.enabled %}
      {% assign postlist = paginator.posts %}
    {% else %}
      {% assign postlist = site.posts %}
    {% endif %}

    {% for post in postlist %}
      {% if post.external_source == blank %}
        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% else %}
        {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
      {% endif %}

      <article class="neo-post-card">
        <div class="neo-post-card-inner">
          <p class="neo-post-kicker">ARTICLE &nbsp;&middot;&nbsp; {{ read_time }} MIN READ &nbsp;&middot;&nbsp; {{ post.date | date: '%B %d, %Y' | upcase }}</p>

          <h2 class="neo-post-card-title">
            {% if post.redirect == blank %}
              <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            {% elsif post.redirect contains '://' %}
              <a href="{{ post.redirect }}" target="_blank">{{ post.title }} <svg width="0.75em" height="0.75em" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9"/></svg></a>
            {% else %}
              <a href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
            {% endif %}
          </h2>

          {% if post.description %}
            <p class="neo-post-card-desc">{{ post.description }}</p>
          {% endif %}

          <div class="neo-post-card-footer">
            <span class="neo-post-card-author">
              {% if post.author %}{{ post.author }}{% else %}Kohsheen Tiku{% endif %}
            </span>
            <a href="{{ post.url | relative_url }}" class="neo-post-read-link">Read article &rarr;</a>
          </div>
        </div>
      </article>
    {% endfor %}
  </div>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}

</div>
