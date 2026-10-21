/* ============================================
   Маникюр у Татьяны — скрипты
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Header scroll effect ----
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ---- Mobile burger menu ----
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  // Close menu on link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  // ---- Lightbox gallery ----
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const images = [];
  const captions = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const cap = item.querySelector('figcaption');
    images.push(img.src);
    captions.push(cap ? cap.textContent : '');
    item.addEventListener('click', () => openLightbox(index));
  });

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lbImg.src = images[index];
    lbCaption.textContent = captions[index];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lbImg.src = images[currentIndex];
    lbCaption.textContent = captions[currentIndex];
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lbImg.src = images[currentIndex];
    lbCaption.textContent = captions[currentIndex];
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // ---- Phone mask ----
  const phoneInput = document.querySelector('input[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let formatted = '+7';
      if (v.length > 1) formatted += ' (' + v.slice(1, 4);
      if (v.length >= 4) formatted += ') ' + v.slice(4, 7);
      if (v.length >= 7) formatted += '-' + v.slice(7, 9);
      if (v.length >= 9) formatted += '-' + v.slice(9, 11);
      e.target.value = formatted;
    });
  }

  // ---- Form submission ----
  // ---- Smooth appearance on scroll ----
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.benefit, .price-card, .review-card, .gallery-item, .about__img, .about__text, .contact-block, .cta__form').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
    observer.observe(el);
  });

});
