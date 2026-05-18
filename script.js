(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      if (open) {
        mobileNav.setAttribute("hidden", "");
        document.body.style.overflow = "";
      } else {
        mobileNav.removeAttribute("hidden");
        document.body.style.overflow = "hidden";
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        mobileNav.setAttribute("hidden", "");
        document.body.style.overflow = "";
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  const cards = document.querySelectorAll(".service-card.reveal");

  cards.forEach(function (card, index) {
    card.style.setProperty("--i", String(index));
  });

  const workStills = document.getElementById("work-stills");
  const stillsTrack = document.getElementById("work-stills-track");
  const stillsScroller = document.getElementById("work-stills-scroller");
  const stillsPrev = document.querySelector(".work-stills-btn--prev");
  const stillsNext = document.querySelector(".work-stills-btn--next");

  if (workStills && stillsTrack && stillsScroller && stillsPrev && stillsNext) {
    const slides = stillsTrack.querySelectorAll(".work-stills-slide");
    const hasSlides = slides.length > 0;
    if (hasSlides) {
      workStills.classList.add("has-slides");

      // Auto-slide to the right every 4s, with smart pause/resume and active caption handling.
      var autoSlideInterval = 4000;
      var autoSlideTimer = null;
      var resumeTimer = null;

      function widthsArray() {
        var gap = parseFloat(getComputedStyle(stillsTrack).gap) || 16;
        return Array.from(slides).map(function (s) {
          return s.offsetWidth + gap;
        });
      }

      function getCurrentIndex() {
        var left = stillsScroller.scrollLeft;
        var widths = widthsArray();
        var acc = 0;
        for (var i = 0; i < widths.length; i++) {
          if (left < acc + widths[i] / 2) return i;
          acc += widths[i];
        }
        return Math.max(0, Math.min(slides.length - 1, i - 1));
      }

      function scrollToIndex(i) {
        var gap = parseFloat(getComputedStyle(stillsTrack).gap) || 16;
        var target = 0;
        for (var j = 0; j < i; j++) {
          target += slides[j].offsetWidth + gap;
        }
        stillsScroller.scrollTo({ left: target, behavior: "smooth" });
        updateActive(i);
      }

      function updateActive(i) {
        slides.forEach(function (s, idx) {
          s.classList.toggle("is-active", idx === i);
        });
      }

      function nextAuto() {
        if (getComputedStyle(stillsScroller).getPropertyValue("--stills-autoplay-paused") === "1") return;
        var idx = getCurrentIndex();
        var next = (idx + 1) % slides.length;
        scrollToIndex(next);
      }

      function startAuto() {
        stopAuto();
        autoSlideTimer = setInterval(nextAuto, autoSlideInterval);
      }

      function stopAuto() {
        if (autoSlideTimer) {
          clearInterval(autoSlideTimer);
          autoSlideTimer = null;
        }
      }

      // Pause when user interacts, resume after 8s of inactivity
      function userInteracted() {
        stopAuto();
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
          startAuto();
        }, 8000);
      }

      // Initialize active slide
      updateActive(0);
      startAuto();

      stillsScroller.addEventListener("mouseenter", function () {
        stopAuto();
      });
      stillsScroller.addEventListener("mouseleave", function () {
        startAuto();
      });
      stillsScroller.addEventListener("focusin", function () {
        stopAuto();
      });
      stillsScroller.addEventListener("focusout", function () {
        startAuto();
      });
      stillsScroller.addEventListener("pointerdown", userInteracted);
      stillsScroller.addEventListener("touchstart", userInteracted, { passive: true });
      stillsScroller.addEventListener("wheel", userInteracted, { passive: true });

      // Update active on scroll (debounced)
      var scrollDebounce = null;
      stillsScroller.addEventListener("scroll", function () {
        if (scrollDebounce) clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(function () {
          updateActive(getCurrentIndex());
        }, 120);
      });

      function slideStep() {
        const first = slides[0];
        if (!first) return stillsScroller.clientWidth * 0.85;
        const gap = parseFloat(getComputedStyle(stillsTrack).gap) || 16;
        return first.getBoundingClientRect().width + gap;
      }

      stillsPrev.addEventListener("click", function () {
        stillsScroller.scrollBy({ left: -slideStep(), behavior: "smooth" });
      });

      stillsNext.addEventListener("click", function () {
        stillsScroller.scrollBy({ left: slideStep(), behavior: "smooth" });
      });

      stillsScroller.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stillsScroller.scrollBy({ left: -slideStep(), behavior: "smooth" });
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stillsScroller.scrollBy({ left: slideStep(), behavior: "smooth" });
        }
      });
    }
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  revealEls.forEach(function (el) {
    io.observe(el);
  });
  }

  document
    .querySelectorAll(".hero .reveal, .contact-page .reveal")
    .forEach(function (el) {
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
    });

  initWorkInlineVideos();
  initStillsModal();
  initServiceModals();
  initMarqueeLoop();
})();

function initWorkInlineVideos() {
  // Simplified, robust play flow for the inline video.
  var root = document.querySelector(".work-inline-video, .work-video-simple");
  if (!root) return;

  var id = root.getAttribute("data-youtube-id");
  var start = parseInt(root.getAttribute("data-youtube-start") || "0", 10) || 0;
  var poster = root.querySelector(".work-video-poster") || root.querySelector(".work-video-playbtn");
  var embedWrap = root.querySelector(".work-video-embed");
  var iframe = embedWrap && embedWrap.querySelector("iframe");
  if (!id || !poster || !embedWrap || !iframe) return;

  function buildEmbedUrl(muted) {
    var params = new URLSearchParams();
    params.set("start", String(start));
    params.set("rel", "0");
    params.set("modestbranding", "1");
    params.set("playsinline", "1");
    params.set("autoplay", "1");
    if (muted) params.set("mute", "1");
    var origin = window.location.origin;
    if (origin && origin !== "null" && !/^file:/i.test(window.location.protocol)) {
      params.set("origin", origin);
    }
    return "https://www.youtube.com/embed/" + encodeURIComponent(id) + "?" + params.toString();
  }

  function showEmbed() {
    root.classList.add("is-playing");
    embedWrap.removeAttribute("hidden");
    if (poster) poster.setAttribute("hidden", "");
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen");
    iframe.setAttribute("allowfullscreen", "");
    var _btn = root.querySelector(".work-unmute");
    if (_btn) _btn.removeAttribute("hidden");
  }

  function tryMountPlayer() {
    // Try to instantiate YT.Player to gain control (unmute/play) if API present.
    try {
      if (!window.YT || !window.YT.Player) return;
      if (!iframe.id) iframe.id = "ytplayer-" + Math.random().toString(36).slice(2, 9);
      var player = new YT.Player(iframe.id, {
        videoId: id,
        playerVars: { start: start, rel: 0, modestbranding: 1, playsinline: 1, autoplay: 1, enablejsapi: 1 },
        events: {
          onReady: function (ev) {
            try {
              ev.target.playVideo();
              ev.target.unMute && ev.target.unMute();
            } catch (e) {}
          },
        },
      });
      try { window.__luxPlayer = player; } catch (e) {}
    } catch (e) {
      // ignore
    }
  }

  function activate() {
    if (root.classList.contains("is-playing")) return;
    showEmbed();
    // First try muted autoplay (most reliable)
    iframe.src = buildEmbedUrl(true);
    // Load YT API and attempt to mount/unmute afterwards
    if (!window.YT || !window.YT.Player) {
      if (!document.getElementById("youtube-iframe-api")) {
        window.onYouTubeIframeAPIReady = function () {
          tryMountPlayer();
        };
        var s = document.createElement("script");
        s.id = "youtube-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      } else {
        // API script present but not ready -> poll
        var t = setInterval(function () {
          if (window.YT && window.YT.Player) {
            clearInterval(t);
            tryMountPlayer();
          }
        }, 250);
      }
    } else {
      tryMountPlayer();
    }
  }

  poster.addEventListener("click", activate);
  poster.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  });
  // Unmute button logic (works with YT player when available, otherwise reloads embed unmuted)
  (function () {
    var btn = root.querySelector(".work-unmute");
    if (!btn) return;
    btn.addEventListener("click", function () {
      try {
        var p = window.__luxPlayer;
        if (p && typeof p.unMute === "function") {
          p.unMute();
          try { p.playVideo(); } catch (e) {}
          btn.setAttribute("hidden", "");
          return;
        }
      } catch (e) {}
      // fallback: reload iframe without mute (user gesture)
      try {
        iframe.src = buildEmbedUrl(false);
      } catch (e) {}
      btn.setAttribute("hidden", "");
    });
  })();
}

// Stills modal: open photo in a lightbox-style dialog
function initStillsModal() {
  var modal = document.getElementById("stills-modal");
  if (!modal) return;
  var backdrop = modal.querySelector(".stills-modal-backdrop");
  var img = document.getElementById("stills-modal-img");
  var closeBtn = modal.querySelector(".stills-modal-close");

  function open(src, alt) {
    if (!src) return;
    img.src = src;
    img.alt = alt || "";
    modal.removeAttribute("hidden");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
  }

  function close() {
    if (!modal) return;
    modal.setAttribute("hidden", "");
    img.src = "";
    img.alt = "";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  var stillImages = document.querySelectorAll(".work-stills-slide img");
  stillImages.forEach(function (image) {
    image.style.cursor = "zoom-in";
    image.addEventListener("click", function () {
      open(image.src, image.alt);
    });
    image.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(image.src, image.alt);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) close();
  });
}

// Service cards modal: show expanded details when a card is clicked
function initServiceModals() {
  var modal = document.getElementById("service-modal");
  if (!modal) return;
  var backdrop = modal.querySelector(".service-modal-backdrop");
  var closeBtn = modal.querySelector(".service-modal-close");
  var titleEl = document.getElementById("service-modal-title");
  var bodyEl = document.getElementById("service-modal-body");

  var serviceDetails = {
    "Commercial & brand": "<p>Concept-to-delivery production for brand campaigns and spots. We handle creative development, casting, location scouting, production management, and multi-format delivery.</p><ul><li>Concept & treatments</li><li>Full production (crew, cast, locations)</li><li>Multiple deliverables: TV, social, OOH</li><li>Motion graphics & finishing</li></ul><p><a href=\"#contact\" class=\"btn btn-primary\">Start a project</a></p>",
    "Cinematic video": "<p>Feature-quality cinematography and direction for narrative and branded films. We focus on visual storytelling, camera movement, and editorial rhythm.</p><ul><li>DP & director collaboration</li><li>Camera, lighting & grip package</li><li>On-set dailies and rushes</li><li>Editing, color, and sound design</li></ul><p><a href=\"#contact\" class=\"btn btn-primary\">Start a project</a></p>",
    "Photography": "<p>High-end still photography for campaigns, lookbooks, and key art. On-set capture and retouching tailored to your brand's visual language.</p><ul><li>Art direction & styling</li><li>On-set tethered capture</li><li>Professional retouching</li><li>Multiple aspect ratios & sizes</li></ul><p><a href=\"#contact\" class=\"btn btn-primary\">Start a project</a></p>",
    "Film & documentary": "<p>Narrative shorts and documentary projects with festival strategy and editorial rigor. From research and interviews to final festival delivery.</p><ul><li>Development & treatment</li><li>Interviews & verité capture</li><li>Archival research and clearances</li><li>Festival prep & delivery</li></ul><p><a href=\"#contact\" class=\"btn btn-primary\">Start a project</a></p>",
    "Product & sales": "<p>Product-focused films and visuals engineered for conversion. Fast turnarounds and shoot workflows optimized for e‑commerce and ad platforms.</p><ul><li>Product motion & hero shots</li><li>Clean lighting and retouching</li><li>Ad-ready cuts and aspect ratios</li><li>Optimized delivery for web and social</li></ul><p><a href=\"#contact\" class=\"btn btn-primary\">Start a project</a></p>",
    "Post & finishing": "<p>Color grading, sound design, and final deliverables prepared to spec. We handle format conversions, QC, and platform-ready masters.</p><ul><li>Color grading & LUTs</li><li>Sound mix & sweetening</li><li>Codec and format delivery</li><li>Quality control and closed captions</li></ul><p><a href=\"#contact\" class=\"btn btn-primary\">Start a project</a></p>"
  };

  function open(title, bodyHtml) {
    titleEl.textContent = title || "";
    // prefer a richer curated description if available
    if (serviceDetails[title]) {
      bodyEl.innerHTML = serviceDetails[title];
    } else {
      bodyEl.innerHTML = bodyHtml || "";
    }
    modal.removeAttribute("hidden");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
  }

  function close() {
    modal.setAttribute("hidden", "");
    titleEl.textContent = "";
    bodyEl.innerHTML = "";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  // Bind each service card
  var cards = document.querySelectorAll(".service-card");
  cards.forEach(function (card) {
    card.style.cursor = "pointer";
    card.addEventListener("click", function () {
      var h3 = card.querySelector("h3");
      var p = card.querySelector("p");
      var title = h3 ? h3.textContent.trim() : "";
      var body = p ? "<p>" + p.innerHTML + "</p>" : "";
      // optional: add more detailed content depending on title
      open(title, body);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) close();
  });
}

// Duplicate marquee content for seamless looping if needed
function initMarqueeLoop() {
  var el = document.querySelector(".marquee-inner");
  if (!el) return;
  if (el.dataset.duplicated === "1") return;
  try {
    // duplicate children to ensure continuous scroll
    var children = Array.from(el.children);
    children.forEach(function (child) {
      var clone = child.cloneNode(true);
      el.appendChild(clone);
    });
    el.dataset.duplicated = "1";
  } catch (e) {
    // ignore
  }
}
