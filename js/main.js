// main.js - Core Javascript Interactivity

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initFaqs();
  initFiltersAndSorting();
  initReadingProgress();
  initTOC();
});

/**
 * Theme Toggle Functionality
 */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Retrieve theme preference from localStorage or check system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Handle click on theme switcher
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

/**
 * Mobile Navigation Menu
 */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

/**
 * Accordion FAQs Slide Animation
 */
function initFaqs() {
  const faqHeaders = document.querySelectorAll('.faq-header');
  
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        }
      });

      // Toggle current FAQ
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/**
 * VPN/Airport Comparison Filters and Interactive Sorting
 */
function initFiltersAndSorting() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tagBtns = document.querySelectorAll('.tag-btn');
  const sortSelect = document.getElementById('sortSelect');
  const compList = document.querySelector('.comp-list');
  const items = compList ? Array.from(compList.querySelectorAll('.comp-item')) : [];

  if (!compList || items.length === 0) return;

  let currentCategory = 'all'; // all, vpn, airport
  let activeTag = 'all'; // all, iplc, trojan, etc.

  // 1. Tab filter (All / VPN / Airport)
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.filter; // 'all', 'vpn', 'airport'
      applyFiltersAndSort();
    });
  });

  // 2. Tag filter buttons
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tagBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.dataset.tag; // 'all', 'iplc', 'trojan', etc.
      applyFiltersAndSort();
    });
  });

  // 3. Dropdown Sorting Selector
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFiltersAndSort();
    });
  }

  function applyFiltersAndSort() {
    // A. Filter Elements
    let visibleItems = items.filter(item => {
      // Category filter match
      const categoryMatch = currentCategory === 'all' || item.dataset.category === currentCategory;
      
      // Tag filter match
      let tagMatch = activeTag === 'all';
      if (!tagMatch && item.dataset.tags) {
        const itemTags = item.dataset.tags.split(',');
        tagMatch = itemTags.includes(activeTag);
      }

      const isVisible = categoryMatch && tagMatch;
      item.style.display = isVisible ? 'grid' : 'none';
      return isVisible;
    });

    // B. Sort Elements
    if (sortSelect) {
      const sortBy = sortSelect.value; // 'rating', 'speed', 'price-asc', 'price-desc'
      
      visibleItems.sort((a, b) => {
        if (sortBy === 'rating') {
          return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        } else if (sortBy === 'speed') {
          return parseFloat(b.dataset.speed) - parseFloat(a.dataset.speed);
        } else if (sortBy === 'price-asc') {
          return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        } else if (sortBy === 'price-desc') {
          return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        }
        return 0;
      });

      // C. Re-append items to update DOM order
      visibleItems.forEach(item => {
        compList.appendChild(item);
      });
    }
  }
}

/**
 * Reading Progress Indicator for article template
 */
function initReadingProgress() {
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (height > 0) {
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    } else {
      progressBar.style.width = '0%';
    }
  });
}

/**
 * Dynamic Table of Contents (TOC) Highlight
 */
function initTOC() {
  const tocItems = document.querySelectorAll('.toc-item');
  const headings = document.querySelectorAll('.article-body h2, .article-body h3');
  
  if (tocItems.length === 0 || headings.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (!id) return;
        
        tocItems.forEach(item => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  headings.forEach(heading => {
    // Generate IDs dynamically if they are missing
    if (!heading.getAttribute('id')) {
      const textId = heading.textContent
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/(^-|-$)/g, '');
      heading.setAttribute('id', textId);
    }
    observer.observe(heading);
  });
}
