---
layout: default
title: playlists
permalink: /playlists/
nav: true
nav_order: 2
---

<div class="playlists-page">
  <div class="playlists-header">
    <h1 class="playlists-title">Playlists</h1>
    <p class="playlists-lead">Curated reading lists — posts grouped in the order they're best read.</p>
  </div>

  <div class="playlists-grid">
    {% for playlist in site.playlists %}
      <a href="{{ playlist.url | relative_url }}" class="playlist-card">
        <div class="playlist-card-inner">
          <div class="playlist-card-top">
            <h2 class="playlist-card-title">{{ playlist.title }}</h2>
            <span class="playlist-card-count">{{ playlist.posts | size }} posts</span>
          </div>
          {% if playlist.description %}
            <p class="playlist-card-desc">{{ playlist.description }}</p>
          {% endif %}
          <ol class="playlist-card-preview">
            {% for item in playlist.posts limit: 4 %}
              {% assign idx = forloop.index %}
              <li>
                <span class="preview-num">{% if idx < 10 %}0{{ idx }}{% else %}{{ idx }}{% endif %}</span>
                <span class="preview-title">{{ item.title }}</span>
              </li>
            {% endfor %}
            {% if playlist.posts.size > 4 %}
              <li class="preview-more">+{{ playlist.posts.size | minus: 4 }} more</li>
            {% endif %}
          </ol>
        </div>
        <div class="playlist-card-footer">
          Read playlist →
        </div>
      </a>
    {% endfor %}
  </div>
</div>
