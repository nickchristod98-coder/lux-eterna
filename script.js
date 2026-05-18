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
    return;
  }

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

  document
    .querySelectorAll(".hero .reveal, .contact-page .reveal")
    .forEach(function (el) {
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
    });

  document.querySelectorAll(".work-inline-video").forEach(function (root) {
    const poster = root.querySelector(".work-video-poster");
    const embedWrap = root.querySelector(".work-video-embed");
    const iframe = embedWrap && embedWrap.querySelector("iframe");
    if (!poster || !embedWrap || !iframe) return;

    const id = root.getAttribute("data-youtube-id");
    const start = root.getAttribute("data-youtube-start") || "0";
    if (!id) return;

    function activate() {
      if (root.classList.contains("is-playing")) return;
      root.classList.add("is-playing");

      var params = new URLSearchParams();
      params.set("start", String(start));
      params.set("rel", "0");
      params.set("modestbranding", "1");
      params.set("playsinline", "1");

      var origin = window.location.origin;
      if (origin && origin !== "null" && !/^file:/i.test(window.location.protocol)) {
        params.set("origin", origin);
      }

      var narrow = window.matchMedia("(max-width: 768px)").matches;
      if (!narrow) {
        params.set("autoplay", "1");
      }

      iframe.src =
        "https://www.youtube.com/embed/" +
        encodeURIComponent(id) +
        "?" +
        params.toString();

      embedWrap.removeAttribute("hidden");
      poster.setAttribute("hidden", "");
      poster.setAttribute("tabindex", "-1");
    }

    poster.addEventListener("click", activate);
    poster.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });
})();
