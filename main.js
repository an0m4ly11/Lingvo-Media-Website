/* ============================================================
   Lingvo Media - shared vanilla JavaScript
   - Mobile nav toggle
   - Footer year
   - Testimonial carousel (home)
   - Login tabs + Moodle redirect (login page)
   ============================================================ */
;(() => {
  "use strict"

  // Moodle dashboard URL — update this to your real Moodle site.
  const MOODLE_URL = "https://lingvomedia.moodlecloud.com/"

  document.addEventListener("DOMContentLoaded", () => {
    setFooterYear()
    initNavToggle()
    initTestimonials()
    initLogin()
    initScrollReveal()
  })

  function setFooterYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear()
    })
  }

  function initNavToggle() {
    const toggle = document.querySelector(".nav-toggle")
    const links = document.querySelector(".nav-links")
    if (!toggle || !links) return
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open")
      toggle.setAttribute("aria-expanded", String(open))
    })
  }

  function initTestimonials() {
    const track = document.querySelector(".testimonial-track")
    if (!track) return
    const slides = Array.from(track.querySelectorAll(".testimonial"))
    if (slides.length === 0) return

    let i = slides.findIndex((s) => s.classList.contains("is-active"))
    if (i < 0) i = 0

    const show = (n) => {
      slides.forEach((s) => s.classList.remove("is-active"))
      i = (n + slides.length) % slides.length
      slides[i].classList.add("is-active")
    }

    const prev = document.querySelector("[data-carousel-prev]")
    const next = document.querySelector("[data-carousel-next]")
    if (prev) prev.addEventListener("click", () => show(i - 1))
    if (next) next.addEventListener("click", () => show(i + 1))

    show(i)
  }

  function initLogin() {
    // Tabs
    const tabs = document.querySelectorAll("[data-tab]")
    const panels = document.querySelectorAll("[data-panel]")
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab")
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab))
        panels.forEach((p) => {
          p.hidden = p.getAttribute("data-panel") !== target
        })
      })
    })

    // Forms redirect to Moodle
    document.querySelectorAll("form[data-moodle]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        window.location.href = MOODLE_URL
      })
    })
  }

  function initScrollReveal() {
    // Auto-target common content blocks across every page.
    const selector = [
      ".section-head",
      ".card",
      ".why-card",
      ".tcard",
      ".course",
      ".price-card",
      ".feature-band .container",
      ".program-hero .container > *",
    ].join(",")

    const items = Array.from(document.querySelectorAll(selector))
    if (items.length === 0) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Tag each item and give staggered delays to siblings in the same row.
    items.forEach((el) => {
      el.classList.add("reveal")
      const siblings = Array.from(el.parentElement ? el.parentElement.children : [])
      const idx = siblings.indexOf(el)
      const delay = Math.min(idx, 4) * 80
      el.style.setProperty("--reveal-delay", delay + "ms")
    })

    // If motion is reduced or IntersectionObserver is unavailable, show immediately.
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )

    items.forEach((el) => observer.observe(el))
  }
})()
