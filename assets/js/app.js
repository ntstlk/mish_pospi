const navLinks = document.querySelectorAll('[data-nav-link]');
const sections = Array.from(document.querySelectorAll('[data-section]'));

if (navLinks.length && sections.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
}

const scrollTopBtn = document.querySelector('[data-scrolltop]');
if (scrollTopBtn) {
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
