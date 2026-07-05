/* =================================================================
   script.js — interactions, animations, contact workflow
   ================================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Config ---------- */
  // Uses same host as the page (works for localhost, LAN IP, and deployed domains).
  // Override in production via: <meta name="api-base" content="https://your-api.example.com" />
  const API_BASE = document.querySelector('meta[name="api-base"]')?.content?.trim()
    || `${window.location.protocol}//${window.location.hostname}:5000`;
  const API_URL = `${API_BASE.replace(/\/$/, '')}/api/contact`;
  // EmailJS fallback (optional). Fill these if you want a client-only fallback.
  const EMAILJS = { enabled: false, serviceId: '', templateId: '', publicKey: '' };

  /* ---------- Loader ---------- */
  function initLoader() {
    const loader = $('#loader');
    const bar = $('#loaderProgress');
    const pct = $('#loaderPct');
    if (!loader) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 100) progress = 100;
      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = Math.floor(progress) + '%';
      if (progress >= 100) clearInterval(interval);
    }, 140);

    window.addEventListener('load', () => {
      setTimeout(() => {
        progress = 100;
        if (bar) bar.style.width = '100%';
        if (pct) pct.textContent = '100%';
        loader.classList.add('is-done');
        document.body.style.overflow = '';
      }, 600);
    });
  }

  /* ---------- Typing effect ---------- */
  function initTyping() {
    const el = $('#typingText');
    if (!el) return;
    const phrases = [
      'Building Scalable Applications',
      'Developing Modern Web Solutions',
      'Creating Intelligent Systems',
      'Doing AI Assisted Development',
      'Building Enterprise Platforms'
    ];
    if (prefersReduced) { el.textContent = phrases[0]; return; }

    let pi = 0, ci = 0, deleting = false;
    function tick() {
      const phrase = phrases[pi];
      el.textContent = phrase.slice(0, ci);
      if (!deleting && ci < phrase.length) {
        ci++;
        setTimeout(tick, 70);
      } else if (!deleting && ci === phrase.length) {
        deleting = true;
        setTimeout(tick, 1600);
      } else if (deleting && ci > 0) {
        ci--;
        setTimeout(tick, 35);
      } else {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 220);
      }
    }
    tick();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    $$('.reveal-stagger').forEach(container => {
      Array.from(container.children).forEach((child, i) => {
        child.style.setProperty('--i', String(i));
      });
    });

    const items = $$('.reveal, .reveal-stagger');
    if (!('IntersectionObserver' in window)) {
      items.forEach(i => {
        i.classList.add('is-visible');
        $$('.tech:not(.is-hidden)', i).forEach(t => t.classList.add('is-visible'));
      });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          if (e.target.classList.contains('reveal-stagger')) {
            $$('.tech:not(.is-hidden)', e.target).forEach(t => t.classList.add('is-visible'));
          }
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(i => io.observe(i));
  }

  /* ---------- Counters ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    const counters = $$('.counter');
    if (!('IntersectionObserver' in window)) { counters.forEach(animateCounter); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }

  function initSkillBars() {
    const tiles = $$('.tech');
    const pills = $$('.skillfilter__pill');

    function applyFilter(filter) {
      tiles.forEach((t, i) => {
        const show = t.dataset.cat === filter;
        t.classList.toggle('is-hidden', !show);
        if (show) {
          t.style.setProperty('--i', String(i));
          t.classList.remove('is-visible');
          requestAnimationFrame(() => t.classList.add('is-visible'));
        }
      });
    }

    pills.forEach(pill => pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      applyFilter(pill.dataset.filter);
    }));

    const active = document.querySelector('.skillfilter__pill.is-active');
    applyFilter(active ? active.dataset.filter : 'frontend');
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const nav = $('#nav');
    const burger = $('#navBurger');
    const links = $('#navLinks');
    const backdrop = $('#navBackdrop');

    function setMenuOpen(open) {
      links.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      nav.classList.toggle('is-menu-open', open);
      if (backdrop) backdrop.classList.toggle('is-visible', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (backdrop) backdrop.setAttribute('aria-hidden', String(!open));
    }

    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 30);
    }, { passive: true });

    burger.addEventListener('click', () => {
      setMenuOpen(!links.classList.contains('is-open'));
    });

    if (backdrop) backdrop.addEventListener('click', () => setMenuOpen(false));

    $$('.nav__link', links).forEach(l => l.addEventListener('click', () => setMenuOpen(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) setMenuOpen(false);
    });

    const sections = $$('section[id]');
    const navLinks = $$('.nav__link');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Scroll progress + back to top ---------- */
  function initScrollFx() {
    const progress = $('#scrollProgress');
    const backTop = $('#backTop');
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      if (progress) progress.style.width = (scrolled * 100) + '%';
      if (backTop) backTop.classList.toggle('is-visible', h.scrollTop > 500);
    }, { passive: true });
    if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  }

  /* ---------- Cursor glow + parallax ---------- */
  function initCursorAndParallax() {
    const glow = $('#cursorGlow');
    const icons = $$('.floating-icons__item');
    if (prefersReduced) { if (glow) glow.style.display = 'none'; return; }

    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      const dx = (e.clientX / window.innerWidth - 0.5);
      const dy = (e.clientY / window.innerHeight - 0.5);
      icons.forEach(ic => {
        const depth = parseFloat(ic.dataset.depth) || 0.3;
        ic.style.transform = `translate(${dx * depth * 60}px, ${dy * depth * 60}px)`;
      });
    });
    (function loop() {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      if (glow) glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 3D tilt on project cards ---------- */
  function initTilt() {
    if (prefersReduced) return;
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    const toggle = $('#themeToggle');
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---------- Project case study modal ---------- */
  const CASES = {
    glaucoma: {
      title: 'Effective Glaucoma Detection',
      subtitle: 'Python · Deep Learning · Machine Learning',
      html: `<p>A deep-learning system that analyses retinal fundus images to detect glaucoma early, supporting ophthalmologists with reliable, automated screening.</p>
        <h4>Highlights</h4>
        <ul><li>CNN-based classification pipeline on fundus images</li><li>Image preprocessing, augmentation &amp; normalization</li><li>Evaluated with accuracy, precision, recall &amp; ROC-AUC</li><li>Designed for scalable batch inference</li></ul>
        <h4>Impact</h4><p>Demonstrates applied ML for healthcare with a focus on reproducibility and clinical relevance.</p>`
    },
    music: {
      title: 'Music Genre Classification',
      subtitle: 'Python · Classification Models · Data Processing',
      html: `<p>An ML system that classifies audio tracks into genres by extracting and modelling audio features.</p>
        <h4>Highlights</h4>
        <ul><li>Feature extraction (MFCC, spectral &amp; tempo features)</li><li>Multiple classifiers compared &amp; tuned</li><li>Robust data processing &amp; train/test pipeline</li><li>Clear evaluation and confusion-matrix analysis</li></ul>
        <h4>Impact</h4><p>Showcases end-to-end audio ML — from raw signals to a trained, evaluated model.</p>`
    },
    portfolio: {
      title: 'Portfolio Website',
      subtitle: 'HTML · CSS · JavaScript · Express.js · Node.js',
      html: `<p>This portfolio is implemented as a lightweight, production-ready site using plain HTML, CSS and JavaScript for the frontend and an Express/Node.js backend for the contact API.</p>
        <h4>Highlights</h4>
        <ul><li>Static frontend: semantic HTML, responsive CSS and minimal vanilla JS for interactions</li><li>Express/Node.js backend powering the contact form and email workflow</li><li>Simple, secure contact pipeline with validation, rate-limiting and honeypot</li><li>Easy to deploy to most static hosts and Node hosts</li></ul>
        <h4>Tech Stack</h4><p>HTML, CSS, JavaScript, Express.js, Node.js</p>`
    }
  };
  function initModal() {
    const modal = $('#caseModal');
    if (!modal) return;
    const title = $('#caseTitle');
    const subtitle = $('#caseSubtitle');
    const body = $('#caseBody');
    let lastFocus = null;

    function open(key) {
      const data = CASES[key];
      if (!data) return;
      title.textContent = data.title;
      subtitle.textContent = data.subtitle;
      body.innerHTML = data.html;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      lastFocus = document.activeElement;
      $('.modal__close', modal).focus();
    }
    function close() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    $$('.js-case').forEach(b => b.addEventListener('click', () => open(b.dataset.case)));
    $$('[data-close]', modal).forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* ---------- Toast ---------- */
  function toast(message, type = 'success') {
    const wrap = $('#toastWrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `<span class="toast__icon">${type === 'success' ? '✓' : '!'}</span><span>${message}</span>`;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 400);
    }, 4200);
  }

  /* ---------- Contact form ---------- */
  function initContact() {
    const form = $('#contactForm');
    if (!form) return;
    const btn = $('#submitBtn');

    const validators = {
      name: (v) => v.trim().length >= 2 || 'Please enter your name (2+ characters).',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
      subject: (v) => v.trim().length >= 3 || 'Subject must be at least 3 characters.',
      message: (v) => v.trim().length >= 10 || 'Message must be at least 10 characters.'
    };

    function showError(name, msg) {
      const field = form.querySelector(`[name="${name}"]`).closest('.field');
      const err = form.querySelector(`[data-error="${name}"]`);
      if (msg === true) {
        field.classList.remove('is-invalid');
        if (err) err.textContent = '';
      } else {
        field.classList.add('is-invalid');
        if (err) err.textContent = msg;
      }
    }

    function clearErrors() {
      Object.keys(validators).forEach(name => showError(name, true));
    }

    // live validation
    Object.keys(validators).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      input.addEventListener('blur', () => showError(name, validators[name](input.value)));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('is-invalid')) {
          showError(name, validators[name](input.value));
        }
      });
    });

    form.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        if (!form.contains(document.activeElement)) clearErrors();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // honeypot
      if (form.company && form.company.value) return;

      let valid = true;
      Object.keys(validators).forEach(name => {
        const res = validators[name](form[name].value);
        showError(name, res);
        if (res !== true) valid = false;
      });
      if (!valid) { toast('Please fill in all required fields.', 'error'); return; }

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
      };

      btn.classList.add('is-loading');
      btn.disabled = true;

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!data.success) throw new Error(data.message || 'Server error');
        toast('Message sent successfully.', 'success');
        form.reset();
        clearErrors();
      } catch (err) {
        // EmailJS fallback
        if (EMAILJS.enabled && window.emailjs) {
          try {
            await window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, payload, EMAILJS.publicKey);
            toast('Message sent successfully.', 'success');
            form.reset();
            clearErrors();
          } catch (e2) {
            toast('Could not send message. Please email me directly.', 'error');
          }
        } else {
          toast(err.message || 'Could not reach the server. Please email me directly.', 'error');
        }
      } finally {
        btn.classList.remove('is-loading');
        btn.disabled = false;
      }
    });
  }

  /* ---------- Misc ---------- */
  function initMisc() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- Init ---------- */
  document.body.style.overflow = 'hidden';
  initLoader();
  initTyping();
  initReveal();
  initCounters();
  initSkillBars();
  initNav();
  initScrollFx();
  initCursorAndParallax();
  initTilt();
  initTheme();
  initModal();
  initContact();
  initMisc();
})();
