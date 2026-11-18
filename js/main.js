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

  /* Прокрутка: лінія під шапкою, активний пункт, липка панель на телефоні */
  var links = $$('#menu a[href^="#"]');
  var onScroll = function () {
    var y = window.scrollY;
    $('#topbar').classList.toggle('is-scrolled', y > 8);

    var mark = y + 120, current = null;
    links.forEach(function (a) {
      var sec = $(a.getAttribute('href'));
      if (sec && sec.offsetTop <= mark) current = a;
    });
    links.forEach(function (a) { a.classList.toggle('is-active', a === current); });

    var c = $('#contacts').getBoundingClientRect();
    var nearForm = c.top < window.innerHeight && c.bottom > 0;
    $('#dock').classList.toggle('is-shown', y > window.innerHeight * 0.6 && !nearForm);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
