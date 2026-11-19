(function () {
  "use strict";

  var root = document.documentElement;
  var i18n = window.MS_I18N || { translations: { pt: {}, en: {} }, projectDescriptions: {} };
  var currentLang = root.dataset.lang === "en" ? "en" : "pt";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  var header = document.getElementById("header");
  var themeToggle = document.getElementById("theme-toggle");
  var menuToggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("nav");
  var metaDescription = document.getElementById("meta-description");
  var metaThemeColor = document.getElementById("meta-theme-color");
  var ogTitle = document.querySelector('meta[property="og:title"]');
  var ogDescription = document.querySelector('meta[property="og:description"]');
  var typingElement = document.getElementById("typing");
  var backToTop = document.getElementById("back-to-top");
  var projectsGrid = document.getElementById("projects-grid");
  var loadMoreButton = document.getElementById("load-more");
  var loadMoreLabel = loadMoreButton ? loadMoreButton.querySelector("span") : null;

  var typingTimer = null;
  var projectsState = {
    repos: [],
    visible: 6,
    loading: true,
    failed: false
  };

  var LANGUAGE_STORAGE = "ms-lang";
  var THEME_STORAGE = "ms-theme";
  var VISIBLE_STEP = 6;
  var GITHUB_USER = "souzamgz";
  var EXCLUDED_REPOS = ["souzamgz", "souzamgz.github.io"];

  var LANGUAGE_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572a5",
    Java: "#b07219",
    Kotlin: "#a97bff",
    "C#": "#178600",
    HTML: "#e34c26",
    CSS: "#563d7c",
    PLpgSQL: "#336790",
    SQL: "#e38c00",
    Vue: "#41b883",
    Shell: "#89e051"
  };

  var FALLBACK_REPOS = [
    {
      name: "Projeto-EscolaApi",
      html_url: "https://github.com/souzamgz/Projeto-EscolaApi",
      language: "JavaScript",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "HamburgueriaAPI",
      html_url: "https://github.com/souzamgz/HamburgueriaAPI",
      language: "Java",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "Matematica-MissaoEspacial",
      html_url: "https://github.com/souzamgz/Matematica-MissaoEspacial",
      language: "C#",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "Cadastro-de-Alunos-em-Python",
      html_url: "https://github.com/souzamgz/Cadastro-de-Alunos-em-Python",
      language: "JavaScript",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "ProjetoIntegradorI",
      html_url: "https://github.com/souzamgz/ProjetoIntegradorI",
      language: "PLpgSQL",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "SpotDup",
      html_url: "https://github.com/souzamgz/SpotDup",
      language: "Kotlin",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "DS",
      html_url: "https://github.com/souzamgz/DS",
      language: "HTML",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "Seu_Doce_Pedido",
      html_url: "https://github.com/souzamgz/Seu_Doce_Pedido",
      language: "JavaScript",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    },
    {
      name: "java-learning",
      html_url: "https://github.com/souzamgz/java-learning",
      language: "Java",
      stargazers_count: 0,
      forks_count: 0,
      pushed_at: "",
      homepage: ""
    }
  ];

  function t(key) {
    var table = i18n.translations[currentLang] || {};
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : key;
  }

  function safeStorage(action, key, value) {
    try {
      if (action === "get") {
        return window.localStorage.getItem(key);
      }
      if (action === "set") {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function updateThemeLabel() {
    var isLight = root.dataset.theme === "light";
    var label = isLight
      ? currentLang === "pt" ? "Ativar tema escuro" : "Switch to dark theme"
      : currentLang === "pt" ? "Ativar tema claro" : "Switch to light theme";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("aria-pressed", isLight ? "true" : "false");
  }

  function applyTheme(theme, persist) {
    var next = theme === "light" ? "light" : "dark";
    root.dataset.theme = next;
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", next === "light" ? "#eef2ff" : "#060a18");
    }
    updateThemeLabel();
    if (persist) {
      safeStorage("set", THEME_STORAGE, next);
    }
    if (window.msStarfield && window.msStarfield.refresh) {
      window.msStarfield.refresh();
    }
  }

  function updateMenuLabel() {
    var open = document.body.classList.contains("menu-open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    var label = open
      ? currentLang === "pt" ? "Fechar menu" : "Close menu"
      : t("a11y.menu");
    menuToggle.setAttribute("aria-label", label);
  }

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    updateMenuLabel();
  }

  function updateLanguageButtons() {
    var buttons = document.querySelectorAll(".lang-button");
    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      var active = button.dataset.lang === currentLang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function applyLanguage(lang, persist, skipProjects) {
    currentLang = lang === "en" ? "en" : "pt";
    root.lang = currentLang === "pt" ? "pt-BR" : "en";
    root.dataset.lang = currentLang;

    var textNodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < textNodes.length; i += 1) {
      var node = textNodes[i];
      var value = t(node.dataset.i18n);
      if (typeof value === "string") {
        node.textContent = value;
      }
    }

    var ariaNodes = document.querySelectorAll("[data-i18n-aria-label]");
    for (var j = 0; j < ariaNodes.length; j += 1) {
      var ariaNode = ariaNodes[j];
      ariaNode.setAttribute("aria-label", t(ariaNode.dataset.i18nAriaLabel));
    }

    document.title = t("meta.title");
    if (metaDescription) {
      metaDescription.setAttribute("content", t("meta.description"));
    }
    if (ogTitle) {
      ogTitle.setAttribute("content", t("meta.title"));
    }
    if (ogDescription) {
      ogDescription.setAttribute("content", t("meta.ogDescription"));
    }

    updateLanguageButtons();
    updateThemeLabel();
    updateMenuLabel();
    startTyping();

    if (!skipProjects) {
      renderProjects();
    }

    if (persist) {
      safeStorage("set", LANGUAGE_STORAGE, currentLang);
    }
  }

  function startTyping() {
    if (!typingElement) {
      return;
    }

    if (typingTimer) {
      window.clearTimeout(typingTimer);
      typingTimer = null;
    }

    var roles = t("hero.roles");
    if (!Array.isArray(roles) || !roles.length) {
      return;
    }

    if (reducedMotion.matches) {
      typingElement.textContent = roles[0];
      return;
    }

    var roleIndex = 0;
    var charIndex = roles[0].length;
    var deleting = false;

    typingElement.textContent = roles[0];

    function tick() {
      var role = roles[roleIndex];

      if (!deleting) {
        charIndex += 1;
        if (charIndex >= role.length) {
          charIndex = role.length;
          deleting = true;
          typingElement.textContent = role;
          typingTimer = window.setTimeout(tick, 2400);
          return;
        }
      } else {
        charIndex -= 1;
        if (charIndex <= 0) {
          charIndex = 0;
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }

      typingElement.textContent = roles[roleIndex].slice(0, charIndex);
      typingTimer = window.setTimeout(tick, deleting ? 34 : 68);
    }

    typingTimer = window.setTimeout(tick, 2400);
  }

  function formatDate(isoDate) {
    if (!isoDate) {
      return "";
    }
    try {
      var date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      return new Intl.DateTimeFormat(currentLang === "pt" ? "pt-BR" : "en-US", {
        month: "short",
        year: "numeric"
      }).format(date);
    } catch (error) {
      return "";
    }
  }

  function descriptionFor(repo) {
    var custom = i18n.projectDescriptions[repo.name];
    if (custom && custom[currentLang]) {
      return custom[currentLang];
    }
    if (repo.description) {
      return repo.description;
    }
    return t("projects.noDescription");
  }

  function languageColor(language) {
    return LANGUAGE_COLORS[language] || "var(--accent)";
  }

  function iconMarkup(name) {
    if (name === "star") {
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3.6 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    }
    if (name === "fork") {
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="7" cy="5.5" r="2.2" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="5.5" r="2.2" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="18.5" r="2.2" stroke="currentColor" stroke-width="1.5"/><path d="M7 7.7v2.1c0 1.6 1.3 2.9 2.9 2.9h4.2c1.6 0 2.9-1.3 2.9-2.9V7.7M12 12.7v3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    }
    return "";
  }

  function createProjectCard(repo, index) {
    var article = document.createElement("article");
    article.className = "glass project-card";
    article.setAttribute("data-tilt", "");

    var top = document.createElement("div");
    top.className = "project-top";

    var folder = document.createElement("span");
    folder.className = "project-folder";
    folder.setAttribute("aria-hidden", "true");
    folder.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.2l1.8 2.2H18a2.5 2.5 0 0 1 2.5 2.5v6.8A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5V7.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

    var external = document.createElement("a");
    external.className = "project-external";
    external.href = repo.html_url;
    external.target = "_blank";
    external.rel = "noopener";
    external.setAttribute("aria-label", t("projects.view") + ": " + repo.name);
    external.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    top.appendChild(folder);
    top.appendChild(external);

    var title = document.createElement("h3");
    var titleLink = document.createElement("a");
    titleLink.href = repo.html_url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener";
    titleLink.textContent = repo.name;
    titleLink.style.textDecoration = "none";
    title.appendChild(titleLink);

    var description = document.createElement("p");
    description.textContent = descriptionFor(repo);

    var meta = document.createElement("div");
    meta.className = "project-meta";

    if (repo.language) {
      var language = document.createElement("span");
      language.className = "project-language";
      var dot = document.createElement("span");
      dot.className = "language-dot";
      dot.style.background = languageColor(repo.language);
      language.appendChild(dot);
      var languageName = document.createElement("span");
      languageName.textContent = repo.language;
      language.appendChild(languageName);
      meta.appendChild(language);
    }

    if (repo.stargazers_count > 0) {
      var stars = document.createElement("span");
      stars.className = "project-stat";
      stars.title = repo.stargazers_count + " " + t("projects.stars");
      stars.innerHTML = iconMarkup("star");
      var starsNumber = document.createElement("span");
      starsNumber.textContent = String(repo.stargazers_count);
      stars.appendChild(starsNumber);
      meta.appendChild(stars);
    }

    if (repo.forks_count > 0) {
      var forks = document.createElement("span");
      forks.className = "project-stat";
      forks.title = repo.forks_count + " " + t("projects.forks");
      forks.innerHTML = iconMarkup("fork");
      var forksNumber = document.createElement("span");
      forksNumber.textContent = String(repo.forks_count);
      forks.appendChild(forksNumber);
      meta.appendChild(forks);
    }

    var updated = formatDate(repo.pushed_at);
    if (updated) {
      var updatedElement = document.createElement("span");
      updatedElement.className = "project-updated";
      updatedElement.textContent = t("projects.updated") + " " + updated;
      meta.appendChild(updatedElement);
    }

    article.appendChild(top);
    article.appendChild(title);
    article.appendChild(description);
    article.appendChild(meta);

    if (finePointer.matches && !reducedMotion.matches) {
      bindTilt(article);
    }

    article.style.animation = "card-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) backwards";
    article.style.animationDelay = Math.min(index, 5) * 55 + "ms";

    return article;
  }

  function renderProjects() {
    if (!projectsGrid) {
      return;
    }

    if (projectsState.loading && !projectsState.repos.length) {
      return;
    }

    projectsGrid.innerHTML = "";

    if (!projectsState.repos.length) {
      var empty = document.createElement("div");
      empty.className = "projects-message";
      empty.innerHTML = "<p></p>";
      empty.querySelector("p").textContent = projectsState.failed ? t("projects.error") : t("projects.empty");
      if (projectsState.failed) {
        var retry = document.createElement("button");
        retry.type = "button";
        retry.className = "button button-ghost";
        retry.textContent = t("projects.retry");
        retry.addEventListener("click", loadProjects);
        empty.appendChild(retry);
      }
      projectsGrid.appendChild(empty);
      if (loadMoreButton) {
        loadMoreButton.hidden = true;
      }
      return;
    }

    var fragment = document.createDocumentFragment();
    var limit = Math.min(projectsState.visible, projectsState.repos.length);
    for (var i = 0; i < limit; i += 1) {
      fragment.appendChild(createProjectCard(projectsState.repos[i], i));
    }
    projectsGrid.appendChild(fragment);

    if (loadMoreButton && loadMoreLabel) {
      var expanded = projectsState.visible >= projectsState.repos.length;
      if (projectsState.repos.length <= VISIBLE_STEP) {
        loadMoreButton.hidden = true;
      } else {
        loadMoreButton.hidden = false;
        loadMoreLabel.textContent = expanded ? t("projects.showLess") : t("projects.loadMore");
        var svg = loadMoreButton.querySelector("svg");
        if (svg) {
          svg.style.transform = expanded ? "rotate(180deg)" : "";
        }
      }
    }
  }

  function loadProjects() {
    projectsState.loading = true;
    projectsState.failed = false;

    if (projectsGrid) {
      projectsGrid.innerHTML = new Array(3).fill(
        '<article class="glass project-card is-skeleton" aria-hidden="true">' +
        '<span class="skeleton-line skeleton-title"></span>' +
        '<span class="skeleton-line"></span>' +
        '<span class="skeleton-line skeleton-short"></span>' +
        "</article>"
      ).join("");
    }

    fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("GitHub API request failed");
        }
        return response.json();
      })
      .then(function (repos) {
        var filtered = repos.filter(function (repo) {
          return (
            !repo.fork &&
            EXCLUDED_REPOS.indexOf(repo.name) === -1
          );
        });
        filtered.sort(function (a, b) {
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
        });
        projectsState.repos = filtered;
        projectsState.loading = false;
        renderProjects();
      })
      .catch(function () {
        projectsState.failed = true;
        projectsState.repos = FALLBACK_REPOS.slice();
        projectsState.loading = false;
        renderProjects();
      });
  }

  function bindTilt(element) {
    if (element.dataset.tiltBound === "true") {
      return;
    }
    element.dataset.tiltBound = "true";

    element.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") {
        return;
      }
      var rect = element.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform =
        "perspective(900px) rotateX(" + (-y * 4.5).toFixed(2) + "deg) rotateY(" +
        (x * 5).toFixed(2) + "deg) translateY(-3px)";
    });

    element.addEventListener("pointerleave", function () {
      element.style.transform = "";
    });
  }

  function initTilt() {
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }
    var elements = document.querySelectorAll("[data-tilt]");
    for (var i = 0; i < elements.length; i += 1) {
      bindTilt(elements[i]);
    }
  }

  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    for (var i = 0; i < elements.length; i += 1) {
      var delay = elements[i].dataset.delay;
      if (delay) {
        elements[i].style.setProperty("--delay", delay);
      }
    }

    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      for (var j = 0; j < elements.length; j += 1) {
        elements[j].classList.add("is-visible");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    for (var k = 0; k < elements.length; k += 1) {
      observer.observe(elements[k]);
    }
  }

  function initStars() {
    var canvas = document.getElementById("starfield");
    if (!canvas) {
      return;
    }
    var context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    var width = 0;
    var height = 0;
    var stars = [];
    var meteors = [];
    var frame = null;
    var nextMeteor = 0;
    var lastTime = 0;
    var pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    function starColor() {
      var value = window.getComputedStyle(root).getPropertyValue("--star-color").trim();
      return value || "230, 236, 255";
    }

    function buildStars() {
      var count = Math.max(70, Math.min(210, Math.round((width * height) / 9500)));
      stars = [];
      for (var i = 0; i < count; i += 1) {
        var depth = 0.25 + Math.random() * 0.75;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth: depth,
          radius: 0.35 + Math.random() * 1.25,
          phase: Math.random() * Math.PI * 2,
          speed: 0.35 + Math.random() * 0.9
        });
      }
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      if (reducedMotion.matches) {
        draw(0);
      }
    }

    function spawnMeteor(time) {
      if (time < nextMeteor) {
        return;
      }
      meteors.push({
        x: width * (0.2 + Math.random() * 0.7),
        y: height * (0.05 + Math.random() * 0.35),
        vx: -(3.4 + Math.random() * 3.2),
        vy: 2.2 + Math.random() * 2.4,
        life: 1,
        length: 80 + Math.random() * 90
      });
      nextMeteor = time + 5000 + Math.random() * 7000;
    }

    function drawMeteors() {
      for (var i = meteors.length - 1; i >= 0; i -= 1) {
        var meteor = meteors[i];
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 0.012;

        if (meteor.life <= 0 || meteor.x < -200 || meteor.y > height + 120) {
          meteors.splice(i, 1);
          continue;
        }

        var tailX = meteor.x - meteor.vx * (meteor.length / 5);
        var tailY = meteor.y - meteor.vy * (meteor.length / 5);
        var gradient = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        gradient.addColorStop(0, "rgba(" + starColor() + "," + meteor.life + ")");
        gradient.addColorStop(1, "rgba(" + starColor() + ",0)");

        context.beginPath();
        context.strokeStyle = gradient;
        context.lineWidth = 1.4;
        context.lineCap = "round";
        context.moveTo(meteor.x, meteor.y);
        context.lineTo(tailX, tailY);
        context.stroke();
      }
    }

    function draw(time) {
      context.clearRect(0, 0, width, height);
      var color = starColor();
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      for (var i = 0; i < stars.length; i += 1) {
        var star = stars[i];
        star.y += 0.008 + star.depth * 0.012;
        if (star.y > height + 2) {
          star.y = -2;
          star.x = Math.random() * width;
        }

        var x = star.x + pointer.x * star.depth * 14;
        var y = star.y + pointer.y * star.depth * 10;
        var twinkle = 0.6 + 0.4 * Math.sin(time * 0.0012 * star.speed + star.phase);
        var alpha = (0.18 + star.depth * 0.62) * twinkle;

        context.beginPath();
        context.fillStyle = "rgba(" + color + "," + alpha.toFixed(3) + ")";
        context.arc(x, y, star.radius * star.depth, 0, Math.PI * 2);
        context.fill();
      }

      if (!reducedMotion.matches) {
        spawnMeteor(time);
        drawMeteors();
      }

      if (!reducedMotion.matches && !document.hidden) {
        frame = window.requestAnimationFrame(draw);
      } else {
        frame = null;
      }
    }

    function start() {
      if (frame === null && !reducedMotion.matches) {
        frame = window.requestAnimationFrame(draw);
      }
    }

    resize();
    if (!reducedMotion.matches) {
      start();
    }

    window.addEventListener("resize", function () {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      resize();
      start();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (frame !== null) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
      } else {
        lastTime = 0;
        start();
      }
    });

    if (finePointer.matches) {
      window.addEventListener(
        "pointermove",
        function (event) {
          pointer.targetX = (event.clientX / width - 0.5) * 2;
          pointer.targetY = (event.clientY / height - 0.5) * 2;
        },
        { passive: true }
      );
    }

    window.msStarfield = {
      refresh: function () {
        if (reducedMotion.matches) {
          draw(0);
        }
      }
    };

    lastTime = 0;
  }

  function initCursorGlow() {
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    document.body.classList.add("has-pointer");
    window.addEventListener(
      "pointermove",
      function (event) {
        root.style.setProperty("--mx", event.clientX + "px");
        root.style.setProperty("--my", event.clientY + "px");
      },
      { passive: true }
    );
  }

  function initScrollUi() {
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".nav-link");
    var ticking = false;

    function update() {
      var scrollY = window.scrollY || window.pageYOffset;
      header.classList.toggle("is-scrolled", scrollY > 12);
      backToTop.classList.toggle("is-visible", scrollY > 600);

      var marker = scrollY + 150;
      var activeId = sections.length ? sections[0].id : "";

      for (var i = 0; i < sections.length; i += 1) {
        if (sections[i].offsetTop <= marker) {
          activeId = sections[i].id;
        }
      }

      var documentHeight = document.documentElement.scrollHeight;
      if (window.innerHeight + scrollY >= documentHeight - 40) {
        activeId = sections.length ? sections[sections.length - 1].id : activeId;
      }

      for (var j = 0; j < navLinks.length; j += 1) {
        navLinks[j].classList.toggle(
          "is-active",
          navLinks[j].getAttribute("href") === "#" + activeId
        );
      }

      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function initEvents() {
    themeToggle.addEventListener("click", function () {
      applyTheme(root.dataset.theme === "light" ? "dark" : "light", true);
    });

    var langButtons = document.querySelectorAll(".lang-button");
    for (var i = 0; i < langButtons.length; i += 1) {
      langButtons[i].addEventListener("click", function () {
        applyLanguage(this.dataset.lang, true, false);
      });
    }

    menuToggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });

    var navLinks = nav.querySelectorAll("a");
    for (var j = 0; j < navLinks.length; j += 1) {
      navLinks[j].addEventListener("click", function () {
        setMenu(false);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenu(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) {
        setMenu(false);
      }
    });

    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", function () {
        var expanded = projectsState.visible >= projectsState.repos.length;
        projectsState.visible = expanded
          ? VISIBLE_STEP
          : projectsState.repos.length;
        renderProjects();
      });
    }

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    });

    var year = document.getElementById("year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  function init() {
    var storedTheme = safeStorage("get", THEME_STORAGE);
    if (storedTheme === "light" || storedTheme === "dark") {
      root.dataset.theme = storedTheme;
    }
    applyTheme(root.dataset.theme, false);

    var storedLang = safeStorage("get", LANGUAGE_STORAGE);
    if (storedLang === "pt" || storedLang === "en") {
      currentLang = storedLang;
    }
    applyLanguage(currentLang, false, true);

    initStars();
    initReveal();
    initTilt();
    initCursorGlow();
    initScrollUi();
    initEvents();
    loadProjects();
    updateMenuLabel();
  }

  init();
})();
