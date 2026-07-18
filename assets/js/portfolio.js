/* ==========================================================================
   PORTFOLIO JAVASCRIPT - FILTERING, SLIDER, AND LIGHTBOX
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilter();
  initBeforeAfterSlider();
  initLightbox();
});

/* --- PORTFOLIO CATEGORY FILTERING --- */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  if (filterButtons.length === 0 || portfolioItems.length === 0) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and add to clicked
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category').split(' ');

        if (filterValue === 'all' || itemCategories.includes(filterValue)) {
          item.style.display = 'block';
          // Smooth fade-in
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          // Wait for transition before hiding
          setTimeout(() => {
            item.style.display = 'none';
          }, 400);
        }
      });
    });
  });
}

/* --- BEFORE/AFTER SLIDER INTERACTION --- */
function initBeforeAfterSlider() {
  const container = document.querySelector('.before-after-container');
  if (!container) return;

  const afterImg = container.querySelector('.img-after');
  const handle = container.querySelector('.slider-handle');
  let isDragging = false;

  const dragSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    
    // Clamp between 0% and 100%
    percentage = Math.max(0, Math.min(100, percentage));

    // Update image width and handle position
    afterImg.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  // Mouse events
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragSlider(e.clientX);
  });

  // Touch events for mobile compatibility
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      dragSlider(e.touches[0].clientX);
    }
  });

  // Optional: support clicking anywhere on slider to jump to position
  container.addEventListener('click', (e) => {
    if (e.target === handle || handle.contains(e.target)) return;
    dragSlider(e.clientX);
  });
}

/* --- IMMERSIVE GALLERY LIGHTBOX --- */
function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  
  const galleryTriggers = document.querySelectorAll('[data-gallery-src]');
  let activeGallery = [];
  let currentIndex = 0;

  // Build active items array based on visibility
  const updateActiveGallery = () => {
    activeGallery = [];
    galleryTriggers.forEach(trigger => {
      // Find the closest portfolio item ancestor
      const portfolioItem = trigger.closest('.portfolio-item');
      // Only include images that are currently visible in the grid (not filtered out)
      if (!portfolioItem || portfolioItem.style.display !== 'none') {
        activeGallery.push({
          src: trigger.getAttribute('data-gallery-src'),
          title: trigger.getAttribute('data-gallery-title') || '',
          meta: trigger.getAttribute('data-gallery-meta') || ''
        });
      }
    });
  };

  const openLightbox = (index) => {
    updateActiveGallery();
    // Find index of clicked item in the visible set
    const clickedSrc = galleryTriggers[index].getAttribute('data-gallery-src');
    currentIndex = activeGallery.findIndex(item => item.src === clickedSrc);
    if (currentIndex === -1) currentIndex = 0;

    showImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scroll
  };

  const showImage = (index) => {
    if (activeGallery.length === 0) return;
    const item = activeGallery[index];
    lightboxImg.src = item.src;
    lightboxCaption.innerHTML = `<strong>${item.title}</strong><br><span style="font-size:0.85em; opacity:0.6">${item.meta}</span>`;
  };

  const nextImage = () => {
    if (activeGallery.length === 0) return;
    currentIndex = (currentIndex + 1) % activeGallery.length;
    showImage(currentIndex);
  };

  const prevImage = () => {
    if (activeGallery.length === 0) return;
    currentIndex = (currentIndex - 1 + activeGallery.length) % activeGallery.length;
    showImage(currentIndex);
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
    setTimeout(() => {
      lightboxImg.src = '';
    }, 400);
  };

  // Bind triggers
  galleryTriggers.forEach((trigger, idx) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  // Event listeners
  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', nextImage);
  prevBtn.addEventListener('click', prevImage);

  // Close when clicking outside of image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
}
