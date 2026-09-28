/* Vedansh — vedansh.app
   Two behaviours only: the nav's scrolled state / mobile toggle, and a
   scroll reveal for the folio spreads. Nothing else belongs here. */

(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    // First check on the next frame, not during startup, so reading scrollY
    // does not force a synchronous layout before first paint.
    requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(reveals, function (el) { observer.observe(el); });
})();

/* Visit counter. One POST per browser session (a reload does not recount);
   later pages in the same session only read. The element is optional, so a
   page without a counter, or a fetch that fails, changes nothing visible. */
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-hits]');
  if (!els.length || !window.fetch) return;

  var key = 'vedansh-hit';
  var counted = false;
  try { counted = sessionStorage.getItem(key) === '1'; } catch (e) { /* private mode */ }

  var url = '/api/hits?p=' + encodeURIComponent(location.pathname);
  fetch(url, { method: counted ? 'GET' : 'POST', cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data.total !== 'number') return;
      try { sessionStorage.setItem(key, '1'); } catch (e) { /* ignore */ }
      var lang = document.documentElement.lang === 'hi' ? 'hi-IN' : 'en-IN';
      var n = data.total.toLocaleString(lang);
      Array.prototype.forEach.call(els, function (el) {
        el.textContent = el.getAttribute('data-hits').replace('{n}', n);
        el.hidden = false;
      });
    })
    .catch(function () { /* the counter is decoration; never surface an error */ });
})();

/* Folio background art: load each image as its section comes within a screen
   of the viewport, then flip the class that fades it in over the placeholder
   glow. Without JS the sections simply stay plain. */
(function () {
  'use strict';
  var els = document.querySelectorAll('.folio-bg[data-src]');
  if (!els.length) return;

  function load(el) {
    var src = el.getAttribute('data-src');
    el.removeAttribute('data-src');
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      el.style.setProperty('--bg', 'url("' + src + '")');
      // a frame later, so the transition runs rather than jumping
      requestAnimationFrame(function () { el.classList.add('is-loaded'); });
    };
    img.src = src;
  }

  // Art on the first screen loads straight away; the rest waits for idle.
  var rest = [];
  Array.prototype.forEach.call(els, function (el) {
    if (el.hasAttribute('data-eager')) load(el); else rest.push(el);
  });
  els = rest;
  if (!els.length) return;

  function start() {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, load);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); load(e.target); }
      });
    }, { rootMargin: '600px 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  // Decoration never competes with the page itself: nothing is requested
  // until the page has loaded and the browser is idle.
  function whenIdle() {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1200);
  }
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle);
})();


/* A verse on every visit. The page ships with one in its markup (so crawlers
   and no-JS readers get text); this swaps each band for a different random
   verse from the library, in the page's language. Texts and meanings come
   from the app's library, except the three Balkand chaupais at the top. */
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-shloka]');
  if (!els.length) return;
  var SHLOKAS = [{"t": ["होइहि सोइ जो राम रचि राखा।", "को करि तर्क बढ़ावै साखा॥"], "h": "जो कुछ श्रीराम ने रच रखा है, वही होगा। तर्क करके बात को कौन बढ़ाए?", "e": "Whatever Rama has ordained will come to pass. Who would lengthen the matter by argument?", "sh": "रामचरितमानस, बालकांड", "se": "Ramcharitmanas, Balkand", "l": "hi"}, {"t": ["मंगल भवन अमंगल हारी।", "द्रवउ सो दसरथ अजिर बिहारी॥"], "h": "जो मंगल के धाम और अमंगल को हरने वाले हैं, दशरथ जी के आँगन में खेलने वाले वे श्रीराम मुझ पर कृपा करें।", "e": "May He who is the home of all good and the remover of all ill — who played in the courtyard of Dasharatha — look on me with grace.", "sh": "रामचरितमानस, बालकांड", "se": "Ramcharitmanas, Balkand", "l": "hi"}, {"t": ["जाकी रही भावना जैसी।", "प्रभु मूरति देखी तिन तैसी॥"], "h": "जिसके मन में जैसी भावना थी, उसने प्रभु की मूर्ति को वैसा ही देखा।", "e": "As was the feeling in each heart, so did each one see the form of the Lord.", "sh": "रामचरितमानस, बालकांड", "se": "Ramcharitmanas, Balkand", "l": "hi"}, {"t": ["कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।", "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि।।2.47।।"], "h": "कर्तव्य-कर्म करनेमें ही तेरा अधिकार है, फलोंमें कभी नहीं। अतः तू कर्मफलका हेतु भी मत बन और तेरी अकर्मण्यतामें भी आसक्ति न हो।", "e": "Your right is only to work, but not to its results; do not let the results of action be your motive, nor let your attachment be to inaction.", "sh": "भगवद् गीता 2.47", "se": "Bhagavad Gita 2.47", "l": "sa"}, {"t": ["यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।", "अभ्युत्थानमधर्मस्य तदाऽऽत्मानं सृजाम्यहम्।।4.7।।"], "h": "हे भरतवंशी अर्जुन! जब-जब धर्मकी हानि और अधर्मकी वृद्धि होती है, तब-तब ही मैं अपने-आपको साकाररूपसे प्रकट करता हूँ।", "e": "Whenever there is a decline of righteousness and an increase of unrighteousness, O Arjuna, then I manifest Myself.", "sh": "भगवद् गीता 4.7", "se": "Bhagavad Gita 4.7", "l": "sa"}, {"t": ["परित्राणाय साधूनां विनाशाय च दुष्कृताम्।", "धर्मसंस्थापनार्थाय संभवामि युगे युगे।।4.8।।"], "h": "साधुओं-(भक्तों-) की रक्षा करनेके लिये, पापकर्म करनेवालोंका विनाश करनेके लिये और धर्मकी भलीभाँति स्थापना करनेके लिये मैं युग-युगमें प्रकट हुआ करता हूँ।", "e": "For the protection of the good, for the destruction of the wicked, and for the establishment of righteousness, I am born in every age.", "sh": "भगवद् गीता 4.8", "se": "Bhagavad Gita 4.8", "l": "sa"}, {"t": ["सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।", "अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः।।18.66।।"], "h": "सम्पूर्ण धर्मोंका आश्रय छोड़कर तू केवल मेरी शरणमें आ जा। मैं तुझे सम्पूर्ण पापोंसे मुक्त कर दूँगा, चिन्ता मत कर।", "e": "Abandon all duties and take refuge in Me alone; I will liberate you from all sins; do not grieve.", "sh": "भगवद् गीता 18.66", "se": "Bhagavad Gita 18.66", "l": "sa"}, {"t": ["न जायते म्रियते वा कदाचि", "न्नायं भूत्वा भविता वा न भूयः।", "अजो नित्यः शाश्वतोऽयं पुराणो", "न हन्यते हन्यमाने शरीरे।।2.20।।"], "h": "यह शरीरी न कभी जन्मता है और न मरता है तथा यह उत्पन्न होकर फिर होनेवाला नहीं है। यह जन्मरहित, नित्य-निरन्तर रहनेवाला, शाश्वत और पुराण (अनादि) है। शरीरके मारे जानेपर भी यह नहीं मारा जाता।", "e": "It is not born, nor does it ever die; after having been, it again does not cease to be; unborn, eternal, changeless, and ancient, it is not killed when the body is killed.", "sh": "भगवद् गीता 2.20", "se": "Bhagavad Gita 2.20", "l": "sa"}, {"t": ["अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।", "तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्।।9.22।।"], "h": "जो अनन्य भक्त मेरा चिन्तन करते हुए मेरी उपासना करते हैं, मेरेमें निरन्तर लगे हुए उन भक्तोंका योगक्षेम (अप्राप्तकी प्राप्ति और प्राप्तकी रक्षा) मैं वहन करता हूँ।", "e": "For those men who worship Me alone, thinking of no one else, for those ever-united, I secure what they have not already possessed and preserve what they already possess.", "sh": "भगवद् गीता 9.22", "se": "Bhagavad Gita 9.22", "l": "sa"}, {"t": ["उद्धरेदात्मनाऽऽत्मानं नात्मानमवसादयेत्।", "आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः।।6.5।।"], "h": "अपने द्वारा अपना उद्धार करे, अपना पतन न करे; क्योंकि आप ही अपना मित्र है और आप ही अपना शत्रु है।", "e": "One should raise oneself by one's own self alone; let not one lower oneself; for the self alone is one's own friend, and the self alone is one's own enemy.", "sh": "भगवद् गीता 6.5", "se": "Bhagavad Gita 6.5", "l": "sa"}, {"t": ["मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।", "आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत।।2.14।।"], "h": "हे कुन्तीनन्दन! इन्द्रियोंके जो विषय (जड पदार्थ) हैं, वो तो शीत (अनुकूलता) और उष्ण (प्रतिकूलता) - के द्वारा सुख और दुःख देनेवाले हैं तथा आने-जानेवाले और अनित्य हैं। हे भरतवंशोद्भव अर्जुन! उनको तुम सहन करो।", "e": "The contact of the senses with the objects, O son of Kunti, which causes heat and cold, pleasure and pain, has a beginning and an end; they are impermanent; endure them bravely, O Arjuna.", "sh": "भगवद् गीता 2.14", "se": "Bhagavad Gita 2.14", "l": "sa"}, {"t": ["श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।", "स्वधर्मे निधनं श्रेयः परधर्मो भयावहः।।3.35।।"], "h": "अच्छी तरह आचरणमें लाये हुए दूसरेके धर्मसे गुणोंकी कमीवाला अपना धर्म श्रेष्ठ है। अपने धर्ममें तो मरना भी कल्याणकारक है और दूसरेका धर्म भयको देनेवाला है।", "e": "Better is one's own duty, though devoid of merit, than the duty of another well discharged. Better is death in one's own duty; the duty of another is fraught with fear.", "sh": "भगवद् गीता 3.35", "se": "Bhagavad Gita 3.35", "l": "sa"}, {"t": ["अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।", "निर्ममो निरहङ्कारः समदुःखसुखः क्षमी।।12.13।।"], "h": "सब प्राणियोंमें द्वेषभावसे रहित, सबका मित्र (प्रेमी) और दयालु, ममतारहित, अहंकाररहित, सुखदुःखकी प्राप्तिमें सम, क्षमाशील, निरन्तर सन्तुष्ट, योगी, शरीरको वशमें किये हुए, दृढ़ निश्चयवाला? मेरेमें अर्पित मनबुद्धिवाला जो मेरा भक्त है, वह मेरेको प्रिय है।", "e": "He who hates no creature, is friendly and compassionate to all, is free from attachment and egoism, is balanced in pleasure and pain, and is forgiving.", "sh": "भगवद् गीता 12.13", "se": "Bhagavad Gita 12.13", "l": "sa"}, {"t": ["हनूमान तेहि परसा कर पुनि कीन्ह प्रनाम।", "राम काजु कीन्हें बिनु मोहि कहाँ बिश्राम॥1॥"], "h": "हनुमान्जी ने उसे हाथ से छू दिया, फिर प्रणाम करके कहा- भाई! श्री रामचंद्रजी का काम किए बिना मुझे विश्राम कहाँ?", "e": "Hanuman ji gently touched the mountain, bowed in respect, and said, \"How can I rest before completing Shri Ram's task?\"", "sh": "रामचरितमानस, सुंदरकांड", "se": "Ramcharitmanas, Sundarkand", "l": "hi"}, {"t": ["सिय राममय सब जग जानी।", "करउँ प्रनाम जोरि जुग पानी॥"], "h": "सम्पूर्ण जगत को सीता-राममय जानकर दोनों हाथ जोड़कर प्रणाम करता हूँ।", "e": "Knowing the entire world to be pervaded by Sita and Rama, I bow with both hands joined.", "sh": "रामचरितमानस, बालकांड", "se": "Ramcharitmanas, Balkand", "l": "hi"}, {"t": ["प्रबिसि नगर कीजे सब काजा। हृदयँ राखि कोसलपुर राजा॥"], "h": "अयोध्यापुरी के राजा श्री रघुनाथजी को हृदय में रखे हुए नगर में प्रवेश करके सब काम कीजिए। उसके लिए विष अमृत हो जाता है, शत्रु मित्रता करने लगते हैं, समुद्र गाय के खुर के बराबर हो जाता है, अग्नि में शीतलता आ जाती है", "e": "Now, enter the city with the Lord of Ayodhya enshrined in your heart, and may you successfully accomplish your mission.\" \"Poison can turn into nectar, enemies can become friends, the vast ocean can shrink to the size of water within a cow's footprint, fire can become cool, and.", "sh": "रामचरितमानस, सुंदरकांड", "se": "Ramcharitmanas, Sundarkand", "l": "hi"}, {"t": ["श्रीरामचन्द्रचरणौ मनसा स्मरामि", "श्रीरामचन्द्रचरणौ वचसा गृणामि।", "श्रीरामचन्द्रचरणौ शिरसा नमामि", "श्रीरामचन्द्रचरणौ शरणं प्रपद्ये॥"], "h": "श्रीरामचन्द्र के चरणों का मैं मन से स्मरण करता हूँ, वाणी से गुणगान करता हूँ, सिर से प्रणाम करता हूँ, और उन्हीं चरणों की शरण ग्रहण करता हूँ।", "e": "The feet of Shri Ramachandra I remember with my mind; the feet of Shri Ramachandra I extol with my speech; the feet of Shri Ramachandra I bow to with my head; in the feet of Shri Ramachandra I take refuge.", "sh": "श्रीरामरक्षास्तोत्र", "se": "Shri Rama Raksha Stotra", "l": "sa"}, {"t": ["मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।", "वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥"], "h": "मन के समान वेग वाले, वायु के तुल्य गति वाले, जितेन्द्रिय, बुद्धिमानों में श्रेष्ठ, पवनपुत्र, वानर-सेना के मुख्य — उन श्रीराम के दूत (हनुमान्) की मैं शरण ग्रहण करता हूँ।", "e": "Swift as thought, fleet as the wind, master of the senses, foremost among the wise, son of the Wind, chief of the vanara host — in that messenger of Shri Rama (Hanuman) I take refuge.", "sh": "श्रीरामरक्षास्तोत्र", "se": "Shri Rama Raksha Stotra", "l": "sa"}, {"t": ["श्रीरामचन्द्र कृपालु भजु मन हरण भवभय दारुणम्।", "नवकञ्ज लोचन कञ्ज मुख कर कञ्ज पद कञ्जारुणम्॥"], "h": "हे मन! श्रीरामचन्द्र का भजन कर — जो कृपालु हैं, संसार के दारुण (भयंकर) भय को हरने वाले हैं। जिनके नेत्र नवीन कमल सदृश, मुख कमल समान, हाथ कमल सदृश और चरण लाल कमल के समान हैं।", "e": "O mind! Worship Lord Ramachandra, the compassionate one who destroys the dreadful fear of worldly existence — whose eyes are like fresh lotuses, face like a lotus, hands like lotuses, and feet rosy like red lotuses.", "sh": "श्रीराम स्तुति", "se": "Shri Ram Stuti", "l": "hi"}];
  var hi = document.documentElement.lang === 'hi';
  var pool = SHLOKAS.slice();
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function take(shortOnly) {
    var idx = [];
    for (var i = 0; i < pool.length; i++) if (!shortOnly || pool[i].t.length <= 2) idx.push(i);
    if (!idx.length) return null;
    return pool.splice(idx[Math.floor(Math.random() * idx.length)], 1)[0];
  }
  // The top strip has a fixed height (it is on the first screen, so a swap
  // must not move the page): it takes a two-line verse, and goes first.
  var list = Array.prototype.slice.call(els).sort(function (a, b) {
    return (b.getAttribute('data-shloka') === 'short') - (a.getAttribute('data-shloka') === 'short');
  });
  list.forEach(function (el) {
    try {
      var short = el.getAttribute('data-shloka') === 'short';
      var v = take(short);
      if (pool.length === 0) pool = SHLOKAS.slice();
      if (!v) return;
      var t = el.querySelector('.shloka-text');
      t.innerHTML = v.t.map(esc).join('<br>');
      t.setAttribute('lang', v.l);
      var m = el.querySelector('.shloka-meaning');
      if (m) m.textContent = hi ? v.h : v.e;
      el.querySelector('.shloka-src').textContent = hi ? v.sh : v.se;
    } finally {
      el.classList.add('is-set');
    }
  });
})();
