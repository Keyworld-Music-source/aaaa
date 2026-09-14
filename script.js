
(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.navlinks');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.innerHTML = open ? '<span aria-hidden="true">×</span>' : '<span aria-hidden="true">☰</span>';
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      menu.innerHTML='<span aria-hidden="true">☰</span>'; menu.setAttribute('aria-label','Open navigation');
    }));
  }

  document.addEventListener('click', e => {
    if (nav && menu && nav.classList.contains('open') && !nav.contains(e.target) && !menu.contains(e.target)) {
      nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.innerHTML='<span aria-hidden="true">☰</span>'; menu.setAttribute('aria-label','Open navigation');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.innerHTML='<span aria-hidden="true">☰</span>'; menu.setAttribute('aria-label','Open navigation'); }
  });

  // Highlight the current page automatically, including course and programme pages.
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto')) return;
    const clean = href.split('?')[0].split('/').pop();
    if (clean === current) a.classList.add('active');
    if (current.startsWith('level-') && clean === 'courses.html') a.classList.add('active');
    if (current && location.pathname.includes('/courses/') && clean === 'courses.html') a.classList.add('active');
  });

  // Premium scroll reveal, with a safe fallback for reduced-motion users.
  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -45px'});
    reveal.forEach(el => observer.observe(el));
  } else reveal.forEach(el => el.classList.add('visible'));

  // Header depth on scroll.
  const header = document.querySelector('.header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 16);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  // Gentle pointer glow on desktop for a premium interactive feel.
  if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const glow = document.createElement('div');
    glow.className='pointer-glow';
    document.body.appendChild(glow);
    window.addEventListener('pointermove', e => {
      glow.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;
    }, {passive:true});
  }

  // Prefill admission selections from course/programme links.
  const params = new URLSearchParams(location.search);
  const programme = params.get('programme');
  const instrument = params.get('instrument');
  const programmeSelect = document.querySelector('#programme');
  const instrumentSelect = document.querySelector('#instrument');
  if (programmeSelect && programme) {
    const key = programme.toLowerCase();
    const aliases = {
      'level-1-foundation':'level 1',
      'level-2-intermediate':'level 2',
      'level-3-advanced':'level 3'
    };
    const needle = aliases[key] || key.replaceAll('-',' ');
    [...programmeSelect.options].forEach(o => {
      if (o.textContent.toLowerCase().includes(needle)) programmeSelect.value=o.value;
    });
  }
  if (instrumentSelect && instrument) {
    const key = instrument.toLowerCase().replaceAll('-',' ');
    [...instrumentSelect.options].forEach(o => {
      if (o.textContent.toLowerCase().replaceAll('&','and').includes(key)) instrumentSelect.value=o.value;
    });
  }

  // Animated impact counters. Keep verified institute figures here before launch.
  const counters = document.querySelectorAll('.counter[data-target]');
  const animateCounter = el => {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    const duration = target > 100 ? 3600 : 3000;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, {threshold:0.45});
      counters.forEach(el => counterObserver.observe(el));
    } else {
      counters.forEach(el => {
        el.textContent = Number(el.dataset.target).toLocaleString() + (el.dataset.suffix || '');
      });
    }
  }

  // Enrollment form -> WhatsApp.
  window.enrollToWhatsApp = function(e) {
    e.preventDefault();
    const f=e.currentTarget, data=new FormData(f);
    const msg=`Hello Keyworld Music Institute, I would like to enroll.\n\nName: ${data.get('name')}\nAge: ${data.get('age')}\nProgramme: ${data.get('programme')}\nInstrument/Training Area: ${data.get('instrument')}\nLocation/Mode: ${data.get('mode')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email')}\nMessage: ${data.get('message')||'N/A'}`;
    window.open('https://wa.me/2347045107482?text='+encodeURIComponent(msg),'_blank','noopener');
  };

  // Floating WhatsApp action.
  if (!document.querySelector('.floating-wa')) {
    const wa=document.createElement('a');
    wa.className='floating-wa';
    wa.href='https://wa.me/2347045107482';
    wa.target='_blank'; wa.rel='noopener';
    wa.setAttribute('aria-label','Chat with Keyworld Music Institute on WhatsApp');
    wa.innerHTML='<span>◉</span><b>Chat with us</b>';
    document.body.appendChild(wa);
  }
})();
