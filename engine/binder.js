/**
 * Binds data/sample-resume.json into the DOM via data-cv* attributes.
 */
(function (global) {
  function getPath(obj, path) {
    if (!path) return '';
    return path.split('.').reduce(function (o, k) {
      return o != null && o[k] !== undefined ? o[k] : null;
    }, obj);
  }

  function resolveBaseUrl() {
    var s = document.querySelector('script[data-resume-base]');
    if (s && s.getAttribute('data-resume-base')) {
      return s.getAttribute('data-resume-base').replace(/\/?$/, '/');
    }
    var p = window.location.pathname || '';
    if (p.indexOf('/templates/') !== -1) return '../';
    return './';
  }

  function cloneItem(tpl, item) {
    var node = tpl.cloneNode(true);
    node.querySelectorAll('[data-cv-field]').forEach(function (el) {
      var key = el.getAttribute('data-cv-field');
      var v = item[key];
      if (v === undefined || v === null) return;
      if (el.tagName === 'A') {
        el.setAttribute('href', String(v));
        el.textContent = String(v);
      } else {
        el.textContent = v;
      }
    });
    node.querySelectorAll('[data-cv-each]').forEach(function (eachEl) {
      var key = eachEl.getAttribute('data-cv-each');
      var arr = item[key];
      var liTpl = eachEl.firstElementChild;
      if (!arr || !liTpl) return;
      eachEl.innerHTML = '';
      arr.forEach(function (text) {
        var li = liTpl.cloneNode(true);
        li.textContent = text;
        eachEl.appendChild(li);
      });
    });
    node.querySelectorAll('[data-dots]').forEach(function (el) {
      var n = item.filled;
      if (typeof n !== 'number') return;
      el.innerHTML = '';
      for (var i = 1; i <= 5; i++) {
        var span = document.createElement('span');
        span.className = 'dot' + (i <= n ? ' filled' : '');
        el.appendChild(span);
      }
    });
    node.querySelectorAll('[data-bar-fill]').forEach(function (el) {
      var n = item.filled;
      if (typeof n !== 'number') return;
      el.innerHTML = '';
      for (var i = 1; i <= 5; i++) {
        var s = document.createElement('span');
        if (i <= n) s.className = 'on';
        el.appendChild(s);
      }
    });
    var faMap = { bulb: 'lightbulb', mountain: 'mountain', flag: 'flag', star: 'star', trophy: 'trophy' };
    node.querySelectorAll('[data-cv-fa]').forEach(function (el) {
      var key = el.getAttribute('data-cv-fa');
      var name = item[key];
      if (!name) return;
      var ic = faMap[name] || name;
      el.className = 'ico fa-solid fa-' + ic;
    });
    return node;
  }

  function repeatList(container, array) {
    if (!array || !array.length) {
      container.innerHTML = '';
      return;
    }
    var templateEl = container.firstElementChild;
    if (!templateEl) return;
    var parent = container;
    var tpl = templateEl.cloneNode(true);
    templateEl.remove();
    array.forEach(function (item) {
      parent.appendChild(cloneItem(tpl, item));
    });
  }

  function parseEmbeddedData() {
    var el = document.getElementById('cv-embedded-data');
    if (!el || !el.textContent.trim()) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.warn('bindResume: embedded JSON parse failed', e);
      return null;
    }
  }

  global.bindResume = async function (opts) {
    opts = opts || {};
    var root = opts.root || document;
    var res = opts.dataRaw;
    if (!res && opts.dataEmbedded !== false) res = parseEmbeddedData();
    if (!res) {
      var base = opts.baseUrl || resolveBaseUrl();
      var dataUrl = (opts.dataUrl || base + 'data/sample-resume.json').replace(/([^:]\/)\/+/g, '$1');
      try {
        var r = await fetch(dataUrl);
        res = await r.json();
      } catch (e) {
        console.warn('bindResume: fetch failed', e);
        return;
      }
    }

    root.querySelectorAll('[data-cv]').forEach(function (el) {
      var path = el.getAttribute('data-cv');
      var v = getPath(res, path);
      if (v !== null && v !== undefined) el.textContent = v;
    });

    root.querySelectorAll('[data-cv-attr]').forEach(function (el) {
      var attr = el.getAttribute('data-cv-attr');
      var path = el.getAttribute('data-cv-bind') || el.getAttribute('data-cv');
      if (!attr || !path) return;
      var v = getPath(res, path);
      if (v != null) el.setAttribute(attr, String(v));
    });

    root.querySelectorAll('[data-cv-list]').forEach(function (container) {
      var path = container.getAttribute('data-cv-list');
      var arr = getPath(res, path);
      if (!Array.isArray(arr)) return;
      repeatList(container, arr);
    });

    root.querySelectorAll('[data-cv-lang-list]').forEach(function (container) {
      var arr = res.languages;
      if (!Array.isArray(arr)) return;
      repeatList(container, arr);
    });

    root.querySelectorAll('[data-cv-lang-simple]').forEach(function (container) {
      var arr = res.languages;
      if (!Array.isArray(arr)) return;
      repeatList(container, arr);
    });

    if (res.photoUrl) {
      root.querySelectorAll('[data-cv-photo]').forEach(function (img) {
        img.setAttribute('src', res.photoUrl);
        img.setAttribute('alt', res.fullName || 'Photo');
      });
    }

    if (Array.isArray(res.skills)) {
      root.querySelectorAll('[data-cv-pills], [data-cv-tags]').forEach(function (host) {
        host.innerHTML = '';
        var cls = host.getAttribute('data-pill-class') || host.getAttribute('data-tag-class') || 'pill';
        res.skills.forEach(function (s) {
          var p = document.createElement('span');
          p.className = cls;
          p.textContent = s;
          host.appendChild(p);
        });
      });
      root.querySelectorAll('[data-cv-skill-cells]').forEach(function (grid) {
        var max = parseInt(grid.getAttribute('data-skill-max'), 10) || 12;
        var cls = grid.getAttribute('data-skill-class') || 'skill-cell';
        grid.innerHTML = '';
        res.skills.slice(0, max).forEach(function (s) {
          var c = document.createElement('div');
          c.className = cls;
          c.textContent = s;
          grid.appendChild(c);
        });
      });
    }

    if (Array.isArray(res.languages)) {
      root.querySelectorAll('[data-cv-lang-bars]').forEach(function (host) {
        host.innerHTML = '';
        res.languages.forEach(function (lang) {
          var row = document.createElement('div');
          row.className = 'lang-row';
          var pct = ((lang.filled || 0) / 5) * 100;
          var name = document.createElement('span');
          name.className = 'name';
          name.textContent = lang.name || '';
          var bar = document.createElement('div');
          bar.className = 'bar';
          var fill = document.createElement('i');
          fill.style.display = 'block';
          fill.style.height = '100%';
          fill.style.width = pct + '%';
          bar.appendChild(fill);
          row.appendChild(name);
          row.appendChild(bar);
          host.appendChild(row);
        });
      });
    }

    // ── Apply Zones (Dynamic Layout/Ordering) ────────────────
    if (opts.zones) {
      var containers = {
        sidebar: root.querySelector('.sidebar, aside, .left-col'),
        left: root.querySelector('.sidebar, aside, .left-col, .main'),
        right: root.querySelector('.main, .right-col'),
        full: root.querySelector('.main, .sheet'),
        center: root.querySelector('.main, .sheet')
      };

      function findSectionWrapper(secName) {
        var sel = '';
        if (secName === 'summary') sel = '[data-cv="summary"]';
        else if (secName === 'experience') sel = '[data-cv-list="experience"]';
        else if (secName === 'education') sel = '[data-cv-list="education"]';
        else if (secName === 'skills') sel = '[data-cv-pills], [data-cv-tags], [data-cv-skill-cells], [data-cv="skillsInline"]';
        else if (secName === 'languages') sel = '[data-cv-lang-list], [data-cv-lang-bars], [data-cv-lang-simple]';
        else if (secName === 'achievements') sel = '[data-cv-list="achievements"]';
        else if (secName === 'certifications') sel = '[data-cv-list="certifications"]';
        else if (secName === 'projects') sel = '[data-cv-list="projects"]';
        else if (secName === 'passions') sel = '[data-cv-list="passions"]';
        else return null;

        var el = root.querySelector(sel);
        return el ? el.closest('.main-sec, .sb-sec, section, div:not([data-cv-list]):not([data-cv]):not(.lang-row)') : null;
      }

      Object.keys(opts.zones).forEach(function(zoneKey) {
        var dest = containers[zoneKey];
        if (!dest) return;
        var sectionNames = opts.zones[zoneKey];
        if (!Array.isArray(sectionNames)) return;

        sectionNames.forEach(function(secName) {
          if (secName === 'header') return;
          var wrapper = findSectionWrapper(secName);
          if (wrapper && wrapper !== dest) {
             if (dest.classList.contains('sidebar')) {
              wrapper.classList.remove('main-sec');
              wrapper.classList.add('sb-sec');
            } else {
              wrapper.classList.remove('sb-sec');
              wrapper.classList.add('main-sec');
            }
            dest.appendChild(wrapper);
          }
        });
      });
    }
  };
})(window);
