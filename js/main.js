// main.js - Core Javascript Interactivity

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initClientTabs();
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

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

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

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

/**
 * Interactive Client Assistant Tab Switching
 */
function initClientTabs() {
  const tabBtns = document.querySelectorAll('.client-tab-btn');
  const tabContents = document.querySelectorAll('.client-content');
  
  if (tabBtns.length === 0 || tabContents.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetOS = btn.dataset.os; // win, mac, ios, android
      
      // Toggle button active state
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle active content panel
      tabContents.forEach(content => {
        if (content.id === `client-content-${targetOS}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
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

      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        }
      });

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

  let currentCategory = 'all';
  let activeTag = 'all';

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.filter;
      applyFiltersAndSort();
    });
  });

  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tagBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.dataset.tag;
      applyFiltersAndSort();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFiltersAndSort();
    });
  }

  function applyFiltersAndSort() {
    let visibleItems = items.filter(item => {
      const categoryMatch = currentCategory === 'all' || item.dataset.category === currentCategory;
      
      let tagMatch = activeTag === 'all';
      if (!tagMatch && item.dataset.tags) {
        const itemTags = item.dataset.tags.split(',');
        tagMatch = itemTags.includes(activeTag);
      }

      const isVisible = categoryMatch && tagMatch;
      item.style.display = isVisible ? 'grid' : 'none';
      return isVisible;
    });

    if (sortSelect) {
      const sortBy = sortSelect.value;
      
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
