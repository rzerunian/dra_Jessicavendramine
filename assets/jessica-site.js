(() => {
  'use strict';

  const SITE_CONFIG = Object.freeze({
    email: 'contato@jessicavendramine.com.br',
    formEndpoint: 'https://formspree.io/f/xgawkndg',
    whatsapp: '5521996367433',
    whatsappMessage: 'Olá, entrei no seu site e gostaria de obter mais informações sobre o atendimento.'
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  document.documentElement.classList.add('js');
  $$('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  const revealTargets = $$('.reveal, .reveal-sec12, .animate-on-scroll, [data-process], .family-visual');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active', 'animate');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add('active', 'animate'));
  }

  const header = $('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 48);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const menuButton = $('.menu-toggle');
  const primaryNav = $('#primary-nav');
  const closeMenu = () => {
    primaryNav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
  };
  menuButton?.addEventListener('click', () => {
    const isOpen = !primaryNav?.classList.contains('is-open');
    primaryNav?.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.nav-link, .brand-mark', header || document).forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (primaryNav?.classList.contains('is-open') && !header?.contains(event.target)) closeMenu();
  });

  const glow = $('.cursor-glow');
  if (glow && !reducedMotion && matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  $$('.flashlight-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - bounds.top}px`);
    });
  });

  if (!reducedMotion && matchMedia('(pointer:fine)').matches) {
    let ticking = false;
    const parallaxTargets = $$('.parallax-element, .parallax-img');
    const applyParallax = () => {
      const viewportCenter = window.innerHeight / 2;
      parallaxTargets.forEach((target) => {
        const speed = Number(target.dataset.speed || 0.02);
        const bounds = target.getBoundingClientRect();
        const offset = (bounds.top + bounds.height / 2 - viewportCenter) * speed;
        target.style.translate = `0 ${offset.toFixed(2)}px`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
    applyParallax();
  }

  $$('[data-accordion] .accordion-item').forEach((item) => {
    const trigger = $('button', item);
    trigger?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.accordion-item.is-open').forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove('is-open');
        $('button', openItem)?.setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const modal = $('#contact-modal');
  const firstField = modal ? $('input', modal) : null;
  let modalReturnFocus = null;
  const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const openModal = (trigger) => {
    if (!modal) return;
    modalReturnFocus = trigger || document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.setTimeout(() => firstField?.focus(), 80);
  };
  const closeModal = () => {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalReturnFocus?.focus?.();
  };
  $$('[data-open-contact]').forEach((trigger) => trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(trigger);
  }));
  $$('[data-close-modal]').forEach((trigger) => trigger.addEventListener('click', closeModal));
  modal?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
    if (event.key !== 'Tab') return;
    const focusable = $$(focusableSelector, modal);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  let toastTimer;
  const showToast = (message) => {
    const toast = $('[data-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
  };

  $('[data-contact-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const error = $('.form-error', form);
    const submitButton = $('.submit-button', form);
    const submitLabel = $('span', submitButton);
    if (!form.checkValidity()) {
      error.textContent = 'Revise os campos obrigatórios e confirme o consentimento.';
      error.classList.add('visible');
      form.reportValidity();
      return;
    }
    error.classList.remove('visible');
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Enviando...';
    try {
      const response = await fetch(SITE_CONFIG.formEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`Formspree respondeu com status ${response.status}.`);
      form.reset();
      closeModal();
      showToast('Solicitação enviada com sucesso. Retornaremos pelo contato informado.');
    } catch (submissionError) {
      console.error('Não foi possível enviar o formulário.', submissionError);
      error.textContent = 'Não foi possível enviar agora. Tente novamente ou use o WhatsApp ou o e-mail profissional.';
      error.classList.add('visible');
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitLabel.textContent = 'Solicitar contato';
    }
  });

  $$('[data-whatsapp]').forEach((trigger) => trigger.addEventListener('click', (event) => {
      if (SITE_CONFIG.whatsapp) {
        const number = SITE_CONFIG.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`, '_blank', 'noopener,noreferrer');
        return;
      }
      openModal(event.currentTarget);
      showToast('O número profissional será conectado antes da publicação.');
  }));
  $$('[data-channel-pending]').forEach((trigger) => trigger.addEventListener('click', () => {
    showToast('Este canal profissional será publicado antes do lançamento.');
  }));

  const cookieBanner = $('[data-cookie-banner]');
  const cookieKey = 'jv-cookie-notice-v1';
  const hasCookieChoice = (() => {
    try { return localStorage.getItem(cookieKey) === 'acknowledged'; }
    catch { return false; }
  })();
  if (!hasCookieChoice) window.setTimeout(() => cookieBanner?.classList.add('visible'), 700);
  $('[data-cookie-accept]')?.addEventListener('click', () => {
    try { localStorage.setItem(cookieKey, 'acknowledged'); } catch { /* storage may be unavailable */ }
    cookieBanner?.classList.remove('visible');
  });
  $$('[data-cookie-settings]').forEach((trigger) => trigger.addEventListener('click', () => cookieBanner?.classList.add('visible')));
})();
