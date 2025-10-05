document.documentElement.classList.add('has-js');

const navLinks = document.querySelectorAll('[data-nav-link]');
const sections = Array.from(document.querySelectorAll('[data-section]'));

if (navLinks.length && sections.length) {
  let currentSectionId = '';

  const setActiveLink = id => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const syncActiveSection = () => {
    if (!sections.length) return;

    const targetLine = window.innerHeight * 0.3;
    let activeId = sections[0].getAttribute('id') || '';

    for (const section of sections) {
      const id = section.getAttribute('id');
      if (!id) continue;

      const rect = section.getBoundingClientRect();
      if (rect.top <= targetLine) {
        activeId = id;
      } else {
        break;
      }
    }

    if (!activeId || activeId === currentSectionId) return;

    currentSectionId = activeId;
    setActiveLink(activeId);

    if (window.location.hash !== `#${activeId}`) {
      history.replaceState(null, '', `#${activeId}`);
    }
  };

  let ticking = false;
  const requestSync = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      syncActiveSection();
      ticking = false;
    });
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
      requestSync();
    },
    {
      rootMargin: '0px 0px -5% 0px',
      threshold: 0,
    }
  );

  const preloadOffset = window.innerHeight * 0.9;

  sections.forEach(section => {
    observer.observe(section);
    if (section.getBoundingClientRect().top < preloadOffset) {
      section.classList.add('is-visible');
    }
  });

  requestSync();
  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
}

const scrollTopBtn = document.querySelector('[data-scrolltop]');
if (scrollTopBtn) {
  const toggleScrollTop = () => {
    const show = window.scrollY > 220;
    scrollTopBtn.classList.toggle('is-visible', show);
  };

  toggleScrollTop();
  window.addEventListener('scroll', toggleScrollTop, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const commandPalettes = document.querySelectorAll('[data-clipboard]');
commandPalettes.forEach(area => {
  const button = area.querySelector('button');
  if (!button) return;

  button.addEventListener('click', () => {
    const text = area.dataset.clipboard || '';
    if (!navigator.clipboard) {
      button.dataset.state = 'error';
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        button.dataset.state = 'copied';
        setTimeout(() => {
          button.dataset.state = 'idle';
        }, 2000);
      })
      .catch(() => {
        button.dataset.state = 'error';
        setTimeout(() => {
          button.dataset.state = 'idle';
        }, 2000);
      });
  });
});

const carousels = document.querySelectorAll('[data-carousel]');
carousels.forEach(carousel => {
  const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
  if (slides.length <= 1) return;

  let index = slides.findIndex(slide => slide.hasAttribute('data-active'));
  if (index === -1) {
    index = 0;
    slides[0].setAttribute('data-active', '');
  }

  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));

  const setActive = newIndex => {
    slides[index].removeAttribute('data-active');
    slides[newIndex].setAttribute('data-active', '');
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === newIndex);
    });
    index = newIndex;
  };

  prevBtn?.addEventListener('click', () => {
    const newIndex = (index - 1 + slides.length) % slides.length;
    setActive(newIndex);
  });

  nextBtn?.addEventListener('click', () => {
    const newIndex = (index + 1) % slides.length;
    setActive(newIndex);
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      if (dotIndex === index) return;
      setActive(dotIndex);
    });
  });
});

const modal = document.querySelector('[data-modal]');
if (modal) {
  const modalImage = modal.querySelector('[data-modal-image]');
  const dotsContainer = modal.querySelector('[data-modal-dots]');
  const caption = modal.querySelector('[data-modal-caption]');
  const prev = modal.querySelector('[data-modal-prev]');
  const next = modal.querySelector('[data-modal-next]');
  const closers = modal.querySelectorAll('[data-modal-close]');

  let gallery = [];
  let current = 0;

  const renderDots = () => {
    dotsContainer.innerHTML = '';
    gallery.forEach((_, idx) => {
      const dot = document.createElement('button');
      if (idx === current) dot.classList.add('active');
      dot.addEventListener('click', () => setSlide(idx));
      dotsContainer.appendChild(dot);
    });
    dotsContainer.parentElement.classList.toggle('has-multi', gallery.length > 1);
  };

  const setSlide = index => {
    current = index;
    const { src, alt } = gallery[current];
    modalImage.src = src;
    modalImage.alt = alt;
    caption.textContent = alt;
    Array.from(dotsContainer.children).forEach((dot, idx) => {
      dot.classList.toggle('active', idx === current);
    });
  };

  const openModal = items => {
    gallery = items;
    current = 0;
    renderDots();
    setSlide(0);
    modal.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    const multi = gallery.length > 1;
    prev.style.display = multi ? 'grid' : 'none';
    next.style.display = multi ? 'grid' : 'none';
    dotsContainer.style.display = multi ? 'flex' : 'none';
  };

  const closeModal = () => {
    modal.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    gallery = [];
  };

  prev.addEventListener('click', () => {
    if (!gallery.length) return;
    const nextIndex = (current - 1 + gallery.length) % gallery.length;
    setSlide(nextIndex);
  });

  next.addEventListener('click', () => {
    if (!gallery.length) return;
    const nextIndex = (current + 1) % gallery.length;
    setSlide(nextIndex);
  });

  closers.forEach(btn => btn.addEventListener('click', closeModal));
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (modal.hasAttribute('hidden')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') prev.click();
    if (event.key === 'ArrowRight') next.click();
  });

  const buildGallery = card => {
    const title = card.querySelector('.card-title')?.textContent.trim() || '';
    const carouselSlides = card.querySelectorAll('.carousel [data-carousel-slide]');
    if (carouselSlides.length) {
      return Array.from(carouselSlides).map(img => ({ src: img.src, alt: img.alt || title }));
    }
    const images = card.querySelectorAll('.card-media img');
    if (images.length) {
      return Array.from(images).map(img => ({ src: img.src, alt: img.alt || title }));
    }
    return [];
  };

  const galleryButtons = document.querySelectorAll('[data-gallery-open]');
  galleryButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const card = button.closest('.card');
      if (!card) return;
      const items = buildGallery(card);
      if (!items.length) return;
      openModal(items);
    });
  });

  document.querySelectorAll('.card-media img, .carousel img').forEach(img => {
    img.addEventListener('click', () => {
      const card = img.closest('.card');
      if (!card) return;
      const items = buildGallery(card);
      if (!items.length) return;
      const index = Array.from(card.querySelectorAll('.carousel [data-carousel-slide], .card-media img')).findIndex(el => el === img);
      openModal(items);
      if (index > 0) setSlide(index);
    });
  });
}

const brand = document.querySelector('.brand');
const navbar = document.querySelector('.navbar');
if (brand && navbar) {
  let lastScroll = window.scrollY;
  let hidden = false;

  const hide = () => {
    if (hidden) return;
    navbar.classList.add('navbar--brand-hidden');
    requestAnimationFrame(() => {
      brand.classList.add('brand--hidden');
    });
    hidden = true;
  };

  const show = () => {
    if (!hidden) return;
    brand.classList.remove('brand--hidden');
    requestAnimationFrame(() => {
      navbar.classList.remove('navbar--brand-hidden');
    });
    hidden = false;
  };

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const distanceToBottom = maxScroll - current;

    if (current < 0) {
      lastScroll = 0;
      return;
    }

    if (distanceToBottom <= 48) {
      show();
      lastScroll = current;
      return;
    }

    if (!hidden && current > 200 && current > lastScroll) {
      hide();
    }
    if (hidden && (current < 120 || current < lastScroll)) {
      show();
    }
    lastScroll = current;
  }, { passive: true });
}
