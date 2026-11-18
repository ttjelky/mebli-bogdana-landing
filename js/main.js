// Меблі від Богдана — поведінка сторінки. Без залежностей.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Меню-бургер */
  var burger = $('#burger'), menu = $('#menu');
  var setMenu = function (open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  };
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-open') && !menu.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });

  /* Індикатор активного пункту, що переїжджає (лише на десктопі, де меню в рядок) */
  var pill = document.createElement('span');
  pill.className = 'menu__pill';
  pill.setAttribute('aria-hidden', 'true');
  menu.insertBefore(pill, menu.firstChild);
  var movePill = function (a) {
    if (!a || a.offsetParent === null) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  };

  /* Прокрутка: стиснення шапки, активний пункт, липка панель на телефоні */
  var links = $$('#menu a[href^="#"]');
  var hovered = null, current = null;
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { hovered = a; movePill(a); });
    a.addEventListener('mouseleave', function () { hovered = null; movePill(current); });
  });
  var onScroll = function () {
    var y = window.scrollY;
    $('#topbar').classList.toggle('is-scrolled', y > 24);

    var mark = y + 140;
    current = null;
    links.forEach(function (a) {
      var sec = $(a.getAttribute('href'));
      if (sec && sec.offsetTop <= mark) current = a;
    });
    links.forEach(function (a) { a.classList.toggle('is-active', a === current); });
    if (!hovered) movePill(current);

    var c = $('#contacts').getBoundingClientRect();
    var nearForm = c.top < window.innerHeight && c.bottom > 0;
    $('#dock').classList.toggle('is-shown', y > window.innerHeight * 0.6 && !nearForm);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* Поява секцій при прокрутці (з невеликим «каскадом» у сітках) */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // після появи знімаємо класи, щоб повільний перехід не гальмував hover
        setTimeout(function () { el.classList.remove('rv', 'rv-img', 'is-in'); el.style.removeProperty('--d'); }, 1700);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    var mark = function (el, cls, delay) {
      el.classList.add(cls);
      if (delay) el.style.setProperty('--d', delay + 's');
      io.observe(el);
    };
    $$('.block__head > *, .note, .order2__text > *, .contact2__info > *, .form2').forEach(function (el) { mark(el, 'rv'); });
    ['.cat-grid', '.features', '.reviews2', '.steps2', '.clist'].forEach(function (sel) {
      var box = $(sel);
      if (box) Array.prototype.forEach.call(box.children, function (el, i) { mark(el, 'rv', Math.min(i, 5) * 0.08); });
    });
    $$('.order2__photos .op, .map2').forEach(function (el) { mark(el, 'rv-img'); });
  }

  /* «Відчинено зараз» за графіком салону (київський час) */
  try {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var day = get('weekday'), mins = +get('hour') * 60 + +get('minute');
    var close = (day === 'Sat' || day === 'Sun') ? 16 : 18;
    var badge = $('#openNow');
    if (mins >= 540 && mins < close * 60) { badge.textContent = 'відчинено зараз'; badge.classList.add('is-open'); }
    else { badge.textContent = 'зараз зачинено'; }
  } catch (e) { /* без бейджа */ }

  /* Клік по категорії → вона обрана у формі */
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = $('#chips input[value="' + a.getAttribute('data-pick') + '"]');
      if (r) r.checked = true;
    });
  });

  /* Форма (демо: лише повідомлення «Дякуємо») */
  var phoneOk = function (v) { return v.replace(/\D/g, '').length >= 10; };
  var form = $('#form'), phone = $('#f-phone');
  phone.addEventListener('input', function () { if (phoneOk(phone.value)) phone.parentElement.classList.remove('has-error'); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!phoneOk(phone.value)) { phone.parentElement.classList.add('has-error'); phone.focus(); return; }
    // TODO робоча версія: надсилати заявку в Telegram-бот власника
    $('.form2__done', form).hidden = false;
  });
})();
