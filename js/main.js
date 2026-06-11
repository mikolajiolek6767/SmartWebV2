'use strict';

/* ── CustomCursor ────────────────────────────────────────── */
const CustomCursor = {
  mouseX: 0, mouseY: 0,
  ringX:  0, ringY:  0,

  init() {
    const dot  = this.dot  = document.getElementById('cursor-dot');
    const ring = this.ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

    document.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      dot.style.left = `${e.clientX}px`;
      dot.style.top  = `${e.clientY}px`;
    });

    document.querySelectorAll('a, button, .service-card, .faq__item, .testimonial-card')
      .forEach(el => {
        el.addEventListener('mouseenter', () => {
          Object.assign(dot.style,  { transform: 'translate(-50%,-50%) scale(2.5)', background: 'rgba(91,110,248,.6)' });
          Object.assign(ring.style, { width: '60px', height: '60px' });
        });
        el.addEventListener('mouseleave', () => {
          Object.assign(dot.style,  { transform: 'translate(-50%,-50%) scale(1)', background: 'var(--color-accent)' });
          Object.assign(ring.style, { width: '36px', height: '36px' });
        });
      });

    const tick = () => {
      this.ringX += (this.mouseX - this.ringX) * 0.12;
      this.ringY += (this.mouseY - this.ringY) * 0.12;
      ring.style.left = `${this.ringX}px`;
      ring.style.top  = `${this.ringY}px`;
      requestAnimationFrame(tick);
    };
    tick();
  },
};


/* ── Navbar ──────────────────────────────────────────────── */
const Navbar = {
  init() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const update = () => nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();
  },
};


/* ── MobileMenu ──────────────────────────────────────────── */
const MobileMenu = {
  isOpen: false,

  init() {
    const menu = this.menu = document.getElementById('mobile-nav');
    const btn  = this.btn  = document.getElementById('hamburger');
    if (!menu || !btn) return;
    btn.addEventListener('click', () => this.toggle());
    menu.querySelectorAll('.mobile-nav__link').forEach(l => l.addEventListener('click', () => this.close()));
    document.addEventListener('keydown', e => e.key === 'Escape' && this.isOpen && this.close());
  },

  toggle() { this.isOpen ? this.close() : this.open(); },

  open() {
    this.isOpen = true;
    this.menu.classList.add('mobile-nav--open');
    this.btn.classList.add('nav__hamburger--open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.isOpen = false;
    this.menu.classList.remove('mobile-nav--open');
    this.btn.classList.remove('nav__hamburger--open');
    document.body.style.overflow = '';
  },
};


/* ── ServiceCardGlow ─────────────────────────────────────── */
const ServiceCardGlow = {
  init() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (((e.clientX - r.left) / r.width)  * 100).toFixed(1) + '%');
        card.style.setProperty('--mouse-y', (((e.clientY - r.top)  / r.height) * 100).toFixed(1) + '%');
      });
    });
  },
};


/* ── ScrollReveal ────────────────────────────────────────── */
const ScrollReveal = {
  init() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('reveal--visible')); return; }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('reveal--visible')),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
  },
};


/* ── FaqAccordion ────────────────────────────────────────── */
const FaqAccordion = {
  init() {
    const items = document.querySelectorAll('.faq__item');
    items.forEach(item => {
      const q = item.querySelector('.faq__question');
      if (!q) return;
      const toggle = () => {
        const willOpen = !item.classList.contains('faq__item--open');
        items.forEach(i => {
          i.classList.remove('faq__item--open');
          i.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) { item.classList.add('faq__item--open'); q.setAttribute('aria-expanded', 'true'); }
      };
      q.addEventListener('click', toggle);
      q.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle()));
    });
  },
};


/* ── ContactForm ─────────────────────────────────────────── */
const ContactForm = {
  FORMSPREE_ID: 'YOUR_FORM_ID',   // ← wpisz swoje ID z formspree.io

  init() {
    const $ = id => document.getElementById(id);
    this.fields = {
      name: $('field-name'), email: $('field-email'),
      type: $('field-type'), service: $('field-service'), message: $('field-message'),
    };
    this.submitBtnEl = $('form-submit');
    this.toastEl     = $('toast');
    this.submitBtnEl?.addEventListener('click', () => this._handleSubmit());
  },

  async _handleSubmit() {
    this._clearErrors();
    const name  = this.fields.name?.value.trim()  ?? '';
    const email = this.fields.email?.value.trim() ?? '';
    if (!name)  { this._showFieldError('error-name',  'Podaj imię i nazwisko.');    return; }
    if (!email) { this._showFieldError('error-email', 'Podaj adres e-mail.');       return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this._showFieldError('error-email', 'Podaj poprawny adres e-mail.'); return; }

    this._setLoading(true);

    if (!this.FORMSPREE_ID || this.FORMSPREE_ID === 'YOUR_FORM_ID') {
      this._showToast('📞 Dziękujemy! Skontaktuj się z nami telefonicznie lub przez social media.');
      this._resetForm();
      this._setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`https://formspree.io/f/${this.FORMSPREE_ID}`, {
        method: 'POST', body: new FormData(document.getElementById('contact-form')),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) { this._showToast('✅ Wiadomość wysłana! Odezwiemy się wkrótce.'); this._resetForm(); }
      else this._showToast('❌ Błąd: ' + (data?.errors?.map(e => e.message).join(', ') ?? 'Spróbuj ponownie.'));
    } catch {
      this._showToast('❌ Brak połączenia. Sprawdź internet i spróbuj ponownie.');
    } finally {
      this._setLoading(false);
    }
  },

  _showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('form-error--visible');
    document.getElementById(id.replace('error-', 'field-'))?.classList.add('form-input--error');
  },

  _clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; el.classList.remove('form-error--visible'); });
    document.querySelectorAll('.form-input--error').forEach(el => el.classList.remove('form-input--error'));
  },

  _setLoading(on) {
    if (!this.submitBtnEl) return;
    this.submitBtnEl.disabled    = on;
    this.submitBtnEl.textContent = on ? '⏳ Wysyłanie...' : '🚀 Rozpocznij projekt';
  },

  _showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('toast--visible');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => this.toastEl.classList.remove('toast--visible'), 5000);
  },

  _resetForm() {
    Object.values(this.fields).forEach(f => f && (f.value = ''));
  },
};


/* ── HeroParallax ────────────────────────────────────────── */
const HeroParallax = {
  init() {
    const el = document.querySelector('.hero__grid-bg');
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.addEventListener('scroll', () => { el.style.transform = `translateY(${window.scrollY * 0.3}px)`; }, { passive: true });
  },
};


/* ── Reviews ─────────────────────────────────────────────── */
const Reviews = {
  STORAGE_KEY: 'smartweb_reviews_v3',
  ADMIN_KEY:   'smartweb_admin_session',
  ADMIN_HASH:  '41374ccaeb59ae841789f051500122b8092d7df3a6400bf6a529960f5ad478b6',

  selectedRating: 0,
  isAdmin:        false,
  _toastTimeout:  null,

  defaultReviews: [],

  init() {
    const $ = id => document.getElementById(id);
    this.listEl   = $('reviews-list');
    this.nameEl   = $('review-name-input');
    this.msgEl    = $('review-message-input');
    this.submitEl = $('review-submit');
    this.labelEl  = document.querySelector('#reviews .section-label');
    this.starEls  = document.querySelectorAll('.star-btn');
    if (!this.listEl) return;
    try { if (!localStorage.getItem(this.STORAGE_KEY)) localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultReviews)); } catch {}
    this.isAdmin = sessionStorage.getItem(this.ADMIN_KEY) === '1';
    this._renderAll();
    this.labelEl?.classList.toggle('section-label--admin', this.isAdmin);
    this._initStarRating();
    this._initHiddenTrigger();
    this.submitEl?.addEventListener('click', () => this._handleSubmit());
  },

  _initHiddenTrigger() {
    if (!this.labelEl) return;
    let n = 0, t;
    this.labelEl.addEventListener('click', () => {
      clearTimeout(t);
      if (++n >= 3) { n = 0; this._toggleAdmin(); }
      else t = setTimeout(() => n = 0, 900);
    });
  },

  async _toggleAdmin() {
    if (this.isAdmin) {
      this.isAdmin = false;
      sessionStorage.removeItem(this.ADMIN_KEY);
      this._renderAll();
      this.labelEl?.classList.toggle('section-label--admin', this.isAdmin);
      return;
    }
    const pass = prompt('Hasło:');
    if (pass === null) return;
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
    const hex  = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== this.ADMIN_HASH) { this._toast('❌ Błędne hasło.'); return; }
    this.isAdmin = true;
    sessionStorage.setItem(this.ADMIN_KEY, '1');
    this._toast('🔓 Tryb admina aktywny — możesz usuwać opinie.');
    this._renderAll();
    this.labelEl?.classList.toggle('section-label--admin', this.isAdmin);
  },

  _renderAll() {
    this.listEl.innerHTML = '';
    try {
      const reviews = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      if (reviews.length === 0) {
        this.listEl.innerHTML = `
          <div class="reviews__empty">
            <p class="reviews__empty-title">Bądź pierwszy!</p>
            <p class="reviews__empty-text">Jeszcze nie mamy opinii — jeśli współpracowałeś z nami lub znasz naszą pracę, zostaw krótki komentarz. To dla nas ogromna pomoc na początku drogi. 🙏</p>
          </div>`;
      } else {
        reviews.forEach(r => this._renderCard(r));
      }
    } catch {}
  },

  _renderCard(r) {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const card  = document.createElement('div');
    card.className  = 'review-card';
    card.dataset.id = r.id;
    card.innerHTML  = `
      <div class="review-card__header">
        <div class="review-card__avatar review-card__avatar--${r.avatarColor || 'cn'}">${this._esc(r.initials)}</div>
        <div class="review-card__meta">
          <span class="review-card__name">${this._esc(r.name)}</span>
          <span class="review-card__stars">${stars} ${r.rating}/5</span>
        </div>
        ${this.isAdmin ? '<button class="review-card__delete" title="Usuń">✕</button>' : ''}
      </div>
      <p class="review-card__text">„${this._esc(r.text)}"</p>`;
    if (this.isAdmin)
      card.querySelector('.review-card__delete').addEventListener('click', () => this._deleteReview(r.id, card));
    this.listEl.appendChild(card);
  },

  _deleteReview(id, el) {
    if (!confirm('Usunąć tę opinię?')) return;
    try {
      localStorage.setItem(this.STORAGE_KEY,
        JSON.stringify(JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]').filter(r => r.id !== id)));
    } catch {}
    Object.assign(el.style, { transition: 'opacity .3s,transform .3s', opacity: 0, transform: 'translateX(-16px)' });
    setTimeout(() => el.remove(), 320);
    this._toast('🗑️ Opinia usunięta.');
  },

  _initStarRating() {
    this.starEls.forEach((s, i) => {
      s.addEventListener('click',      () => { this.selectedRating = i + 1; this._updateStars(i + 1); });
      s.addEventListener('mouseenter', () => this._updateStars(i + 1));
      s.addEventListener('mouseleave', () => this._updateStars(this.selectedRating));
    });
  },

  _updateStars(n) {
    this.starEls.forEach((s, i) => { s.textContent = i < n ? '★' : '☆'; s.classList.toggle('star-btn--active', i < n); });
  },

  _handleSubmit() {
    const name = this.nameEl?.value.trim() ?? '';
    const text = this.msgEl?.value.trim()  ?? '';
    if (!name)                { this._toast('⚠️ Podaj swoje imię.');        return; }
    if (!this.selectedRating) { this._toast('⚠️ Wybierz gwiazdki.');        return; }
    if (!text)                { this._toast('⚠️ Napisz swoją opinię.');     return; }
    const initials = name.split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
    const r = { id: 'u_' + Date.now(), name, initials, rating: this.selectedRating, text, avatarColor: 'cn' };
    try {
      const list = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...list, r]));
    } catch {}
    this._renderCard(r);
    setTimeout(() => this.listEl.scrollTop = this.listEl.scrollHeight, 60);
    if (this.nameEl) this.nameEl.value = '';
    if (this.msgEl)  this.msgEl.value  = '';
    this.selectedRating = 0;
    this._updateStars(0);
    this._toast('✅ Dziękujemy! Twoja opinia została dodana.');
  },

  _toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('toast--visible');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => el.classList.remove('toast--visible'), 4500);
  },

  _esc: s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]),
};


/* ── MobileCtaBar ────────────────────────────────────────── */
const MobileCtaBar = {
  init() {
    const bar     = document.getElementById('mobile-cta-bar');
    const contact = document.getElementById('contact');
    if (!bar || !contact) return;
    window.addEventListener('scroll', () => {
      const hide = contact.getBoundingClientRect().top < window.innerHeight * 0.8;
      Object.assign(bar.style, { transition: 'transform .3s,opacity .3s', transform: hide ? 'translateY(100%)' : '', opacity: hide ? '0' : '' });
    }, { passive: true });
  },
};


/* ── StatCounter ─────────────────────────────────────────── */
const StatCounter = {
  init() {
    const els = document.querySelectorAll('.about__stat-number[data-target]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        this._animate(e.target);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  },

  _animate(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2800;
    const start    = performance.now();
    const tick = now => {
      const p     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};


/* ── NavActiveLink ───────────────────────────────────────── */
const NavActiveLink = {
  init() {
    const links = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const sectionMap = new Map();
    links.forEach(link => {
      const section = document.getElementById(link.getAttribute('href').slice(1));
      if (section) sectionMap.set(section, link);
    });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const link = sectionMap.get(e.target);
        if (link) link.classList.toggle('nav--active', e.isIntersecting);
      });
    }, { threshold: 0.25, rootMargin: '-64px 0px -30% 0px' });

    sectionMap.forEach((_, section) => obs.observe(section));
  },
};


/* ── ExitPopup ───────────────────────────────────────────── */
const ExitPopup = {
  SESSION_KEY: 'smartweb_popup_shown',

  init() {
    if (sessionStorage.getItem(this.SESSION_KEY)) return;

    const overlay  = document.getElementById('exit-popup');
    const closeBtn = document.getElementById('popup-close');
    const submitBtn = document.getElementById('popup-submit');
    if (!overlay) return;

    const show = () => {
      if (sessionStorage.getItem(this.SESSION_KEY)) return;
      sessionStorage.setItem(this.SESSION_KEY, '1');
      overlay.classList.add('popup-overlay--visible');
    };

    const hide = () => overlay.classList.remove('popup-overlay--visible');

    // Desktop: kursor opuszcza okno przeglądarki
    document.addEventListener('mouseleave', e => {
      if (e.clientY <= 0 || e.relatedTarget === null) show();
    }, { once: true });

    // Mobile: po 20 sekundach
    if (window.matchMedia('(hover: none)').matches) {
      setTimeout(show, 20000);
    }

    // Zamknięcie
    closeBtn?.addEventListener('click', hide);
    overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });

    // Klik CTA – zamknij popup i przewiń do kontaktu
    submitBtn?.addEventListener('click', hide);
  },
};


/* ── init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  CustomCursor.init();
  Navbar.init();
  MobileMenu.init();
  ServiceCardGlow.init();
  ScrollReveal.init();
  FaqAccordion.init();
  ContactForm.init();
  HeroParallax.init();
  Reviews.init();
  MobileCtaBar.init();
  ExitPopup.init();
  StatCounter.init();
  NavActiveLink.init();
});
