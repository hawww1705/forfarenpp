/* ==========================================================================
   MAIN JAVASCRIPT - SCROLL THEMES, REVEALS, AND STATS COUNTERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initStatsCounter();
  initScrollColorMorph();
  initBackToTop();
});

/* --- MOBILE NAVIGATION & NAVBAR SCROLL --- */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Change navbar appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Toggle mobile navigation menu
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      hamburger.classList.toggle('active');
      // Simple accessibility states
      const isActive = mainNav.classList.contains('active');
      hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active Link Highlighter based on page path
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --- SCROLL-REVEAL INTERSECTION OBSERVER --- */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once animated to prevent repeat trigger
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* --- ANIMATED STATISTICS COUNTER --- */
function initStatsCounter() {
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;

  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const countUp = () => {
    statNumbers.forEach(stat => {
      const targetVal = parseFloat(stat.getAttribute('data-target'));
      const format = stat.getAttribute('data-format') || 'integer'; // 'integer', 'float', 'text'
      const prefix = stat.getAttribute('data-prefix') || '';
      const suffix = stat.getAttribute('data-suffix') || '';
      
      let currentVal = 0;
      const duration = 2000; // 2 seconds
      const frameRate = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameRate);
      let currentFrame = 0;

      const animate = () => {
        currentFrame++;
        const progress = currentFrame / totalFrames;
        // Ease-out cubic curve
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        currentVal = targetVal * easeProgress;

        if (format === 'float') {
          stat.textContent = prefix + currentVal.toFixed(1) + suffix;
        } else {
          stat.textContent = prefix + Math.floor(currentVal).toLocaleString() + suffix;
        }

        if (currentFrame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          stat.textContent = prefix + (format === 'float' ? targetVal.toFixed(1) : targetVal.toLocaleString()) + suffix;
        }
      };

      animate();
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        countUp();
        animated = true;
        observer.unobserve(statsSection);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

/* --- DYNAMIC GRADUAL BG COLOR SCROLL INTERPOLATION --- */
function initScrollColorMorph() {
  const transitionSection = document.querySelector('.scroll-transition-section');
  if (!transitionSection) return;

  // Colors mapping:
  // Construction Phase (Start of scroll) -> White background, dark text
  const startBg = { r: 255, g: 255, b: 255 };
  const startText = { r: 17, g: 17, b: 17 };
  const startAccent = { r: 51, g: 51, b: 51 };
  const startBorder = { r: 0, g: 0, b: 0, a: 0.08 };

  // Interior Phase (End of scroll) -> Warm cream/beige background, warm dark charcoal text
  const endBg = { r: 244, g: 239, b: 235 };
  const endText = { r: 43, g: 37, b: 32 };
  const endAccent = { r: 143, g: 129, b: 114 };
  const endBorder = { r: 43, g: 37, b: 32, a: 0.12 };

  const handleScrollTheme = () => {
    const rect = transitionSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // We start morphing when the top of the transition section crosses the middle of the viewport
    // and finish morphing when the bottom is near the viewport top.
    const startScrollY = rect.top + window.scrollY - viewportHeight;
    const endScrollY = rect.bottom + window.scrollY - viewportHeight;
    const totalScrollRange = endScrollY - startScrollY;
    
    let progress = (window.scrollY - startScrollY) / totalScrollRange;
    progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1

    // Interpolate colors
    const rBg = Math.round(startBg.r + (endBg.r - startBg.r) * progress);
    const gBg = Math.round(startBg.g + (endBg.g - startBg.g) * progress);
    const bBg = Math.round(startBg.b + (endBg.b - startBg.b) * progress);

    const rText = Math.round(startText.r + (endText.r - startText.r) * progress);
    const gText = Math.round(startText.g + (endText.g - startText.g) * progress);
    const bText = Math.round(startText.b + (endText.b - startText.b) * progress);

    const rAccent = Math.round(startAccent.r + (endAccent.r - startAccent.r) * progress);
    const gAccent = Math.round(startAccent.g + (endAccent.g - startAccent.g) * progress);
    const bAccent = Math.round(startAccent.b + (endAccent.b - startAccent.b) * progress);

    const aBorder = startBorder.a + (endBorder.a - startBorder.a) * progress;

    // Apply color settings to CSS Variables on document root
    const root = document.documentElement;
    root.style.setProperty('--bg-color', `rgb(${rBg}, ${gBg}, ${bBg})`);
    root.style.setProperty('--text-color', `rgb(${rText}, ${gText}, ${bText})`);
    root.style.setProperty('--accent-color', `rgb(${rAccent}, ${gAccent}, ${bAccent})`);
    root.style.setProperty('--border-color', `rgba(43, 37, 32, ${aBorder.toFixed(2)})`);

    // Handle branding/logo highlight switches in header nav
    const body = document.body;
    if (progress > 0.5) {
      body.classList.add('theme-interior');
      body.classList.remove('theme-construction');
      body.classList.add('interior-nav');
      body.classList.remove('dark-nav');
    } else {
      body.classList.remove('theme-interior');
      body.classList.add('theme-construction');
      body.classList.remove('interior-nav');
      // For construction hero / start of page, we want a dark navigation bar
      if (window.scrollY < viewportHeight - 100) {
        body.classList.add('dark-nav');
      } else {
        body.classList.remove('dark-nav');
      }
    }
  };

  // Run on scroll and resize, and trigger initial run
  window.addEventListener('scroll', handleScrollTheme);
  window.addEventListener('resize', handleScrollTheme);
  handleScrollTheme();
}

/* --- BACK TO TOP & FLOATING WIDGETS --- */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.widget-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
