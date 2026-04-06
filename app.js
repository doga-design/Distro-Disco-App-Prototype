
  // Disable native drag interactions (images/links)
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  // Keep the fixed iPhone shell fully visible on shorter laptop viewports.
  (function initShellViewportFit() {
    var FRAME_W = 414; // 390 app + 12px frame padding on each side
    var FRAME_H = 868; // 844 app + 12px frame padding on each side
    var V_MARGIN = 32; // body vertical padding budget
    var H_MARGIN = 32; // safe horizontal breathing room
    var root = document.documentElement;
    var bodyEl = document.body;

    function updateShellScale() {
      var isDesktopLike = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 500;
      if (!isDesktopLike) {
        root.style.setProperty('--shell-scale', '1');
        bodyEl.classList.remove('shell-scaled');
        return;
      }

      var scaleByHeight = (window.innerHeight - V_MARGIN) / FRAME_H;
      var scaleByWidth = (window.innerWidth - H_MARGIN) / FRAME_W;
      var scale = Math.min(1, scaleByHeight, scaleByWidth);
      if (!Number.isFinite(scale)) scale = 1;
      scale = Math.max(0.72, scale);

      root.style.setProperty('--shell-scale', String(scale));
      bodyEl.classList.toggle('shell-scaled', scale < 0.999);
    }

    window.addEventListener('resize', updateShellScale, { passive: true });
    window.addEventListener('orientationchange', updateShellScale, { passive: true });
    updateShellScale();
  })();

  (function initCornerTeamBubbleFx() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const avatars = Array.from(document.querySelectorAll('.corner-team-avatar'));
    if (!avatars.length) return;

    /* Icon src only — position, size, motion: css/activities.css (.corner-team-avatar--*) */
    const fxPresets = [
      [
        { src: 'img/icons/corner-fx-heart.svg' },
        { src: 'img/icons/corner-fx-stars.svg' },
        { src: 'img/icons/corner-fx-particle.svg' },
        { src: 'img/icons/corner-fx-stardust-1.svg' }
      ],
      [
        { src: 'img/icons/corner-fx-stars-outline.svg' },
        { src: 'img/icons/corner-fx-heart.svg' },
        { src: 'img/icons/corner-fx-stardust-2.svg' },
        { src: 'img/icons/corner-fx-stars.svg' }
      ],
      [
        { src: 'img/icons/corner-fx-particle.svg' },
        { src: 'img/icons/corner-fx-stardust-1.svg' },
        { src: 'img/icons/corner-fx-heart.svg' },
        { src: 'img/icons/corner-fx-stars-outline.svg' }
      ],
      [
        { src: 'img/icons/corner-fx-stardust-2.svg' },
        { src: 'img/icons/corner-fx-stars.svg' },
        { src: 'img/icons/corner-fx-particle.svg' },
        { src: 'img/icons/corner-fx-heart.svg' }
      ]
    ];

    avatars.forEach(function(avatar, avatarIndex) {
      const bubble = avatar.querySelector('.corner-team-chat');
      if (!bubble) return;
      const avatarImg = avatar.querySelector('.corner-team-avatar-img');
      const baseSrc = avatarImg ? avatarImg.getAttribute('src') : null;
      function getHoverSrc() {
        if (!avatar.classList) return null;
        if (avatar.classList.contains('corner-team-avatar--gracelle')) return 'img/dd-party-hover.png';
        if (avatar.classList.contains('corner-team-avatar--jiwoo')) return 'img/dd-flowers-hover.png';
        if (avatar.classList.contains('corner-team-avatar--doga')) return 'img/dd-cowboy-hover.png';
        if (avatar.classList.contains('corner-team-avatar--caitlin')) return 'img/dd-bow-hover.png';
        return null;
      }
      const hoverSrc = getHoverSrc();
      const preset = fxPresets[avatarIndex] || fxPresets[0];
      const fxRoot = document.createElement('div');
      fxRoot.className = 'corner-team-fx';
      bubble.appendChild(fxRoot);
      let cleanupTimer = null;

      function clearFxNow() {
        fxRoot.innerHTML = '';
      }

      function spawnFx() {
        if (cleanupTimer) {
          clearTimeout(cleanupTimer);
          cleanupTimer = null;
        }
        clearFxNow();
        if (avatarImg && hoverSrc) avatarImg.setAttribute('src', hoverSrc);
        preset.forEach(function(item, i) {
          const wrap = document.createElement('span');
          wrap.className = 'corner-team-fx-icon';

          const img = document.createElement('img');
          img.className = 'corner-team-fx-glyph';
          img.src = item.src;
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          wrap.appendChild(img);
          fxRoot.appendChild(wrap);

          setTimeout(function() {
            wrap.classList.add('is-visible');
          }, i * 60);
        });
      }

      function despawnFx() {
        var icons = fxRoot.querySelectorAll('.corner-team-fx-icon');
        icons.forEach(function(icon) {
          icon.classList.remove('is-visible');
          icon.classList.add('is-exiting');
        });
        if (avatarImg && baseSrc) avatarImg.setAttribute('src', baseSrc);
        cleanupTimer = setTimeout(clearFxNow, 180);
      }

      avatar.addEventListener('mouseenter', spawnFx);
      avatar.addEventListener('mouseleave', despawnFx);
    });
  })();

  // ── Page Router + Event Detail Flow ──
  const pageMap = { home: 'page-home', events: 'page-events', detail: 'page-event-detail', volunteer: 'page-volunteer', settings: 'page-settings', profile: 'page-profile', 'donate-money': 'page-donate-money', 'donate-items': 'page-donate-items', 'donate-money-confirm': 'page-donate-money-confirm', 'volunteer-confirm': 'page-volunteer-confirm', forums: 'page-forum', compose: 'page-compose', 'forum-detail': 'page-forum-detail', activities: 'page-activities' };
  const navItems = document.querySelectorAll('.bottom-nav .nav-item:not(.center-item)');
  const settingsButtons = document.querySelectorAll('.top-nav-settings');
  const detailPage = document.querySelector('.page-event-detail');
  const detailIllustration = document.getElementById('event-detail-illustration');
  const detailIcon = document.getElementById('event-detail-icon');
  const detailTitle = document.getElementById('event-detail-title');
  const detailDatetime = document.getElementById('event-detail-datetime');
  const detailLocation = document.getElementById('event-detail-location');
  const detailAddress = document.getElementById('event-detail-address');
  const detailTasks = document.getElementById('event-detail-tasks');
  const detailBackArrowBtn = document.getElementById('event-detail-back-arrow');
  const detailCta = document.getElementById('event-detail-cta');
  const dmSwitchToItems = document.getElementById('dm-switch-to-items');
  const donatePresetButtons = document.querySelectorAll('.page-donate-money .donate-preset-btn');
  const donateCustomInput = document.getElementById('donate-custom-input');
  const donateAmountValue = document.getElementById('donate-amount-value');
  const donateMoneyCta = document.getElementById('donate-money-cta');
  const detailMapWrap = document.getElementById('event-detail-map-wrap');
  const detailMap = document.getElementById('event-detail-map');
  if (detailMap && detailMapWrap) {
    detailMap.addEventListener('load', function() {
      detailMapWrap.classList.add('loaded');
    });
  }
  let activePageName = 'home';
  let donateReturnPage = 'home';
  var profileConfettiTimerId = null;
  var profileConfettiCanvas = null;
  var profileConfettiAbort = false;
  var donationJustConfirmed = false;
  var donationGroups = [];
  var pendingHomeCelebrations = 0;
  var donationCardShownOnce = false;
  var donationCardCollapsed = false;
  var donationGetItemIconSrc = null;
  var donationLastConfirmedItems = [];
  var donationLastConfirmedSnapshot = null;
  var restoreDonateItemsFromSnapshot = null;
  var volunteerCommitments = [];
  var monthlyItemCommitmentActive = true;
  var profileCommitmentNewType = null;
  var profileCommitmentNewId = null;
  var commitmentUndoToastEl = null;
  var commitmentUndoTimerId = null;
  var homeDonationCelebrationController = null;

  var backToTopBtn = document.getElementById('back-to-top-btn');
  var backToTopScrollPage = null;
  var backToTopOnScroll = null;

  function prefersReducedMotionUI() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function updateBackToTopVisibility() {
    if (!backToTopBtn || !backToTopScrollPage) return;
    var p = backToTopScrollPage;
    var scrollable = p.scrollHeight - p.clientHeight > 24;
    var threshold = Math.max(80, p.scrollHeight * 0.38);
    var show = scrollable && p.scrollTop >= threshold;
    backToTopBtn.classList.toggle('is-visible', show);
    backToTopBtn.setAttribute('aria-hidden', show ? 'false' : 'true');
    backToTopBtn.tabIndex = show ? 0 : -1;
  }

  function bindBackToTopToActivePage() {
    if (!backToTopBtn) return;
    if (backToTopScrollPage && backToTopOnScroll) {
      backToTopScrollPage.removeEventListener('scroll', backToTopOnScroll);
    }
    backToTopScrollPage = document.querySelector('.page.active');
    backToTopOnScroll = updateBackToTopVisibility;
    if (backToTopScrollPage) {
      backToTopScrollPage.addEventListener('scroll', backToTopOnScroll, { passive: true });
      requestAnimationFrame(updateBackToTopVisibility);
    } else {
      backToTopBtn.classList.remove('is-visible');
      backToTopBtn.setAttribute('aria-hidden', 'true');
      backToTopBtn.tabIndex = -1;
    }
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
      var p = document.querySelector('.page.active');
      if (!p) return;
      p.scrollTo({ top: 0, behavior: prefersReducedMotionUI() ? 'auto' : 'smooth' });
    });
  }

  var topNavScrollPage = null;
  var topNavLastScrollTop = 0;

  function topNavScrollHandler() {
    var page = topNavScrollPage;
    if (!page) return;
    var nav = page.querySelector('.top-nav');
    if (!nav) return;
    if (prefersReducedMotionUI()) {
      nav.classList.remove('is-scroll-hidden');
      topNavLastScrollTop = page.scrollTop;
      return;
    }
    var st = page.scrollTop;
    var delta = st - topNavLastScrollTop;
    var jitter = 6;
    var minScrollToHide = 32;
    if (st < 8) {
      nav.classList.remove('is-scroll-hidden');
    } else if (delta > jitter && st > minScrollToHide) {
      nav.classList.add('is-scroll-hidden');
    } else if (delta < -jitter) {
      nav.classList.remove('is-scroll-hidden');
    }
    topNavLastScrollTop = st;
  }

  function bindTopNavScrollToActivePage() {
    if (topNavScrollPage) {
      topNavScrollPage.removeEventListener('scroll', topNavScrollHandler);
    }
    topNavScrollPage = document.querySelector('.page.active');
    topNavLastScrollTop = topNavScrollPage ? topNavScrollPage.scrollTop : 0;
    if (topNavScrollPage) {
      topNavScrollPage.addEventListener('scroll', topNavScrollHandler, { passive: true });
      requestAnimationFrame(topNavScrollHandler);
    }
  }

  function mergeDonationGroupSession(session) {
    if (!session || !session.dropoff || !session.dropoff.id || !Array.isArray(session.items) || !session.items.length) return false;
    var incomingItems = session.items
      .filter(function(entry) { return entry && entry.itemName && (entry.qty || 0) > 0; })
      .map(function(entry) { return { itemName: entry.itemName, qty: entry.qty }; });
    if (!incomingItems.length) return false;

    var existing = donationGroups.find(function(group) {
      return group && group.dropoff && group.dropoff.id === session.dropoff.id;
    });

    if (existing) {
      incomingItems.forEach(function(incoming) {
        var match = existing.items.find(function(item) { return item.itemName === incoming.itemName; });
        if (match) match.qty += incoming.qty;
        else existing.items.push({ itemName: incoming.itemName, qty: incoming.qty });
      });
      existing.items = existing.items.filter(function(item) { return (item.qty || 0) > 0; });
    } else {
      donationGroups.push({
        id: session.id || String(Date.now()) + '-' + Math.random().toString(36).slice(2),
        dropoff: session.dropoff,
        items: incomingItems,
        confirmedAt: session.confirmedAt || Date.now()
      });
    }

    donationGroups = donationGroups
      .map(function(group) {
        return {
          id: group.id,
          dropoff: group.dropoff,
          confirmedAt: group.confirmedAt || Date.now(),
          items: (group.items || []).filter(function(item) { return (item.qty || 0) > 0; })
        };
      })
      .filter(function(group) { return group.items.length > 0; })
      .sort(function(a, b) { return (a.confirmedAt || 0) - (b.confirmedAt || 0); });

    return donationGroups.length > 0;
  }

  function setActiveNav(name) {
    navItems.forEach(item => {
      const labelSpan = item.querySelector('span:last-of-type') || item.querySelector('span');
      const label = labelSpan?.textContent?.trim().toLowerCase();
      item.classList.toggle('active', label === name);
    });
  }

  function launchImpactConfetti(card) {
    var barWrap = card.querySelector('.prof-impact-bar-wrap');
    if (!barWrap) return;

    var appContainer = card.closest('.app-container');
    if (!appContainer) return;

    var barRect = barWrap.getBoundingClientRect();
    var containerRect = appContainer.getBoundingClientRect();
    // Origin in container coords: end of navy bar (66% of bar width)
    var originX = barRect.left - containerRect.left + barRect.width * 0.66;
    var originY = barRect.top - containerRect.top + barRect.height / 2;

    var canvas = document.createElement('canvas');
    canvas.width = appContainer.clientWidth;
    canvas.height = appContainer.clientHeight;
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    appContainer.appendChild(canvas);
    profileConfettiCanvas = canvas;
    var ctx = canvas.getContext('2d');

    var palette = ['#23214A', '#EF6242', '#E8BF6A', '#F4F3EE', '#EF6242', '#23214A'];
    var particles = [];
    var TOTAL = 80;

    for (var i = 0; i < TOTAL; i++) {
      // mostly upward spread
      var spread = (Math.random() - 0.5) * Math.PI * 1.1;
      var angle = -Math.PI / 2 + spread;
      var speed = Math.random() * 9 + 3;
      var typeRoll = Math.random();
      var ptype = typeRoll < 0.18 ? 'heart' : typeRoll < 0.32 ? 'trophy' : typeRoll < 0.62 ? 'rect' : 'circle';
      particles.push({
        x: originX + (Math.random() - 0.5) * 80,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.18 + Math.random() * 0.12,
        drag: 0.98,
        rotation: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.22,
        color: palette[Math.floor(Math.random() * palette.length)],
        type: ptype,
        w: Math.random() * 9 + 4,
        h: Math.random() * 5 + 3,
        size: Math.random() * 11 + 7,
        opacity: 1,
        delay: Math.random() * 220
      });
    }

    function drawHeart(ctx, s) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.38);
      ctx.bezierCurveTo(-s, s * 0.75, 0, s * 1.05, 0, s * 1.3);
      ctx.bezierCurveTo(0, s * 1.05, s, s * 0.75, s, s * 0.38);
      ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.35);
      ctx.fill();
    }

    function drawTrophy(ctx, s) {
      // cup
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, -s);
      ctx.lineTo(-s * 0.9, s * 0.1);
      ctx.quadraticCurveTo(0, s * 0.85, s * 0.9, s * 0.1);
      ctx.lineTo(s * 0.75, -s);
      ctx.closePath();
      ctx.fill();
      // handles
      ctx.beginPath();
      ctx.arc(-s * 0.9, -s * 0.4, s * 0.28, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.9, -s * 0.4, s * 0.28, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
      // stem + base
      ctx.fillRect(-s * 0.14, s * 0.85, s * 0.28, s * 0.45);
      ctx.fillRect(-s * 0.52, s * 1.3, s * 1.04, s * 0.22);
    }

    var started = null;
    var LIFE = 2600;

    function frame(ts) {
      if (profileConfettiAbort) {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        profileConfettiCanvas = null;
        return;
      }
      if (!started) started = ts;
      var elapsed = ts - started;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;

      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        if (elapsed < p.delay) { alive = true; continue; }
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpd;
        var age = elapsed - p.delay;
        p.opacity = Math.max(0, 1 - age / LIFE);
        if (p.opacity <= 0) continue;
        alive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.12;

        if (p.type === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'heart') {
          drawHeart(ctx, p.size * 0.42);
        } else if (p.type === 'trophy') {
          drawTrophy(ctx, p.size * 0.36);
        }

        ctx.restore();
      }

      if (alive) {
        requestAnimationFrame(frame);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        profileConfettiCanvas = null;
      }
    }

    requestAnimationFrame(frame);
  }

  function showPage(name) {
    var prevPageName = activePageName;
    var swapTarget = window.__swapIconAnimTarget;
    window.__swapIconAnimTarget = null;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.querySelector('.' + pageMap[name]);
    if (!target) return;
    target.classList.add('active');
    target.scrollTop = 0;
    var topNavOnNewPage = target.querySelector('.top-nav');
    if (topNavOnNewPage) topNavOnNewPage.classList.remove('is-scroll-hidden');
    activePageName = name;
    document.body.classList.toggle('is-fullscreen-confirm', name === 'donate-money-confirm' || name === 'volunteer-confirm');
    if (name === 'donate-money' || name === 'donate-items') {
      var setDonateSegmentState = function(segment, isRight) {
        if (!segment) return;
        var btns = segment.querySelectorAll('.seg-btn');
        if (btns.length !== 2) return;
        segment.classList.toggle('right', isRight);
        btns[0].classList.toggle('active', !isRight);
        btns[1].classList.toggle('active', isRight);
      };
      var moneySegment = document.querySelector('.page-donate-money .donate-switch-segment');
      var itemsSegment = document.querySelector('.page-donate-items .donate-switch-segment');
      setDonateSegmentState(moneySegment, true);
      setDonateSegmentState(itemsSegment, false);

      if (swapTarget === name) {
        var activeSegment = name === 'donate-items' ? itemsSegment : moneySegment;
        var endIsRight = name === 'donate-money';
        if (activeSegment) {
          setDonateSegmentState(activeSegment, !endIsRight);
          setTimeout(function() {
            setDonateSegmentState(activeSegment, endIsRight);
          }, 40);
        }
      }
    }
    if (prevPageName === 'home' && name !== 'home' && homeDonationCelebrationController) {
      homeDonationCelebrationController.onHomeHidden();
    }

    // Ensure donate-items bottom sheet state never leaks across pages:
    // if we are not on the donate-items page, always clear the sheet-open lock.
    if (name !== 'donate-items') {
      document.body.classList.remove('donate-sheet-open');
      document.body.style.overflow = '';
    }
    if (name !== 'donate-money') {
      var apDrawer = document.getElementById('ap-pay-drawer');
      var apScrim = document.getElementById('ap-pay-scrim');
      if (apDrawer) {
        apDrawer.classList.remove('is-open');
        apDrawer.setAttribute('aria-hidden', 'true');
      }
      if (apScrim) {
        apScrim.classList.remove('is-open');
        apScrim.setAttribute('aria-hidden', 'true');
      }
    }

    // Reset impact bar animation when leaving profile so it replays on next open
    if (name !== 'profile') {
      clearTimeout(profileConfettiTimerId);
      profileConfettiTimerId = null;
      profileConfettiAbort = true;
      if (profileConfettiCanvas && profileConfettiCanvas.parentNode) {
        profileConfettiCanvas.parentNode.removeChild(profileConfettiCanvas);
        profileConfettiCanvas = null;
      }
      var profilePage = document.querySelector('.page-profile');
      var impactCard = profilePage && profilePage.querySelector('.prof-impact-card');
      if (impactCard) impactCard.classList.remove('prof-impact-bars-ready');
    }

    if (name === 'profile') {
      profileConfettiAbort = false;
      var impactCard = target.querySelector('.prof-impact-card');
      if (impactCard) {
        impactCard.classList.remove('prof-impact-bars-ready');
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            impactCard.classList.add('prof-impact-bars-ready');
            // confetti fires after all bar + label animations complete (~2200ms)
            profileConfettiTimerId = setTimeout(function() {
              profileConfettiTimerId = null;
              launchImpactConfetti(impactCard);
            }, 2200);
          });
        });
      }
      renderProfileCommitments();
    }

    // Bottom nav: only one item active at a time
    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
    const centerNavItem = document.querySelector('.bottom-nav .nav-item.center-item');
    if ((name === 'donate-money' || name === 'donate-items') && centerNavItem) {
      centerNavItem.classList.add('active');
    } else {
      if (name === 'events') setActiveNav('events');
      else if (name === 'volunteer') setActiveNav('volunteer');
      else if (name === 'home') setActiveNav('home');
      else if (name === 'forums' || name === 'compose' || name === 'forum-detail') setActiveNav('forums');
      else if (name === 'activities') setActiveNav('activities');
    }

    if (name === 'home' && homeDonationCelebrationController) {
      homeDonationCelebrationController.onHomeShown();
    }

    if (name === 'events' && typeof window.__ddOpenEventsCalendarToday === 'function') {
      requestAnimationFrame(function() {
        window.__ddOpenEventsCalendarToday();
      });
    }

    bindBackToTopToActivePage();
    bindTopNavScrollToActivePage();
  }

  function renderProfileCommitments() {
    var list = document.getElementById('prof-commitments-list');
    if (!list) return;
    var section = list.closest('.prof-donations-section');
    var sectionDivider = section && section.nextElementSibling && section.nextElementSibling.classList.contains('prof-divider')
      ? section.nextElementSibling
      : null;
    list.innerHTML = '';
    var animateType = profileCommitmentNewType;
    var animateId = profileCommitmentNewId;

    function scrollToCommitmentsThenAnimate(commitmentType, commitmentId) {
      if (!commitmentType || !commitmentId) return;
      var section = list.closest('.prof-donations-section');
      if (!section) return;

      var page = document.querySelector('.page-profile');
      if (!page) return;

      var smooth = !prefersReducedMotionUI();
      var y = section.offsetTop;
      var targetTop = y - Math.round(page.clientHeight * 0.36);
      targetTop = Math.max(0, targetTop);
      page.scrollTo({ top: targetTop, behavior: smooth ? 'smooth' : 'auto' });

      var delay = smooth ? 460 : 0;
      setTimeout(function() {
        var targetWrap = list.querySelector('.prof-commitment-swipe[data-commitment-type="' + commitmentType + '"][data-commitment-id="' + commitmentId + '"]');
        var target = targetWrap ? targetWrap.querySelector('.prof-donation-item') : null;
        if (!target) return;
        target.classList.remove('is-new');
        void target.offsetWidth;
        target.classList.add('is-new');
      }, delay);
    }

    function cloneState() {
      return {
        monthlyItemCommitmentActive: !!monthlyItemCommitmentActive,
        donationGroups: JSON.parse(JSON.stringify(donationGroups || [])),
        donationLastConfirmedItems: JSON.parse(JSON.stringify(donationLastConfirmedItems || [])),
        volunteerCommitments: JSON.parse(JSON.stringify(volunteerCommitments || []))
      };
    }

    function restoreState(snapshot) {
      if (!snapshot) return;
      monthlyItemCommitmentActive = !!snapshot.monthlyItemCommitmentActive;
      donationGroups = snapshot.donationGroups || [];
      donationLastConfirmedItems = snapshot.donationLastConfirmedItems || [];
      volunteerCommitments = snapshot.volunteerCommitments || [];
    }

    function hideUndoToast() {
      if (commitmentUndoTimerId) {
        clearTimeout(commitmentUndoTimerId);
        commitmentUndoTimerId = null;
      }
      if (!commitmentUndoToastEl) return;
      commitmentUndoToastEl.classList.remove('is-visible');
      commitmentUndoToastEl.classList.add('is-exit');
      var toast = commitmentUndoToastEl;
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 220);
      commitmentUndoToastEl = null;
    }

    function showUndoToast(onUndo) {
      hideUndoToast();
      var toast = document.createElement('button');
      toast.type = 'button';
      toast.className = 'btn btn-secondary back-to-top commitment-undo-toast';
      toast.setAttribute('aria-label', 'Undo action');
      toast.innerHTML = '' +
        '<span class="commitment-undo-fill" aria-hidden="true"></span>' +
        '<span class="commitment-undo-label">Undo action?</span>' +
        '<span class="commitment-undo-arrow" aria-hidden="true">&#8592;</span>';
      var appShell = document.querySelector('.app-container');
      (appShell || document.body).appendChild(toast);
      commitmentUndoToastEl = toast;
      setTimeout(function() {
        if (commitmentUndoToastEl) commitmentUndoToastEl.classList.add('is-visible');
      }, 10);

      toast.addEventListener('click', function() {
        if (typeof onUndo === 'function') onUndo();
        hideUndoToast();
      });

      commitmentUndoTimerId = setTimeout(function() {
        hideUndoToast();
      }, 3600);
    }

    function applySwipeMutation(type, id) {
      if (type === 'monthly-item') {
        monthlyItemCommitmentActive = false;
        return;
      }
      if (type === 'item-donation') {
        donationGroups = [];
        donationLastConfirmedItems = [];
        return;
      }
      if (type === 'volunteer') {
        volunteerCommitments = (volunteerCommitments || []).filter(function(vc) {
          return vc && vc.id !== id;
        });
      }
    }

    function addSwipeHandlers(wrap) {
      var card = wrap.querySelector('.prof-donation-item');
      var label = wrap.querySelector('.prof-commitment-complete-label');
      if (!card || !label) return;
      var commitmentType = wrap.dataset.commitmentType || '';
      var commitmentId = wrap.dataset.commitmentId || '';
      var threshold = 0.35;
      var startX = 0;
      var deltaX = 0;
      var dragging = false;
      var activeTouchId = null;

      function getX(ev) {
        if (ev.touches && ev.touches.length) {
          if (activeTouchId == null) return ev.touches[0].clientX;
          for (var i = 0; i < ev.touches.length; i++) if (ev.touches[i].identifier === activeTouchId) return ev.touches[i].clientX;
          return ev.touches[0].clientX;
        }
        if (ev.changedTouches && ev.changedTouches.length) {
          if (activeTouchId == null) return ev.changedTouches[0].clientX;
          for (var j = 0; j < ev.changedTouches.length; j++) if (ev.changedTouches[j].identifier === activeTouchId) return ev.changedTouches[j].clientX;
          return ev.changedTouches[0].clientX;
        }
        return ev.clientX;
      }

      function clearDir() {
        wrap.classList.remove('is-swipe-right', 'is-swipe-left');
      }

      function setDrag(clientX) {
        var width = card.offsetWidth || wrap.clientWidth || 1;
        deltaX = Math.max(-width, Math.min(width, clientX - startX));
        var progress = Math.min(1, Math.abs(deltaX) / width);
        card.style.transform = 'translateX(' + deltaX + 'px)';
        wrap.style.setProperty('--swipe-progress', String(progress));
        clearDir();
        if (deltaX > 0) wrap.classList.add('is-swipe-right');
        if (deltaX < 0) wrap.classList.add('is-swipe-left');
      }

      function cleanup() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
        window.removeEventListener('touchcancel', onEnd);
      }

      function onMove(ev) {
        if (!dragging) return;
        if (ev.cancelable) ev.preventDefault();
        setDrag(getX(ev));
      }

      function runComplete(dir) {
        var snapshot = cloneState();
        var width = card.offsetWidth || wrap.clientWidth || 1;
        wrap.classList.add('is-completing');
        wrap.classList.toggle('is-confirm', dir > 0);
        wrap.classList.toggle('is-cancel', dir < 0);
        label.textContent = dir > 0 ? 'Confirmed' : 'Commitment cancelled';
        card.style.transition = 'transform 220ms linear';
        card.style.transform = 'translateX(' + (dir > 0 ? width : -width) + 'px)';
        setTimeout(function() {
          wrap.classList.add('show-complete-label');
          setTimeout(function() {
            applySwipeMutation(commitmentType, commitmentId);
            renderProfileCommitments();
            showUndoToast(function() {
              restoreState(snapshot);
              renderProfileCommitments();
            });
          }, 200);
        }, 220);
      }

      function onEnd() {
        if (!dragging) return;
        dragging = false;
        cleanup();
        activeTouchId = null;
        var width = card.offsetWidth || wrap.clientWidth || 1;
        var progress = Math.min(1, Math.abs(deltaX) / width);
        if (progress >= threshold && deltaX !== 0) {
          runComplete(deltaX > 0 ? 1 : -1);
          return;
        }
        card.style.transition = 'transform 260ms cubic-bezier(0.25, 1, 0.5, 1)';
        card.style.transform = 'translateX(0px)';
        wrap.style.setProperty('--swipe-progress', '0');
        setTimeout(function() { clearDir(); }, 260);
      }

      function onStart(ev) {
        if (wrap.classList.contains('is-completing')) return;
        if (ev.type === 'mousedown' && ev.button !== 0) return;
        if (ev.type === 'touchstart' && ev.touches && ev.touches.length) activeTouchId = ev.touches[0].identifier;
        startX = getX(ev);
        deltaX = 0;
        dragging = true;
        card.style.transition = 'none';
        wrap.style.setProperty('--swipe-progress', '0');
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        window.addEventListener('touchcancel', onEnd);
      }

      card.addEventListener('touchstart', onStart, { passive: true });
      card.addEventListener('mousedown', onStart);
    }

    function appendRow(iconSrc, title, details, meta, commitmentType, commitmentId, isNew) {
      var wrap = document.createElement('div');
      wrap.className = 'prof-commitment-swipe';
      if (commitmentType) wrap.dataset.commitmentType = commitmentType;
      if (commitmentId) wrap.dataset.commitmentId = commitmentId;
      wrap.innerHTML = '' +
        '<div class="prof-commitment-reveal">' +
          '<img class="prof-commitment-reveal-icon prof-commitment-reveal-icon-confirm" alt="" src="img/icons/commitment-confirm.svg">' +
          '<img class="prof-commitment-reveal-icon prof-commitment-reveal-icon-cancel" alt="" src="img/icons/commitment-cancel.svg">' +
        '</div>' +
        '<div class="prof-commitment-complete-label"></div>' +
        '<div class="prof-donation-item' + (isNew ? ' is-new' : '') + '">' +
          '<span class="prof-live-dot" aria-hidden="true"></span>' +
          '<div class="prof-donation-icon"><img alt="" src="' + iconSrc + '"></div>' +
          '<div class="prof-donation-body">' +
            '<div class="prof-donation-title"></div>' +
            '<div class="prof-donation-details"></div>' +
          '</div>' +
          '<div class="prof-donation-meta"></div>' +
        '</div>';
      var row = wrap.querySelector('.prof-donation-item');
      var t = wrap.querySelector('.prof-donation-title');
      var d = wrap.querySelector('.prof-donation-details');
      var m = wrap.querySelector('.prof-donation-meta');
      if (t) t.textContent = title || '';
      if (d) d.textContent = details || '';
      if (m) m.textContent = meta || '';
      list.appendChild(wrap);
      addSwipeHandlers(wrap);
      return row;
    }

    var rowsToAnimate = [];
    var hasAny = false;

    if (monthlyItemCommitmentActive) {
      appendRow('img/icons/icon-gift.svg', 'Monthly item contribution', 'Next: Monthly drive', '', 'monthly-item', 'monthly-item', false);
      hasAny = true;
    }

    // One-time item contribution (pending drop-offs)
    var pendingCount = 0;
    var firstPendingName = '';
    (donationGroups || []).forEach(function(group) {
      (group.items || []).forEach(function(entry) { pendingCount += (entry.qty || 0); });
    });
    if (donationGroups && donationGroups.length) {
      var firstGroup = donationGroups[0];
      if (firstGroup && firstGroup.items && firstGroup.items.length && firstGroup.items[0] && firstGroup.items[0].itemName) {
        firstPendingName = firstGroup.items[0].itemName;
      }
    }
    if (pendingCount > 0) {
      var iconResolver = typeof donationGetItemIconSrc === 'function' ? donationGetItemIconSrc : null;
      var iconSrc = (iconResolver && firstPendingName) ? iconResolver(firstPendingName) : 'img/icons/icon-stars.svg';
      appendRow(iconSrc, 'One-time item contribution', pendingCount + ' item' + (pendingCount === 1 ? '' : 's') + ' pending drop-off', '', 'item-donation', 'item-donation', false);
      hasAny = true;
    }

    // One-time volunteer roles (stacked, newest first)
    (volunteerCommitments || []).slice().reverse().forEach(function(vc) {
      if (!vc) return;
      if (!(vc.eventTitle || vc.role || vc.shift || vc.eventDate)) return;
      var details = [vc.role, vc.shift, vc.eventDate].filter(Boolean).join(' · ');
      var row = appendRow(
        vc.categoryIcon || 'img/icons/icon-bus.svg',
        vc.eventTitle || (vc.role || 'Volunteer role'),
        details,
        '',
        'volunteer',
        vc.id,
        !!(animateType === 'volunteer' && animateId && vc.id === animateId)
      );
      if (animateType === 'volunteer' && animateId && vc.id === animateId) rowsToAnimate.push(row);
      hasAny = true;
    });

    if (!hasAny) {
      if (section) section.style.display = 'none';
      if (sectionDivider) sectionDivider.style.display = 'none';
      profileCommitmentNewType = null;
      profileCommitmentNewId = null;
      hideUndoToast();
      return;
    }

    if (section) section.style.display = '';
    if (sectionDivider) sectionDivider.style.display = '';

    if (animateType === 'volunteer' && animateId && rowsToAnimate.length) {
      scrollToCommitmentsThenAnimate('volunteer', animateId);
    }

    profileCommitmentNewType = null;
    profileCommitmentNewId = null;
  }

  function openSettingsPage() {
    showPage('settings');
  }

  function openProfilePage() {
    showPage('profile');
  }

  function openNotificationsPage() {
    showPage('activities');
  }

  const eventDetails = {
    'april-distro-3': {
      category: 'distro',
      title: 'April distro 3',
      icon: 'img/icons/icon-bus.svg',
      illustration: 'img/icons/icon-bus.svg',
      datetime: 'Saturday Apr 26, 3–5 PM',
      eventDate: 'Saturday, Apr 26',
      locationLabel: 'Crab Park',
      address: '101 E Waterfront Rd',
      tasks: [
        { text: 'Pack hygiene kits and snack bags before departure.' },
        { text: 'Help hand out supplies respectfully to neighbours at the park.' },
        { text: 'Support clean-up and inventory check once the distro wraps.' }
      ],
      cta: 'Volunteer for this distro'
    },
    'april-distro-1': {
      category: 'distro',
      title: 'April distro 1',
      icon: 'img/icons/icon-bus.svg',
      illustration: 'img/icons/icon-bus.svg',
      datetime: 'Saturday Apr 19, 3–6 PM',
      eventDate: 'Saturday, Apr 19',
      locationLabel: 'Grandview Park',
      address: '1657 Charles St',
      tasks: [
        { text: 'Sort layers, socks, and snacks into quick-grab bundles.' },
        { text: 'Welcome neighbours at the table and help distribute supplies fairly.' },
        { text: 'Float between stations to restock items and answer questions.' }
      ],
      cta: 'Volunteer for this distro'
    },
    'april-distro-2': {
      category: 'distro',
      title: 'April distro 2',
      icon: 'img/icons/icon-bus.svg',
      illustration: 'img/icons/icon-bus.svg',
      datetime: 'Saturday Apr 25, 11 AM–2 PM',
      eventDate: 'Saturday, Apr 25',
      locationLabel: 'Oppenheimer Park',
      address: '400 Powell St',
      tasks: [
        { text: 'Prepare hygiene kits and food boxes before service begins.' },
        { text: 'Support set-up and organize the supply table for easy access.' },
        { text: 'Help with tear-down and leftover item sorting after the event.' }
      ],
      cta: 'Volunteer for this distro'
    },
    'spring-clothing-drive': {
      category: 'drive',
      title: 'May contribution drive',
      icon: 'img/icons/icon-heart.svg',
      illustration: 'img/icons/icon-heart.svg',
      datetime: 'Sat, May 2, 11 AM–2 PM',
      eventDate: 'Saturday, May 2',
      locationLabel: 'McSpadden Park',
      address: '2125 Victoria Drive',
      tasks: [
        { text: 'Sort contributed clothing by size and condition.' },
        { text: 'Tag damaged items that should not be distributed.', complete: true },
        { text: 'Help load contribution bins for transport to the next distro.' }
      ],
      cta: 'Volunteer for this drive'
    },
    'spring-gala-night': {
      category: 'fundraiser',
      title: "Disco's alive! Comedy show",
      icon: 'img/icons/discoball.svg',
      illustration: 'img/icons/discoball.svg',
      datetime: 'Thursday Apr 23, 7 PM',
      eventDate: 'Thursday, Apr 23',
      locationLabel: 'Little Mountain Gallery',
      address: '110 Water St',
      tasks: [
        { text: 'Support guest check-in and guide attendees to the event space.' },
        { text: 'Help run the silent auction and raffle table during the night.' },
        { text: 'Assist with post-event pack down and contribution counting.' }
      ],
      cta: 'Volunteer for this fundraiser'
    },
    'online-fundraiser': {
      category: 'fundraiser',
      title: 'Online silent auction',
      icon: 'img/icons/discoball.svg',
      illustration: 'img/icons/discoball.svg',
      datetime: 'Apr 1–30, all month',
      eventDate: 'April 1–30',
      locationLabel: 'Online campaign',
      address: 'Share the fundraiser link with your community',
      tasks: [
        { text: 'Share the campaign across your channels and personal networks.' },
        { text: 'Invite friends to contribute or sponsor essential item bundles.' },
        { text: 'Help amplify weekly campaign updates and progress milestones.' }
      ],
      cta: 'Support this fundraiser'
    }
  };

  var lastEventDetailId = null;
  var eventDetailReturnPage = 'home';
  var volunteerConfirmReturnPage = 'volunteer';
  var VOLUNTEER_CONFIRM_DEFAULTS = {
    eventTitle: 'Free grocery pickup',
    eventDateTime: 'Saturday, April 12 · 10:00 AM – 1:00 PM',
    eventDate: 'Saturday, April 12',
    eventLocation: '123 Spadina Ave, Toronto',
    categoryIcon: 'img/icons/icon-bus.svg',
    role: 'Community support volunteer',
    shift: '10:00 AM – 1:00 PM'
  };

  function renderDetailTasks(tasks) {
    if (!detailTasks) return;
    detailTasks.innerHTML = tasks.map(task => `
      <div class="event-detail-task${task.complete ? ' is-complete' : ''}">
        <img class="event-detail-task-bullet" src="img/icons/icon-stars.svg" alt="">
        <span>${task.text}</span>
      </div>
    `).join('');
  }

  function openEventDetail(eventId) {
    const data = eventDetails[eventId];
    if (!data || !detailPage) return;
    lastEventDetailId = eventId;
    detailPage.classList.remove('detail-theme-distro', 'detail-theme-drive', 'detail-theme-fundraiser');
    detailPage.classList.add(`detail-theme-${data.category}`);
    detailIllustration.src = data.illustration;
    detailIcon.src = data.icon;
    detailIcon.alt = data.title;
    detailTitle.textContent = data.title;
    detailDatetime.textContent = data.datetime;
    detailLocation.textContent = data.locationLabel;
    detailAddress.textContent = data.address;
    var detailCtaLabel = detailCta && detailCta.querySelector('.btn__label');
    if (detailCtaLabel) detailCtaLabel.textContent = data.cta;
    if (detailMapWrap && detailMap) {
      var isOnline = eventId === 'online-fundraiser' || (data.address && data.address.toLowerCase().indexOf('share the') !== -1);
      if (isOnline) {
        detailMapWrap.classList.add('hidden');
        detailMapWrap.setAttribute('aria-hidden', 'true');
        detailMap.removeAttribute('src');
      } else {
        detailMapWrap.classList.remove('hidden');
        detailMapWrap.classList.remove('loaded');
        detailMapWrap.setAttribute('aria-hidden', 'false');
        var mapQuery = (data.locationLabel ? data.locationLabel + ', ' : '') + (data.address || '') + ', Vancouver, BC';
        detailMap.src = 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&output=embed';
      }
    }
    renderDetailTasks(data.tasks);
    showPage('detail');
  }

  // ── Donate Money ──
  const donateState = {
    amount: 25,
    selectedPreset: 25
  };

  let dmIsMonthly = false;
  let donateMoneyConfirmController = null;
  let volunteerConfirmController = null;

  function formatDonateAmount(value) {
    const num = Number(value) || 0;
    return Math.max(0, Math.round(num)).toString();
  }

  function donateImpactCopy(amount, monthly) {
    const context = monthly
      ? 'Each month, this amount could get our neighbours:'
      : 'This amount could get our neighbours:';
    let item = 'essential supplies.';
    if (amount >= 75) item = 'a cot off the frozen ground.';
    else if (amount >= 50) item = 'a sleeping bag rated to -5°C.';
    else if (amount >= 25) item = 'a headlamp, light when there\'s none.';
    else if (amount >= 12) item = 'a tarp, shelter from the rain tonight.';
    return { context: context, item: item };
  }

  function updateDonateUI() {
    if (donateAmountValue) donateAmountValue.textContent = formatDonateAmount(donateState.amount);

    donatePresetButtons.forEach(btn => {
      const amount = Number(btn.dataset.amount);
      btn.classList.toggle('active', donateState.selectedPreset === amount);
    });

    // Impact line cross-dissolve
    const dmImpactLine = document.getElementById('dm-impact-line');
    if (dmImpactLine) {
      const copy = donateImpactCopy(donateState.amount, dmIsMonthly);
      const nextHtml = '<span class="dm-impact-context">' + copy.context + '</span><span class="dm-impact-item">' + copy.item + '</span>';
      if (dmImpactLine.innerHTML !== nextHtml) {
        dmImpactLine.style.opacity = '1';
        dmImpactLine.innerHTML = nextHtml;
      }
    }

    if (donateMoneyCta) {
      donateMoneyCta.textContent = dmIsMonthly
        ? `Contribute $${formatDonateAmount(donateState.amount)} / month`
        : `Contribute $${formatDonateAmount(donateState.amount)}`;
    }
  }

  function setDonateAmount(nextAmount, source) {
    const parsed = Number(nextAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    donateState.amount = Math.round(parsed);

    if (source === 'preset') {
      donateState.selectedPreset = donateState.amount;
      if (donateCustomInput) donateCustomInput.value = '';
    } else if (source === 'custom') {
      donateState.selectedPreset = null;
    }

    updateDonateUI();
  }

  function openDonateMoneyPage() {
    if (activePageName !== 'donate-items') {
      donateReturnPage = activePageName || 'home';
    }
    showPage('donate-items');
  }

  const APPLE_PAY_MERCHANT = 'Distro Disco';
  const APPLE_PAY_CARD_LAST4 = '4242';
  const apPayScrim = document.getElementById('ap-pay-scrim');
  const apPayDrawer = document.getElementById('ap-pay-drawer');
  const apPayGrabber = document.getElementById('ap-pay-grabber');
  const apPayDefault = document.getElementById('ap-pay-state-default');
  const apPayProcessing = document.getElementById('ap-pay-state-processing');
  const apPaySuccess = document.getElementById('ap-pay-state-success');
  const apPayAmountLine = document.getElementById('ap-pay-amount-line');
  const apPayAmountLabel = document.getElementById('ap-pay-amount-label');
  const apPaySecondaryLabel = document.getElementById('ap-pay-secondary-label');
  const apPaySecondaryLine = document.getElementById('ap-pay-secondary-line');
  const apPayTotalLabel = document.getElementById('ap-pay-total-label');
  const apPayTotalLine = document.getElementById('ap-pay-total-line');
  const apPayBtnLabel = document.getElementById('ap-pay-btn-label');
  const apPayCardLine = document.getElementById('ap-pay-card-line');
  const apPaySuccessSub = document.getElementById('ap-pay-success-sub');
  const apPayMerchantName = document.getElementById('ap-pay-merchant-name');
  const apPayPayBtn = document.getElementById('ap-pay-btn');
  const apPayDoneBtn = document.getElementById('ap-pay-done-btn');
  let apPayOpen = false;
  let apPayCurrentAmount = 25;
  let apPayProcessTimer = null;

  function formatAppleAmount(amount) {
    return '$' + Number(amount).toFixed(2);
  }

  function setApplePayState(state) {
    if (apPayDefault) apPayDefault.classList.toggle('is-visible', state === 'default');
    if (apPayProcessing) apPayProcessing.classList.toggle('is-visible', state === 'processing');
    if (apPaySuccess) apPaySuccess.classList.toggle('is-visible', state === 'success');
    if (state !== 'success' && apPaySuccess) apPaySuccess.classList.remove('is-animating');
  }

  function setApplePayContent(amount) {
    apPayCurrentAmount = Number(amount) || 25;
    var amountText = formatAppleAmount(apPayCurrentAmount);
    var monthlySuffix = dmIsMonthly ? ' / month' : '';
    if (apPayMerchantName) apPayMerchantName.textContent = APPLE_PAY_MERCHANT;
    if (apPayAmountLabel) apPayAmountLabel.textContent = dmIsMonthly ? 'Monthly contribution' : 'Contribution amount';
    if (apPayAmountLine) apPayAmountLine.textContent = amountText + ' CAD';
    if (apPaySecondaryLabel) apPaySecondaryLabel.textContent = dmIsMonthly ? 'Billing' : 'Processing fee';
    if (apPaySecondaryLine) apPaySecondaryLine.textContent = dmIsMonthly ? 'Renews monthly' : '$0.00';
    if (apPayTotalLabel) apPayTotalLabel.textContent = dmIsMonthly ? 'Monthly total' : 'Total';
    if (apPayTotalLine) apPayTotalLine.textContent = amountText + ' CAD';
    if (apPayBtnLabel) apPayBtnLabel.textContent = 'Pay ' + amountText + monthlySuffix;
    if (apPayCardLine) apPayCardLine.textContent = 'Visa ···· ' + APPLE_PAY_CARD_LAST4;
    if (apPaySuccessSub) apPaySuccessSub.textContent = dmIsMonthly
      ? amountText + '/month to ' + APPLE_PAY_MERCHANT
      : amountText + ' to ' + APPLE_PAY_MERCHANT;
  }

  function clearApplePayTimer() {
    if (!apPayProcessTimer) return;
    clearTimeout(apPayProcessTimer);
    apPayProcessTimer = null;
  }

  function closeApplePayDrawer() {
    if (!apPayDrawer || !apPayScrim) return;
    clearApplePayTimer();
    apPayOpen = false;
    apPayDrawer.classList.remove('is-open');
    apPayScrim.classList.remove('is-open');
    apPayDrawer.setAttribute('aria-hidden', 'true');
    apPayScrim.setAttribute('aria-hidden', 'true');
    setTimeout(function() {
      if (!apPayOpen) setApplePayState('default');
    }, 380);
  }

  function openApplePayDrawer(amountOverride) {
    if (!apPayDrawer || !apPayScrim) return;
    setApplePayContent(amountOverride != null ? amountOverride : donateState.amount);
    clearApplePayTimer();
    setApplePayState('default');
    apPayOpen = true;
    apPayDrawer.classList.add('is-open');
    apPayScrim.classList.add('is-open');
    apPayDrawer.setAttribute('aria-hidden', 'false');
    apPayScrim.setAttribute('aria-hidden', 'false');
  }

  function triggerApplePaySuccess() {
    setApplePayState('success');
    requestAnimationFrame(function() {
      if (apPaySuccess) apPaySuccess.classList.add('is-animating');
    });
  }

  function triggerApplePayProcessing() {
    clearApplePayTimer();
    setApplePayState('processing');
    apPayProcessTimer = setTimeout(function() {
      apPayProcessTimer = null;
      closeApplePayDrawer();
      if (donateMoneyConfirmController && typeof donateMoneyConfirmController.open === 'function') {
        donateMoneyConfirmController.open({
          amount: apPayCurrentAmount,
          isMonthly: dmIsMonthly
        });
      }
    }, 1800);
  }

  function startApplePayDrag(ev) {
    if (!apPayDrawer || !apPayOpen) return;
    var startY = ev.clientY;
    var moved = false;
    function onMove(moveEv) {
      var delta = moveEv.clientY - startY;
      if (delta > 10) moved = true;
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      if (moved) closeApplePayDrawer();
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  window.openDrawer = openApplePayDrawer;
  window.triggerProcessing = triggerApplePayProcessing;
  window.triggerSuccess = triggerApplePaySuccess;

  if (donateMoneyCta) {
    donateMoneyCta.addEventListener('click', function() {
      openApplePayDrawer(donateState.amount);
    });
  }
  if (apPayScrim) apPayScrim.addEventListener('click', closeApplePayDrawer);
  if (apPayGrabber) apPayGrabber.addEventListener('pointerdown', startApplePayDrag);
  if (apPayPayBtn) apPayPayBtn.addEventListener('click', triggerApplePayProcessing);
  if (apPayDoneBtn) apPayDoneBtn.addEventListener('click', closeApplePayDrawer);

  if (dmSwitchToItems) dmSwitchToItems.addEventListener('click', function() {
    window.__swapIconAnimTarget = 'donate-items';
    showPage('donate-items');
  });

  donatePresetButtons.forEach(btn => {
    btn.addEventListener('click', () => setDonateAmount(btn.dataset.amount, 'preset'));
  });

  if (donateCustomInput) {
    donateCustomInput.addEventListener('input', () => {
      const raw = donateCustomInput.value.trim();
      if (!raw) { donateState.selectedPreset = null; updateDonateUI(); return; }
      setDonateAmount(raw, 'custom');
    });
  }

  if (donateAmountValue) {
    donateAmountValue.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        donateAmountValue.blur();
      }
    });
    donateAmountValue.addEventListener('focus', function() {
      var range = document.createRange();
      range.selectNodeContents(donateAmountValue);
      var sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    donateAmountValue.addEventListener('input', function() {
      var raw = (donateAmountValue.textContent || '').replace(/\D+/g, '');
      if (!raw) {
        donateState.selectedPreset = null;
        return;
      }
      if (donateAmountValue.textContent !== raw) donateAmountValue.textContent = raw;
      setDonateAmount(raw, 'custom');
    });
    donateAmountValue.addEventListener('blur', function() {
      if (!donateAmountValue.textContent || !donateAmountValue.textContent.trim()) {
        donateAmountValue.textContent = formatDonateAmount(donateState.amount);
      }
    });
  }

  // Monthly toggle
  const dmMonthlyToggle = document.getElementById('dm-monthly-toggle');
  if (dmMonthlyToggle) {
    dmMonthlyToggle.addEventListener('click', () => {
      dmIsMonthly = !dmIsMonthly;
      dmMonthlyToggle.classList.toggle('on', dmIsMonthly);
      dmMonthlyToggle.setAttribute('aria-checked', dmIsMonthly ? 'true' : 'false');
      updateDonateUI();
    });
  }

  // Copy-email
  const dmCopyEmailBtn = document.getElementById('dm-copy-email');
  const dmCopyConfirm = document.getElementById('dm-copy-confirm');
  if (dmCopyEmailBtn) {
    dmCopyEmailBtn.addEventListener('click', () => {
      const email = 'distrodisco@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(textarea);
      }
      if (dmCopyConfirm) {
        dmCopyConfirm.classList.add('visible');
        setTimeout(() => dmCopyConfirm.classList.remove('visible'), 1800);
      }
    });
  }

  updateDonateUI();

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const labelSpan = item.querySelector('span:last-of-type') || item.querySelector('span');
      const label = labelSpan?.textContent?.trim().toLowerCase();
      if (label === 'home') {
        var homeSvg = item.querySelector('.icon-home');
        if (homeSvg) {
          homeSvg.classList.remove('active');
          void homeSvg.offsetWidth;
          homeSvg.classList.add('active');
          setTimeout(function() { homeSvg.classList.remove('active'); }, 550);
        }
        showPage('home');
      } else if (label === 'events') {
        var calSvg = item.querySelector('.icon-calendar');
        if (calSvg) {
          calSvg.classList.remove('active');
          void calSvg.offsetWidth;
          calSvg.classList.add('active');
          setTimeout(function() { calSvg.classList.remove('active'); }, 520);
        }
        showPage('events');
      }
      else if (label === 'volunteer') {
        var itemsSvg = item.querySelector('.icon-items');
        if (itemsSvg) {
          itemsSvg.classList.remove('active');
          void itemsSvg.offsetWidth;
          itemsSvg.classList.add('active');
          setTimeout(function() { itemsSvg.classList.remove('active'); }, 600);
        }
        showPage('volunteer');
      }
      else if (label === 'forums') {
        var forumSvg = item.querySelector('.icon-forum');
        if (forumSvg) {
          forumSvg.classList.remove('active');
          void forumSvg.offsetWidth;
          forumSvg.classList.add('active');
          setTimeout(function() { forumSvg.classList.remove('active'); }, 620);
        }
        showPage('forums');
      }
    });
  });

  settingsButtons.forEach(btn => {
    btn.addEventListener('click', openSettingsPage);
  });

  // ── Avatar picker ──
  (function initAvatarPicker() {
    var AVATARS = [
      { bg: '#F2D5D5', src: 'img/avatars/avatar-cool-disco.png' },
      { bg: '#C9DECE', src: 'img/avatars/avatar-cowboy.png' },
      { bg: '#F0E6CB', src: 'img/avatars/avatar-flowers.png' },
      { bg: '#C3D3E6', src: 'img/avatars/avatar-ribbon.png' },
      { bg: '#F9D6C4', src: 'img/avatars/avatar-toque.png' },
    ];
    var CURRENT_AVATAR_IDX = 0;

    var backdrop = document.getElementById('avatar-sheet-backdrop');
    var sheet = document.getElementById('avatar-sheet');
    var scroll = document.getElementById('avatar-sheet-scroll');
    var saveBtn = document.getElementById('avatar-sheet-save');
    var avatarDisplay = document.getElementById('prof-avatar-display');
    var avatarWrap = document.getElementById('prof-avatar-wrap');

    var selectedIdx = CURRENT_AVATAR_IDX;

    // Build avatar options
    if (scroll) {
      AVATARS.forEach(function(av, i) {
        var el = document.createElement('div');
        el.className = 'avatar-option' + (i === CURRENT_AVATAR_IDX ? ' is-selected' : '');
        el.style.background = av.bg;
        el.dataset.idx = i;
        var img = document.createElement('img');
        img.src = av.src;
        img.alt = '';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center;border-radius:50%;';
        el.appendChild(img);
        el.addEventListener('click', function() {
          selectedIdx = i;
          scroll.querySelectorAll('.avatar-option').forEach(function(o) { o.classList.remove('is-selected'); });
          el.classList.add('is-selected');
          if (saveBtn) saveBtn.disabled = false;
        });
        scroll.appendChild(el);
      });
    }
    // Apply default avatar to profile on start
    if (avatarDisplay && AVATARS[CURRENT_AVATAR_IDX]) {
      var def = AVATARS[CURRENT_AVATAR_IDX];
      avatarDisplay.style.background = def.bg;
      avatarDisplay.textContent = '';
      var img = document.createElement('img');
      img.src = def.src;
      img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center;border-radius:50%;';
      avatarDisplay.appendChild(img);
    }

    function openSheet() {
      if (!backdrop || !sheet) return;
      // Hard stop confetti when avatar popup opens
      clearTimeout(profileConfettiTimerId);
      profileConfettiTimerId = null;
      profileConfettiAbort = true;
      if (profileConfettiCanvas && profileConfettiCanvas.parentNode) {
        profileConfettiCanvas.parentNode.removeChild(profileConfettiCanvas);
        profileConfettiCanvas = null;
      }
      selectedIdx = CURRENT_AVATAR_IDX;
      if (saveBtn) saveBtn.disabled = true;
      if (scroll) {
        scroll.querySelectorAll('.avatar-option').forEach(function(o, i) {
          o.classList.toggle('is-selected', i === CURRENT_AVATAR_IDX && CURRENT_AVATAR_IDX >= 0);
        });
      }
      backdrop.classList.add('is-open');
      sheet.classList.remove('is-closing');
      requestAnimationFrame(function() { sheet.classList.add('is-open'); });
    }

    function closeSheet(onDone) {
      if (!backdrop || !sheet) return;
      sheet.classList.add('is-closing');
      sheet.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      setTimeout(function() {
        sheet.classList.remove('is-closing');
        if (onDone) onDone();
      }, 320);
    }

    if (avatarWrap) {
      avatarWrap.addEventListener('click', openSheet);
    }

    if (backdrop) {
      backdrop.addEventListener('click', function() { closeSheet(); });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var chosen = AVATARS[selectedIdx];
        CURRENT_AVATAR_IDX = selectedIdx;
        closeSheet(function() {
          if (avatarDisplay) {
            avatarDisplay.style.transition = 'opacity 250ms ease';
            avatarDisplay.style.opacity = '0';
            setTimeout(function() {
              avatarDisplay.style.background = chosen.bg;
              avatarDisplay.textContent = '';
              var existing = avatarDisplay.querySelector('img');
              if (existing) existing.remove();
              var img = document.createElement('img');
              img.src = chosen.src;
              img.alt = '';
              img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center;border-radius:50%;';
              avatarDisplay.appendChild(img);
              avatarDisplay.style.opacity = '1';
            }, 120);
          }
        });
      });
    }
  })();

  function syncNotificationsUnreadState() {
    var list = document.getElementById('activities-list');
    if (!list) return;
    var unread = list.querySelectorAll('.activities-item[data-read="false"]').length;
    var pageActivities = document.querySelector('.page-activities');
    if (pageActivities) {
      pageActivities.classList.toggle('notifications-all-read', unread === 0);
    }
    document.querySelectorAll('.top-nav-activities').forEach(function(btn) {
      var badge = btn.querySelector('.item-badge');
      if (unread > 0) {
        btn.classList.add('has-unread');
        if (badge) badge.textContent = String(unread);
      } else {
        btn.classList.remove('has-unread');
        if (badge) badge.textContent = '0';
      }
    });
  }

  function markActivitiesNotificationRead(item) {
    if (!item || item.getAttribute('data-read') !== 'false') return;
    item.setAttribute('data-read', 'true');
    item.classList.remove('activities-item-unread');
    item.classList.add('activities-item-read');
    var dot = item.querySelector('.activities-item-dot');
    if (dot) dot.className = 'activities-item-dot activities-item-dot-spacer';
    syncNotificationsUnreadState();
  }

  function navigateFromActivitiesItem(item) {
    if (!item) return;
    var nav = item.getAttribute('data-nav');
    if (nav === 'forum-detail') {
      var postId = item.getAttribute('data-post-id');
      if (!postId) return;
      var rcStr = item.getAttribute('data-reply-count');
      var replyCount;
      if (rcStr != null && rcStr !== '') {
        replyCount = parseInt(rcStr, 10);
      } else {
        var card = document.querySelector('#forum-board .bpost[data-post-id="' + postId + '"]');
        replyCount = card ? parseInt(card.getAttribute('data-reply-count') || '0', 10) : 0;
      }
      if (!Number.isFinite(replyCount)) replyCount = 0;
      showPage('forum-detail');
      openForumPostDetail(postId, replyCount);
      return;
    }
    if (nav === 'event-detail') {
      var eventId = item.getAttribute('data-event-id');
      if (eventId) {
        eventDetailReturnPage = 'activities';
        openEventDetail(eventId);
      }
      return;
    }
    if (nav === 'volunteer' || nav === 'events' || nav === 'forums') {
      showPage(nav);
    }
  }

  const activitiesFilterRow = document.getElementById('activities-filter-row');
  const activitiesList = document.getElementById('activities-list');
  if (activitiesFilterRow && activitiesList) {
    activitiesFilterRow.querySelectorAll('.activities-filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        activitiesFilterRow.querySelectorAll('.activities-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter') || 'recent';
        activitiesList.closest('.page-activities').setAttribute('data-filter', filter);
      });
    });
    activitiesList.addEventListener('click', function(e) {
      var item = e.target.closest && e.target.closest('.activities-item');
      if (!item || !activitiesList.contains(item)) return;
      e.preventDefault();
      e.stopPropagation();
      markActivitiesNotificationRead(item);
      navigateFromActivitiesItem(item);
    });
    syncNotificationsUnreadState();
  }

  document.querySelectorAll('.top-nav-profile').forEach(btn => {
    btn.addEventListener('click', openProfilePage);
  });
  document.querySelectorAll('.top-nav-activities').forEach(btn => {
    btn.addEventListener('click', openNotificationsPage);
  });

  /* Mobile: open Settings/Profile on touchend so navigation works when synthesized click doesn't fire */
  document.addEventListener('touchend', function navIconTouchend(e) {
    var el = e.target && e.target.closest && e.target.closest('.top-nav-settings, .top-nav-profile, .top-nav-activities');
    if (!el) return;
    e.preventDefault();
    if (el.classList.contains('top-nav-settings')) openSettingsPage();
    else if (el.classList.contains('top-nav-profile')) openProfilePage();
    else if (el.classList.contains('top-nav-activities')) openNotificationsPage();
  }, { passive: false, capture: true });

  const profSettingsLink = document.getElementById('prof-settings-link');
  if (profSettingsLink) {
    profSettingsLink.addEventListener('click', openSettingsPage);
  }

  const profKeepContributingBtn = document.getElementById('prof-keep-contributing-btn');
  if (profKeepContributingBtn) {
    profKeepContributingBtn.addEventListener('click', () => openDonateMoneyPage());
  }

  document.querySelectorAll('.event-card .btn[data-event-id]').forEach(btn => {
    btn.addEventListener('click', function() {
      eventDetailReturnPage = 'home';
      openEventDetail(btn.dataset.eventId);
    });
  });

  function goBackFromEventDetail() {
    var target = eventDetailReturnPage;
    if (!target || target === 'detail') target = 'home';
    showPage(target);
  }

  var detailGoBackBtn = document.getElementById('event-detail-go-back');
  if (detailGoBackBtn) {
    detailGoBackBtn.addEventListener('click', goBackFromEventDetail);
  }
  if (detailBackArrowBtn) {
    detailBackArrowBtn.addEventListener('click', goBackFromEventDetail);
  }
  document.querySelectorAll('.event-end-cta').forEach(btn => {
    btn.addEventListener('click', () => showPage('donate-items'));
  });

  var CALENDAR_MONTH_INDEX = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };

  function ddCalendarCellToISODate(cell) {
    if (!cell || cell.classList.contains('empty')) return null;
    var numEl = cell.querySelector('.day-num');
    if (!numEl) return null;
    var dayNum = parseInt(numEl.textContent.trim(), 10);
    if (!Number.isFinite(dayNum)) return null;
    var grid = cell.closest('.cal-grid');
    if (!grid) return null;
    var monthKey = (grid.getAttribute('data-cal-month') || '').toLowerCase();
    var monthIdx = CALENDAR_MONTH_INDEX[monthKey];
    if (monthIdx === undefined) return null;
    var yearAttr = grid.getAttribute('data-cal-year');
    var year = yearAttr ? parseInt(yearAttr, 10) : new Date().getFullYear();
    if (!Number.isFinite(year)) year = new Date().getFullYear();
    var month = monthIdx + 1;
    var pad = function(n) { return n < 10 ? '0' + n : String(n); };
    return year + '-' + pad(month) + '-' + pad(dayNum);
  }

  (function initCalendarDayPlaceholder() {
    var calCard = document.querySelector('.page-events .cal-card');
    if (!calCard) return;

    var activeCell = null;
    var removeTimer = null;
    var placeholder = document.createElement('div');
    placeholder.className = 'cal-day-placeholder';

    function clearSelection() {
      calCard.querySelectorAll('.cal-grid .day-cell.is-selected').forEach(function(el) {
        el.classList.remove('is-selected');
      });
      activeCell = null;
    }

    function closePlaceholder() {
      if (!placeholder.parentNode) return;
      placeholder.classList.remove('is-open');
      if (removeTimer) clearTimeout(removeTimer);
      removeTimer = setTimeout(function() {
        removeTimer = null;
        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      }, 260);
      clearSelection();
    }

    function getDayType(cell) {
      if (cell.classList.contains('empty')) return 'empty';
      if (cell.classList.contains('fundraiser')) return 'fundraiser';
      if (cell.classList.contains('drive')) return 'drive';
      if (cell.classList.contains('distro')) return 'distro';
      return 'none';
    }

    function buildPlaceholderCopy(cell, monthLabel, dayNumber) {
      var dayType = getDayType(cell);
      if (dayType === 'empty') {
        return {
          title: 'No date selected here',
          copy: 'This is an empty calendar slot. Placeholder card appears here so row insertion behavior stays consistent.'
        };
      }
      if (dayType === 'none') {
        return {
          title: monthLabel + ' ' + dayNumber + ' — no events',
          copy: 'No event is scheduled for this date.'
        };
      }

      var labelMap = {
        fundraiser: 'Fundraiser',
        drive: 'Drive',
        distro: 'Distro'
      };
      var moodSuffix = cell.classList.contains('muted') || cell.classList.contains('faded')
        ? ' This date is outside the active month range.'
        : '';
      return {
        title: monthLabel + ' ' + dayNumber + ' — ' + labelMap[dayType],
        copy: 'Event details are not linked for this day yet.' + moodSuffix
      };
    }

    function setGreyPlaceholder(cell, monthLabel, dayNumber) {
      placeholder.classList.remove('cal-day-placeholder--event');
      var content = buildPlaceholderCopy(cell, monthLabel, dayNumber);
      var k = cell.classList.contains('today') ? '<p class="cal-day-placeholder-title">Today</p>' : '';
      placeholder.innerHTML = '<div class="cal-day-placeholder-inner">' + k + '<p class="cal-day-placeholder-title"></p><p class="cal-day-placeholder-copy"></p></div>';
      var ts = placeholder.querySelectorAll('.cal-day-placeholder-title');
      var titleEl = ts[ts.length - 1];
      var copyEl = placeholder.querySelector('.cal-day-placeholder-copy');
      if (titleEl) titleEl.textContent = content.title;
      if (copyEl) copyEl.textContent = content.copy;
    }

    function isAprilCalendarPastDay(cell) {
      var grid = cell.closest('.cal-grid');
      if (!grid) return false;
      var month = (grid.getAttribute('data-cal-month') || '').toLowerCase();
      if (month !== 'april') return false;
      var numEl = cell.querySelector('.day-num');
      if (!numEl) return false;
      var n = parseInt(numEl.textContent.trim(), 10);
      if (!Number.isFinite(n)) return false;
      return n < 9;
    }

    function findHomeEventCardForCalendar(eventId) {
      var esc = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(eventId) : eventId.replace(/"/g, '\\"');
      var activeSel = '.page-home .section.events .events-panel.active .card.event-card[data-event-id="' + esc + '"]:not(.event-end-card)';
      var el = document.querySelector(activeSel);
      if (el) return el;
      return document.querySelector('.page-home .section.events .card.event-card[data-event-id="' + esc + '"]:not(.event-end-card)');
    }

    function setEventCardPlaceholder(eventId, cell) {
      var source = findHomeEventCardForCalendar(eventId);
      if (!source || !eventDetails[eventId]) return false;
      placeholder.classList.add('cal-day-placeholder--event');
      placeholder.innerHTML = '';
      var wrap = document.createElement('div');
      wrap.className = 'cal-day-placeholder-event-wrap';
      var clone = source.cloneNode(true);
      var origBtn = clone.querySelector('.btn[data-event-id]');
      if (origBtn) {
        var eid = origBtn.getAttribute('data-event-id');
        var ctaWrap = document.createElement('div');
        ctaWrap.className = 'cal-placeholder-card-ctas';
        var primaryBtn = document.createElement('button');
        primaryBtn.type = 'button';
        primaryBtn.className = 'btn btn-primary';
        primaryBtn.setAttribute('data-event-id', eid);
        primaryBtn.innerHTML = '<span class="btn__label">View details</span>';
        var volBtnEl = document.createElement('button');
        volBtnEl.type = 'button';
        volBtnEl.className = 'btn btn-secondary cal-placeholder-volunteer-btn';
        volBtnEl.setAttribute('data-event-id', eid);
        volBtnEl.innerHTML = '<span class="btn__label">Volunteer for this event</span>';
        ctaWrap.appendChild(primaryBtn);
        ctaWrap.appendChild(volBtnEl);
        origBtn.replaceWith(ctaWrap);
      }
      if (isAprilCalendarPastDay(cell)) {
        wrap.classList.add('cal-day-placeholder-event-wrap--past');
        var primaryPast = clone.querySelector('.cal-placeholder-card-ctas .btn.btn-primary');
        var volPast = clone.querySelector('.cal-placeholder-volunteer-btn');
        if (primaryPast) {
          primaryPast.removeAttribute('data-event-id');
          primaryPast.disabled = true;
          primaryPast.setAttribute('aria-disabled', 'true');
          var pLabel = primaryPast.querySelector('.btn__label');
          if (pLabel) pLabel.textContent = 'This event is over :(';
        }
        if (volPast) {
          volPast.removeAttribute('data-event-id');
          volPast.disabled = true;
          volPast.setAttribute('aria-disabled', 'true');
        }
      }
      wrap.appendChild(clone);
      placeholder.appendChild(wrap);
      return true;
    }

    function openForCell(cell) {
      var grid = cell.closest('.cal-grid');
      if (!grid) return;
      var dayCells = Array.from(grid.querySelectorAll('.day-cell'));
      var idx = dayCells.indexOf(cell);
      if (idx < 0) return;

      var weekIndex = Math.floor(idx / 7);
      var rowEndIndex = Math.min(((weekIndex + 1) * 7) - 1, dayCells.length - 1);
      var rowEndCell = dayCells[rowEndIndex];
      if (!rowEndCell) return;

      if (removeTimer) {
        clearTimeout(removeTimer);
        removeTimer = null;
      }
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);

      var dayNumberEl = cell.querySelector('.day-num');
      var dayNumber = dayNumberEl ? dayNumberEl.textContent.trim() : '--';
      var monthLabel = (grid.getAttribute('data-cal-month') || '').trim();
      monthLabel = monthLabel ? monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1) : 'Selected date';

      var eventId = cell.getAttribute('data-event-id');
      if (!eventId || !setEventCardPlaceholder(eventId, cell)) {
        setGreyPlaceholder(cell, monthLabel, dayNumber);
      }

      clearSelection();
      cell.classList.add('is-selected');
      activeCell = cell;

      rowEndCell.insertAdjacentElement('afterend', placeholder);
      requestAnimationFrame(function() {
        placeholder.classList.add('is-open');
      });
    }

    calCard.addEventListener('click', function(e) {
      var calVolBtn = e.target.closest('.cal-day-placeholder .cal-placeholder-volunteer-btn');
      if (calVolBtn && calCard.contains(calVolBtn) && !calVolBtn.disabled && calVolBtn.getAttribute('data-event-id')) {
        e.preventDefault();
        e.stopPropagation();
        var vid = calVolBtn.getAttribute('data-event-id');
        var ev = eventDetails[vid];
        if (!ev || !window.__openVolunteerConfirm) return;
        var locParts = [ev.locationLabel, ev.address].filter(Boolean);
        var loc = locParts.length ? locParts.join(', ') : VOLUNTEER_CONFIRM_DEFAULTS.eventLocation;
        window.__openVolunteerConfirm({
          eventTitle: ev.title,
          eventDateTime: ev.datetime,
          eventDate: ev.eventDate || VOLUNTEER_CONFIRM_DEFAULTS.eventDate,
          eventLocation: loc,
          categoryIcon: ev.icon,
          role: VOLUNTEER_CONFIRM_DEFAULTS.role,
          shift: VOLUNTEER_CONFIRM_DEFAULTS.shift
        }, 'events');
        return;
      }
      var detailBtn = e.target.closest('.cal-day-placeholder .btn[data-event-id]');
      if (detailBtn && calCard.contains(detailBtn) && !detailBtn.classList.contains('events-detail-view-calendar')) {
        e.preventDefault();
        e.stopPropagation();
        eventDetailReturnPage = 'events';
        openEventDetail(detailBtn.getAttribute('data-event-id'));
        return;
      }
      var cell = e.target.closest('.cal-grid .day-cell');
      if (!cell || !calCard.contains(cell)) return;
      if (cell === activeCell && placeholder.parentNode) {
        closePlaceholder();
        return;
      }
      openForCell(cell);
    });

    function openCalendarTodayIfPresent() {
      var cell = calCard.querySelector('.cal-grid .day-cell.today');
      if (!cell || cell.classList.contains('empty') || cell.classList.contains('day-cell-hidden')) return;
      openForCell(cell);
    }

    window.__ddOpenEventsCalendarToday = openCalendarTodayIfPresent;

    window.__ddGetCalendarAddEventPrefillISO = function() {
      return ddCalendarCellToISODate(activeCell);
    };
  })();

  // ── Forum & Compose Pages ──
  const forumPostDetails = {
    'post-1': { title: "This Saturday's set-up crew, let's talk about it!", body: "Looking for a few folks to help with tables and signage from 9am. Comment if you can make it and I'll add you to the group chat.", author: 'Rgdfriend', time: '1 day ago', category: 'General' },
    'post-2': { title: "What's volunteering actually like at DD?", body: "I've been wanting to volunteer more but I'm not sure where to start. If you were new once, what actually made you come back?", author: 'GracelleM', time: '2 days ago', category: 'Question' },
    'post-3': { title: 'Online deals for supplies this week', body: 'Found some discount codes for Canadian Tire. Tents, thermal socks, gloves all on sale. Sharing here if you have financial capacity this month.', author: 'CaitlinV', time: '3 days ago', category: 'General' },
    'post-4': { title: 'Do I need to bring my own bags for the distro?', body: 'First time attending next Saturday. Is there a list of what to bring or does everything get provided on the day?', author: 'DogaCM', time: '5 days ago', category: 'Question' },
    'post-5': { title: 'Thank you to everyone who came out last Saturday', body: 'We distributed over 80 hygiene kits, 40 warm meals, and 60 pairs of socks. Could not have done it without every single one of you. See you next time.', author: 'JiWoo_DD', time: '1 week ago', category: 'General' }
  };

  const forumPostLikeState = {};

  function initForumLikeStateFromDom() {
    document.querySelectorAll('#forum-board .bpost-like-btn').forEach(function(btn) {
      var id = btn.getAttribute('data-post-id');
      if (!id) return;
      var countEl = btn.querySelector('.bpost-like-count');
      var n = parseInt((countEl && countEl.textContent.trim()) || '0', 10);
      var liked = btn.getAttribute('aria-pressed') === 'true';
      forumPostLikeState[id] = { count: n, liked: liked };
    });
  }

  function applyLikeButtonState(btn, st) {
    var countEl = btn.querySelector('.bpost-like-count');
    if (countEl) countEl.textContent = String(st.count);
    btn.setAttribute('aria-pressed', st.liked ? 'true' : 'false');
    btn.classList.toggle('is-liked', st.liked);
    btn.setAttribute('aria-label', st.liked ? 'Unlike' : 'Like');
  }

  function syncAllLikeButtonsForPost(postId) {
    var st = forumPostLikeState[postId];
    if (!st) return;
    document.querySelectorAll('.bpost-like-btn[data-post-id="' + postId + '"]').forEach(function(btn) {
      applyLikeButtonState(btn, st);
    });
  }

  function toggleForumPostLike(postId) {
    var st = forumPostLikeState[postId];
    if (!st) {
      st = { count: 0, liked: false };
      forumPostLikeState[postId] = st;
    }
    if (st.liked) {
      st.liked = false;
      st.count = Math.max(0, st.count - 1);
    } else {
      st.liked = true;
      st.count += 1;
    }
    syncAllLikeButtonsForPost(postId);
  }

  const forumCommentLikeState = {};

  function getForumCommentLikeState(key, initialCount) {
    if (forumCommentLikeState[key] === undefined) {
      forumCommentLikeState[key] = { count: initialCount, liked: false };
    }
    return forumCommentLikeState[key];
  }

  function applyForumCommentLikeButton(btn) {
    var key = btn.getAttribute('data-comment-like-key');
    if (!key) return;
    var st = forumCommentLikeState[key];
    if (!st) return;
    var countEl = btn.querySelector('.forum-comment-like-count');
    if (countEl) countEl.textContent = String(st.count);
    btn.setAttribute('aria-pressed', st.liked ? 'true' : 'false');
    btn.classList.toggle('is-liked', st.liked);
    btn.setAttribute('aria-label', st.liked ? 'Unlike' : 'Like');
  }

  function toggleForumCommentLike(key) {
    var st = forumCommentLikeState[key];
    if (!st) return false;
    if (st.liked) {
      st.liked = false;
      st.count = Math.max(0, st.count - 1);
    } else {
      st.liked = true;
      st.count += 1;
    }
    document.querySelectorAll('.forum-comment-like-btn[data-comment-like-key="' + key + '"]').forEach(applyForumCommentLikeButton);
    return true;
  }

  function playLikeButtonAnimation(btn, isLikedNow) {
    if (!btn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var icon = btn.querySelector('.like-icon');
    if (!icon) return;
    btn._likeAnimGen = (btn._likeAnimGen || 0) + 1;
    var gen = btn._likeAnimGen;
    icon.querySelectorAll('.like-burst-particle').forEach(function(p) {
      p.remove();
    });
    btn.classList.remove('animate-like', 'animate-unlike');
    void btn.offsetWidth;
    btn.classList.add(isLikedNow ? 'animate-like' : 'animate-unlike');

    var particles = [];
    if (isLikedNow) {
      for (var i = 0; i < 6; i++) {
        var p = document.createElement('span');
        p.className = 'like-burst-particle';
        p.style.setProperty('--angle', (i * 60) + 'deg');
        icon.appendChild(p);
        particles.push(p);
      }
    }

    function onIconAnimationEnd(e) {
      if (e.target !== icon) return;
      if (gen !== btn._likeAnimGen) return;
      var name = e.animationName || '';
      if (name !== 'forum-like-pop' && name !== 'forum-unlike-pop') return;
      btn.classList.remove('animate-like', 'animate-unlike');
      icon.removeEventListener('animationend', onIconAnimationEnd);
      particles.forEach(function(p) {
        if (p.parentNode) p.remove();
      });
    }
    icon.addEventListener('animationend', onIconAnimationEnd);
  }

  const forumDetailCommentsByPost = {
    'post-1': [
      { author: 'GracelleM', time: '2h', body: 'Count me in for Saturday set-up. I can be there by 8:30 with tape and a couple folding tables. Text me when you lock headcount?', upvotes: 3 },
      { author: 'Rgdfriend', time: '1h', body: 'Perfect. I\'ll text you once I have numbers.', upvotes: 2 }
    ],
    'post-2': [
      { author: 'Sam_M', time: '2d', body: 'Honestly it was way less awkward than I pictured. Someone just said hi and gave me a simple job right away.', upvotes: 12 },
      { author: 'AlexK', time: '1d', body: 'Same, I almost bailed on my first shift. Really glad I didn\'t.', upvotes: 5 },
      { author: 'JordanT', time: '1d', body: 'The debrief at the end got me. Felt like we actually did something real that day.', upvotes: 8 },
      { author: 'MorganP', time: '2d', body: 'Nobody makes you feel dumb for asking basic questions. That kept me coming.', upvotes: 7 },
      { author: 'CaseyL', time: '3d', body: 'Took me two visits before I remembered anyone\'s name. Still worth it.', upvotes: 3 },
      { author: 'QuinnR', time: '4d', body: 'Schedule is pretty flexible and nobody guilt trips you if you miss a week.', upvotes: 6 },
      { author: 'RileyJ', time: '1d', body: 'If you\'re on the fence, try one shift. Worst case you tried it once.', upvotes: 9 }
    ],
    'post-3': [
      { author: 'DogaCM', time: '2d', body: 'Thanks for this, grabbing socks this weekend.', upvotes: 4 },
      { author: 'AlexK', time: '1d', body: 'Do you know if the tent code works online too or in store only?', upvotes: 3 },
      { author: 'Sam_M', time: '1d', body: 'Shared with my roommates, appreciate you posting.', upvotes: 5 },
      { author: 'JordanT', time: '3d', body: 'Legend, saved me a bunch of googling.', upvotes: 7 },
      { author: 'CaseyL', time: '2d', body: 'Is the gloves deal still good Monday?', upvotes: 2 },
      { author: 'MorganP', time: '1d', body: 'Every bit helps, seriously. Thank you.', upvotes: 6 }
    ],
    'post-4': [
      { author: 'RileyJ', time: '2d', body: 'You don\'t have to, but if you have a couple reusable bags they sometimes run short.', upvotes: 10 },
      { author: 'GracelleM', time: '1d', body: 'We usually have paper bags at the table. Extras never hurt though.', upvotes: 14 },
      { author: 'AlexK', time: '1d', body: 'First timer too, following for the answers lol.', upvotes: 4 },
      { author: 'Sam_M', time: '3d', body: 'Check the volunteer channel if you have access, there\'s a pinned checklist.', upvotes: 8 },
      { author: 'JordanT', time: '2d', body: 'I brought two bags last time and they used them in like five minutes.', upvotes: 5 },
      { author: 'QuinnR', time: '4d', body: 'Nothing wild required. Show up as you are.', upvotes: 6 },
      { author: 'CaseyL', time: '1d', body: 'Water bottle and layers was the best advice I got.', upvotes: 3 },
      { author: 'AveryW', time: '12h', body: 'See you Saturday!', upvotes: 2 }
    ],
    'post-5': [
      { author: 'CaitlinV', time: '2d', body: 'Thank YOU for coordinating all of that. Seriously.', upvotes: 11 },
      { author: 'DogaCM', time: '1d', body: 'Proud we get to be part of this.', upvotes: 8 },
      { author: 'AlexK', time: '1d', body: 'Those numbers are amazing. Nice work everyone.', upvotes: 9 },
      { author: 'Sam_M', time: '3d', body: 'Already looking forward to the next one.', upvotes: 5 }
    ]
  };

  const forumDetailCommentsFallback = [
    { author: 'AlexK', time: '1d', body: 'Same here, thanks for posting.', upvotes: 3 },
    { author: 'Sam_M', time: '2d', body: 'Following this thread.', upvotes: 2 },
    { author: 'JordanT', time: '3d', body: 'Appreciate the update.', upvotes: 4 }
  ];

  function resetForumDetailComposerChrome() {
    var input = document.getElementById('forum-detail-comment-input');
    if (input) input.placeholder = 'Write a comment…';
    var postBtnLabel = document.querySelector('#forum-detail-comment-post .btn__label');
    if (postBtnLabel) postBtnLabel.textContent = 'Post comment';
    var lab = document.querySelector('label[for="forum-detail-comment-input"]');
    if (lab) lab.textContent = 'Add a comment';
  }

  function setForumDetailComposerReplyMode() {
    var input = document.getElementById('forum-detail-comment-input');
    if (input) input.placeholder = 'Write a reply…';
    var postBtnLabel = document.querySelector('#forum-detail-comment-post .btn__label');
    if (postBtnLabel) postBtnLabel.textContent = 'Post reply';
    var lab = document.querySelector('label[for="forum-detail-comment-input"]');
    if (lab) lab.textContent = 'Add a reply';
  }

  function restoreForumDetailComposerToDefault() {
    var interactions = document.getElementById('forum-detail-interactions');
    var composer = document.querySelector('.forum-detail-comment-composer');
    if (!interactions || !composer) return;
    if (composer.parentNode !== interactions) {
      var actionsRow = interactions.querySelector('.forum-detail-actions-row');
      if (actionsRow) actionsRow.insertAdjacentElement('afterend', composer);
      else interactions.appendChild(composer);
    }
    composer.classList.remove('forum-detail-comment-composer--nested');
    resetForumDetailComposerChrome();
  }

  function ensureCommentRepliesEl(commentNode) {
    var el = commentNode.querySelector(':scope > .forum-comment-replies');
    if (!el) {
      el = document.createElement('div');
      el.className = 'forum-comment-replies';
      commentNode.appendChild(el);
    }
    return el;
  }

  function anchorForumDetailComposerUnderComment(commentNode) {
    var composer = document.querySelector('.forum-detail-comment-composer');
    if (!composer || !commentNode) return;
    commentNode.classList.remove('collapsed');
    var repliesEl = ensureCommentRepliesEl(commentNode);
    repliesEl.insertBefore(composer, repliesEl.firstChild);
    composer.classList.add('forum-detail-comment-composer--nested');
    setForumDetailComposerReplyMode();
  }

  function openForumPostDetail(postId, replyCount) {
    const details = forumPostDetails[postId];
    if (!details) return;
    restoreForumDetailComposerToDefault();
    const titleEl = document.getElementById('forum-detail-title');
    const authorEl = document.getElementById('forum-detail-post-author');
    const timeEl = document.getElementById('forum-detail-post-time');
    const postTitleEl = document.getElementById('forum-detail-post-title');
    const bodyEl = document.getElementById('forum-detail-post-body');
    const container = document.getElementById('forum-detail-comments');
    const deleteBtn = document.getElementById('forum-detail-delete');
    if (deleteBtn) {
      deleteBtn.dataset.postId = postId;
      deleteBtn.style.display = details.author === 'Rgdfriend' ? '' : 'none';
    }
    if (titleEl) titleEl.textContent = details.title.length > 40 ? details.title.slice(0, 40) + '…' : details.title;
    if (authorEl) authorEl.textContent = details.author;
    if (timeEl) timeEl.textContent = details.time;
    if (postTitleEl) postTitleEl.textContent = details.title;
    if (bodyEl) bodyEl.textContent = details.body;
    var detailLikeBtn = document.getElementById('forum-detail-like-btn');
    if (detailLikeBtn) detailLikeBtn.setAttribute('data-post-id', postId);
    if (forumPostLikeState[postId] === undefined) {
      var listLike = document.querySelector('#forum-board .bpost-like-btn[data-post-id="' + postId + '"]');
      if (listLike) {
        var lc = listLike.querySelector('.bpost-like-count');
        forumPostLikeState[postId] = {
          count: parseInt((lc && lc.textContent.trim()) || '0', 10),
          liked: listLike.getAttribute('aria-pressed') === 'true'
        };
      } else {
        forumPostLikeState[postId] = { count: 0, liked: false };
      }
    }
    syncAllLikeButtonsForPost(postId);
    var commentInputClear = document.getElementById('forum-detail-comment-input');
    if (commentInputClear) commentInputClear.value = '';
    var emptyEl = document.getElementById('forum-detail-empty');
    if (!container) return;
    container.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('is-visible');
    if (replyCount === 0) {
      if (emptyEl) emptyEl.classList.add('is-visible');
      return;
    }
    // Build flat list of N comment indices; distribute into tree: some top-level, some nested (max depth 3).
    function buildTree(n) {
      var nodes = [];
      var idx = 0;
      function addLevel(depth, parentReplies) {
        if (depth > 3 || idx >= n) return;
        var count = depth === 0 ? Math.max(1, Math.ceil(n / 3)) : (idx < n ? Math.min(2, n - idx) : 0);
        for (var i = 0; i < count && idx < n; i++) {
          var node = { index: idx++, replies: [] };
          if (parentReplies) parentReplies.push(node); else nodes.push(node);
          addLevel(depth + 1, node.replies);
        }
      }
      addLevel(0, null);
      return nodes;
    }
    var tree = buildTree(replyCount);
    var commentSeq = 0;
    var likeIconHtml = '<span class="forum-comment-like-icon like-icon" aria-hidden="true"><img class="forum-comment-like-img forum-comment-like-img--off" src="img/icons/icon-heart-outline-sm.svg" alt="" width="20" height="20" decoding="async"><img class="forum-comment-like-img forum-comment-like-img--on" src="img/icons/icon-heart.svg" alt="" width="20" height="20" decoding="async"></span>';
    function getForumCommentPayload(forPostId, mockIndex) {
      var byPost = forumDetailCommentsByPost[forPostId];
      if (byPost && byPost[mockIndex] !== undefined) return byPost[mockIndex];
      return forumDetailCommentsFallback[mockIndex % forumDetailCommentsFallback.length];
    }
    function renderComment(node, depth) {
      var c = getForumCommentPayload(postId, node.index);
      var commentKey = postId + '_' + commentSeq++;
      var st = getForumCommentLikeState(commentKey, c.upvotes);
      var likedClass = st.liked ? ' is-liked' : '';
      var repliesHtml = node.replies.length ? '<div class="forum-comment-replies">' + node.replies.map(function(r) { return renderComment(r, depth + 1); }).join('') + '</div>' : '';
      var nodeClass = 'forum-comment-node' + (node.replies.length ? ' has-replies' : '');
      var bylineClass = 'forum-comment-byline' + (node.replies.length ? ' forum-comment-byline--thread' : '');
      var bylineAttrs = node.replies.length ? ' title="Collapse or expand replies"' : '';
      var isOwnComment = c.author === 'Rgdfriend' || c.author === 'You';
      var deleteHtml = isOwnComment ? '<button type="button" class="forum-comment-delete-btn" aria-label="Delete comment"><span class="btn__label">Delete</span></button>' : '';
      var actionsHtml = '<div class="forum-comment-actions"><button type="button" class="forum-comment-like-btn' + likedClass + '" data-comment-like-key="' + commentKey + '" aria-pressed="' + (st.liked ? 'true' : 'false') + '" aria-label="' + (st.liked ? 'Unlike' : 'Like') + '">' + likeIconHtml + '<span class="forum-comment-like-count">' + st.count + '</span></button><button type="button" class="forum-comment-reply-btn"><span class="btn__label">Reply</span></button>' + deleteHtml + '</div>';
      return '<div class="' + nodeClass + '"><div class="forum-comment-content"><div class="forum-comment-avatar"></div><div class="forum-comment-main"><div class="' + bylineClass + '"' + bylineAttrs + '><span class="username">' + c.author + '</span><span class="dot">·</span><span class="timestamp">' + c.time + '</span></div><div class="forum-comment-body">' + c.body + '</div>' + actionsHtml + '</div></div>' + repliesHtml + '</div>';
    }
    tree.forEach(function(node) { container.insertAdjacentHTML('beforeend', renderComment(node, 0)); });
    container.querySelectorAll('.forum-comment-node.has-replies').forEach(function(node) {
      var byline = node.querySelector('.forum-comment-byline--thread');
      if (byline) {
        byline.addEventListener('click', function(e) {
          e.stopPropagation();
          node.classList.toggle('collapsed');
        });
      }
    });
  }

  (function initForumPage() {
    initForumLikeStateFromDom();

    document.addEventListener('click', function forumLikeCapture(e) {
      var likeBtn = e.target.closest && e.target.closest('.bpost-like-btn');
      if (!likeBtn) return;
      var postId = likeBtn.getAttribute('data-post-id');
      if (!postId) return;
      var inForum = likeBtn.closest && (likeBtn.closest('.page-forum') || likeBtn.closest('.page-forum-detail'));
      if (!inForum) return;
      e.preventDefault();
      e.stopPropagation();
      toggleForumPostLike(postId);
      var stPost = forumPostLikeState[postId];
      if (stPost) playLikeButtonAnimation(likeBtn, stPost.liked);
    }, true);

    document.addEventListener('click', function forumCommentLikeCapture(e) {
      var btn = e.target.closest && e.target.closest('.forum-comment-like-btn');
      if (!btn) return;
      if (!btn.closest('.page-forum-detail')) return;
      var key = btn.getAttribute('data-comment-like-key');
      if (!key) return;
      e.preventDefault();
      e.stopPropagation();
      if (toggleForumCommentLike(key)) {
        playLikeButtonAnimation(btn, forumCommentLikeState[key].liked);
      }
    }, true);

    document.addEventListener('click', function forumCommentReplyClick(e) {
      var replyBtn = e.target.closest && e.target.closest('.forum-comment-reply-btn');
      if (!replyBtn || !replyBtn.closest('.page-forum-detail')) return;
      e.preventDefault();
      e.stopPropagation();
      var commentNode = replyBtn.closest('.forum-comment-node');
      if (!commentNode) return;
      anchorForumDetailComposerUnderComment(commentNode);
      var input = document.getElementById('forum-detail-comment-input');
      if (input) {
        input.focus();
        try { input.setSelectionRange(input.value.length, input.value.length); } catch (err) {}
      }
    });

    document.addEventListener('click', function forumCommentDeleteClick(e) {
      var delBtn = e.target.closest && e.target.closest('.forum-comment-delete-btn');
      if (!delBtn || !delBtn.closest('.page-forum-detail')) return;
      e.preventDefault();
      e.stopPropagation();
      var commentNode = delBtn.closest('.forum-comment-node');
      if (!commentNode) return;
      var composer = document.querySelector('.forum-detail-comment-composer');
      if (composer && commentNode.contains(composer)) restoreForumDetailComposerToDefault();
      commentNode.remove();
      var container = document.getElementById('forum-detail-comments');
      if (container) {
        container.querySelectorAll('.forum-comment-node.has-replies').forEach(function(node) {
          var rep = node.querySelector(':scope > .forum-comment-replies');
          if (!rep || !rep.querySelector('.forum-comment-node')) {
            node.classList.remove('has-replies');
            var byline = node.querySelector('.forum-comment-byline--thread');
            if (byline) {
              byline.classList.remove('forum-comment-byline--thread');
              byline.removeAttribute('title');
            }
            if (rep) rep.remove();
          }
        });
      }
      var emptyEl = document.getElementById('forum-detail-empty');
      if (container && !container.querySelector('.forum-comment-node') && emptyEl) {
        emptyEl.classList.add('is-visible');
      }
    }, true);

    const filterRow = document.getElementById('forum-filter-row');
    const forumBoard = document.getElementById('forum-board');
    const composeSubmitBtn = document.getElementById('compose-submit');
    const composeTitleInput = document.getElementById('compose-title');
    const composeBodyInput = document.getElementById('compose-body');

    function updateForumPostCount() {
      var el = document.getElementById('forum-post-count');
      if (!el || !forumBoard) return;
      var n = forumBoard.querySelectorAll('.bpost').length;
      el.textContent = n === 1 ? '1 post this month' : n + ' posts this month';
    }
    updateForumPostCount();

    if (filterRow && forumBoard) {
      filterRow.querySelectorAll('.forum-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterRow.querySelectorAll('.forum-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.cat;
          forumBoard.querySelectorAll('.bpost').forEach(post => {
            post.style.display = (cat === 'all' || post.dataset.cat === cat) ? '' : 'none';
          });
        });
      });
    }

    if (forumBoard) {
      forumBoard.addEventListener('click', function(e) {
        var replyHint = e.target.closest('.bpost-reply-hint');
        if (replyHint) {
          e.stopPropagation();
          var post = replyHint.closest('.bpost');
          var replyArea = post && post.querySelector('.bpost-reply-area');
          if (replyArea) {
            var isOpen = replyArea.classList.contains('open');
            replyArea.classList.toggle('open', !isOpen);
            if (!isOpen) {
              setTimeout(function() {
                var input = replyArea.querySelector('input');
                if (input) input.focus();
              }, 200);
            }
          }
          return;
        }
      });
    }

    if (forumBoard) {
      forumBoard.addEventListener('click', function(e) {
        var bpost = e.target && e.target.closest && e.target.closest('.bpost');
        if (!bpost) return;
        if (e.target.closest('.bpost-like-btn')) return;
        if (e.target.closest('.bpost-reply-hint') || e.target.closest('.bpost-reply-area')) return;
        e.preventDefault();
        e.stopPropagation();
        var postId = bpost.getAttribute('data-post-id');
        var replyCount = parseInt(bpost.getAttribute('data-reply-count') || '0', 10);
        showPage('forum-detail');
        openForumPostDetail(postId, replyCount);
      });
    }

    var forumDetailDelete = document.getElementById('forum-detail-delete');
    if (forumDetailDelete) {
      forumDetailDelete.addEventListener('click', function() {
        var postId = forumDetailDelete.dataset.postId;
        if (!postId) return;
        if (typeof forumPostDetails !== 'undefined') delete forumPostDetails[postId];
        delete forumPostLikeState[postId];
        var card = forumBoard && forumBoard.querySelector('.bpost[data-post-id="' + postId + '"]');
        if (card) card.remove();
        updateForumPostCount();
        showPage('forums');
      });
    }

    const forumNewPostBtn = document.getElementById('forum-new-post-btn');
    if (forumNewPostBtn) {
      forumNewPostBtn.addEventListener('click', () => {
        if (composeTitleInput) composeTitleInput.value = '';
        if (composeBodyInput) composeBodyInput.value = '';
        if (composeSubmitBtn) composeSubmitBtn.disabled = true;
        showPage('compose');
        setTimeout(function() {
          var titleEl = document.getElementById('compose-title');
          if (titleEl) titleEl.focus();
        }, 100);
      });
    }

    function updateComposeSubmitState() {
      if (!composeSubmitBtn) return;
      var hasTitle = composeTitleInput && composeTitleInput.value.trim().length > 0;
      var hasBody = composeBodyInput && composeBodyInput.value.trim().length > 0;
      composeSubmitBtn.disabled = !hasTitle || !hasBody;
    }

    if (composeTitleInput) composeTitleInput.addEventListener('input', updateComposeSubmitState);
    if (composeBodyInput) composeBodyInput.addEventListener('input', updateComposeSubmitState);

    if (composeSubmitBtn) {
      composeSubmitBtn.addEventListener('click', function() {
        if (this.disabled) return;
        var title = (composeTitleInput && composeTitleInput.value.trim()) || '';
        var body = (composeBodyInput && composeBodyInput.value.trim()) || '';
        var catBtn = composeCats && composeCats.querySelector('.compose-cat-btn.active');
        var cat = (catBtn && catBtn.dataset.cat) || 'general';
        var catLabel = cat === 'questions' ? 'Question' : 'General';
        if (!forumBoard || !title) return;
        function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
        var postEl = document.createElement('div');
        postEl.className = 'bpost bpost-own';
        postEl.setAttribute('data-post-id', 'post-new');
        postEl.setAttribute('data-reply-count', '0');
        postEl.setAttribute('data-cat', cat);
        postEl.setAttribute('style', 'transform:rotate(-0.2deg);');
        postEl.innerHTML = '<div class="bpost-tack"></div><div class="bpost-byline"><span class="bpost-author bpost-author-own">Rgdfriend</span><div class="bpost-sep"></div><span class="bpost-time">Just now</span></div><div class="bpost-title">' + esc(title) + '</div><div class="bpost-body">' + esc(body) + '</div><div class="bpost-rule"></div><div class="bpost-actions"><button type="button" class="bpost-like-btn" data-post-id="post-new" aria-pressed="false" aria-label="Like"><span class="bpost-like-icon like-icon" aria-hidden="true"><img class="bpost-like-img bpost-like-img--off" src="img/icons/icon-heart-outline-sm.svg" alt="" width="22" height="22" decoding="async"><img class="bpost-like-img bpost-like-img--on" src="img/icons/icon-heart.svg" alt="" width="22" height="22" decoding="async"></span><span class="bpost-like-count">0</span></button><div class="bpost-reply-stat"><span class="bpost-reply-num">0</span> replies</div><span class="bpost-reply-hint">Reply</span></div><div class="bpost-reply-area"><div class="bpost-reply-inner"><input class="bpost-reply-input" type="text" placeholder="Write a reply..."><button type="button" class="bpost-reply-send" aria-label="Send reply"><span class="bpost-reply-send-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="12 5 19 12 12 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button></div></div>';
        forumBoard.insertBefore(postEl, forumBoard.firstChild);
        forumPostLikeState['post-new'] = { count: 0, liked: false };
        if (typeof forumPostDetails !== 'undefined') forumPostDetails['post-new'] = { title: title, body: body, author: 'Rgdfriend', time: 'Just now', category: catLabel };
        updateForumPostCount();
        if (composeTitleInput) composeTitleInput.value = '';
        if (composeBodyInput) composeBodyInput.value = '';
        composeSubmitBtn.disabled = true;
        showPage('forums');
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            postEl.classList.add('bpost-slide-in');
            postEl.addEventListener('animationend', function onEnd() {
              postEl.classList.remove('bpost-slide-in');
              postEl.removeEventListener('animationend', onEnd);
            });
          });
        });
      });
    }

    if (composeSubmitBtn) composeSubmitBtn.disabled = true;

    const composeCats = document.getElementById('compose-cats');
    if (composeCats) {
      composeCats.querySelectorAll('.compose-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          composeCats.querySelectorAll('.compose-cat-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    var forumDetailCommentPost = document.getElementById('forum-detail-comment-post');
    var forumDetailCommentInput = document.getElementById('forum-detail-comment-input');
    if (forumDetailCommentPost && forumDetailCommentInput) {
      function submitForumDetailComment() {
        var text = forumDetailCommentInput.value.trim();
        if (!text) return;
        var container = document.getElementById('forum-detail-comments');
        var emptyEl = document.getElementById('forum-detail-empty');
        if (!container) return;
        var composer = document.querySelector('.forum-detail-comment-composer');
        var nestedParent = composer && composer.parentElement && composer.parentElement.classList.contains('forum-comment-replies') ? composer.parentElement : null;
        var detailLike = document.getElementById('forum-detail-like-btn');
        var activePostId = detailLike && detailLike.getAttribute('data-post-id');
        var localKey = (activePostId || 'post') + '_local_' + Date.now();
        getForumCommentLikeState(localKey, 0);
        var likeIconHtml = '<span class="forum-comment-like-icon like-icon" aria-hidden="true"><img class="forum-comment-like-img forum-comment-like-img--off" src="img/icons/icon-heart-outline-sm.svg" alt="" width="20" height="20" decoding="async"><img class="forum-comment-like-img forum-comment-like-img--on" src="img/icons/icon-heart.svg" alt="" width="20" height="20" decoding="async"></span>';
        var deleteHtml = '<button type="button" class="forum-comment-delete-btn" aria-label="Delete comment"><span class="btn__label">Delete</span></button>';
        var actionsHtml = '<div class="forum-comment-actions"><button type="button" class="forum-comment-like-btn" data-comment-like-key="' + localKey + '" aria-pressed="false" aria-label="Like">' + likeIconHtml + '<span class="forum-comment-like-count">0</span></button><button type="button" class="forum-comment-reply-btn"><span class="btn__label">Reply</span></button>' + deleteHtml + '</div>';
        var wrap = document.createElement('div');
        wrap.className = 'forum-comment-node forum-comment-node--local';
        wrap.innerHTML = '<div class="forum-comment-content"><div class="forum-comment-avatar"></div><div class="forum-comment-main"><div class="forum-comment-byline"><span class="username">You</span><span class="dot">·</span><span class="timestamp">Just now</span></div><div class="forum-comment-body"></div>' + actionsHtml + '</div></div>';
        wrap.querySelector('.forum-comment-body').textContent = text;
        if (nestedParent) {
          nestedParent.insertBefore(wrap, composer.nextSibling);
        } else {
          container.insertBefore(wrap, container.firstChild);
        }
        if (emptyEl) emptyEl.classList.remove('is-visible');
        forumDetailCommentInput.value = '';
        restoreForumDetailComposerToDefault();
      }
      forumDetailCommentPost.addEventListener('click', submitForumDetailComment);
      forumDetailCommentInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitForumDetailComment();
      });
    }
  })();

  // ── Volunteer Page ──
  (function initVolunteerPage() {
    // Role card toggle (one active at a time, accordion)
    let volSelectedRole = 'vol-card-1'; // card 1 pre-selected
    document.querySelectorAll('.page-volunteer .vol-role-card:not(.disabled)').forEach(card => {
      card.querySelector('.vol-role-card-header').addEventListener('click', function() {
        const isActive = card.classList.contains('active');
        document.querySelectorAll('.page-volunteer .vol-role-card:not(.disabled)').forEach(c => c.classList.remove('active'));
        if (!isActive) {
          card.classList.add('active');
          volSelectedRole = card.id;
        } else {
          volSelectedRole = null;
        }
        updateVolCTA();
      });
    });

    // Commitment toggle (one-time / repeating)
    document.querySelectorAll('.page-volunteer .vol-commit-toggle').forEach(wrap => {
      wrap.querySelectorAll('.vol-toggle-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          wrap.querySelectorAll('.vol-toggle-opt').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const opts = Array.from(wrap.querySelectorAll('.vol-toggle-opt'));
          wrap.classList.toggle('right', opts.indexOf(btn) === 1);
        });
      });
    });

    // Preferred contact method
    function showVolContactInput(key) {
      ['phone', 'email', 'push'].forEach(k => {
        const el = document.getElementById('vol-input-' + k);
        if (el) el.classList.toggle('visible', key !== 'push' && k === key);
      });
    }

    document.querySelectorAll('#vol-contact-row .vol-contact-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('#vol-contact-row .vol-contact-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        showVolContactInput(opt.dataset.volContact);
      });
    });
    document.querySelectorAll('.page-volunteer .vol-contact-input[data-mock-prefill="true"]').forEach(function(input) {
      function resetMockValueOnTap() {
        if (input.dataset.mockPrefill !== 'true') return;
        input.value = '';
        input.dataset.mockPrefill = 'false';
      }
      input.addEventListener('focus', resetMockValueOnTap);
      input.addEventListener('pointerdown', resetMockValueOnTap);
    });

    // Consent + CTA
    const volConsentCheck = document.getElementById('vol-consent-check');
    const volConsentText = document.querySelector('.page-volunteer .vol-consent-text');
    const volCtaBtn = document.getElementById('vol-cta-btn');
    let volConsented = false;

    volConsentCheck.addEventListener('click', () => {
      volConsented = !volConsented;
      volConsentCheck.classList.toggle('checked', volConsented);
      if (volConsented) {
        volConsentCheck.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        volConsentCheck.innerHTML = '';
      }
      updateVolCTA();
    });
    if (volConsentText) {
      volConsentText.addEventListener('click', () => {
        volConsentCheck.click();
      });
    }

    function updateVolCTA() {
      const anyActive = document.querySelector('.page-volunteer .vol-role-card.active');
      volCtaBtn.classList.toggle('enabled', !!anyActive && volConsented);
    }

    volCtaBtn.addEventListener('click', function() {
      if (!volCtaBtn.classList.contains('enabled')) return;
      var activeCard = document.querySelector('.page-volunteer .vol-role-card.active');
      var roleTitle = activeCard && activeCard.querySelector('.vol-role-card-title');
      var role = roleTitle ? roleTitle.textContent.trim() : '';
      var payload = Object.assign({}, VOLUNTEER_CONFIRM_DEFAULTS, { role: role || VOLUNTEER_CONFIRM_DEFAULTS.role });
      if (window.__openVolunteerConfirm) window.__openVolunteerConfirm(payload, 'volunteer');
    });

    updateVolCTA();
  })();

  // ── Inline navigation links (home + volunteer) ──
  (function initInlineLinks() {
    const viewCalendarLink = document.querySelector('.link-view-calendar');
    if (viewCalendarLink) {
      viewCalendarLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('events');
      });
    }

    const hotItemsLink = document.querySelector('.link-hot-items');
    if (hotItemsLink) {
      hotItemsLink.addEventListener('click', (e) => {
        e.preventDefault();
        donateReturnPage = activePageName || 'home';
        showPage('donate-items');
      });
    }

    const seeForumLink = document.querySelector('.link-see-forum');
    if (seeForumLink) {
      seeForumLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('forums');
      });
    }

    document.querySelectorAll('.vol-timeline-view-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('events');
      });
    });
  })();

  function initSlideConfirmCTA(config) {
    const root = document.getElementById(config.rootId);
    if (!root) return null;
    const track = root.querySelector('.di-bs-slide-track');
    const thumb = root.querySelector('.di-bs-slide-thumb');
    const fill = root.querySelector('.di-bs-slide-fill');
    if (!track || !thumb || !fill) return null;

    const TRACK_PAD = 5;
    const SNAP_AT = 0.98;

    let enabled = false;
    let confirmed = false;
    let dragging = false;
    let pos = 0;
    let rafId = null;
    let dragStartPageX = 0;
    let dragStartPos = 0;

    function thumbW() { return thumb.offsetWidth; }
    function trackW() { return track.offsetWidth; }
    function maxPos() { return Math.max(0, trackW() - thumbW() - TRACK_PAD * 2); }

    function clamp(value) {
      return Math.max(0, Math.min(value, maxPos()));
    }

    function render(rawPos) {
      const cPos = clamp(rawPos);
      pos = cPos;
      const knobLeft = TRACK_PAD + cPos;
      const revealed = cPos <= 0 ? 0 : (TRACK_PAD + cPos + thumbW() / 2);
      thumb.style.left = knobLeft + 'px';
      fill.style.width = Math.max(0, Math.min(trackW() - TRACK_PAD, revealed)) + 'px';
    }

    function animateTo(target, onDone) {
      const start = pos;
      const end = clamp(target);
      const delta = end - start;
      if (Math.abs(delta) < 0.5) {
        render(end);
        if (onDone) onDone();
        return;
      }
      if (rafId) cancelAnimationFrame(rafId);
      const duration = 220;
      let t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        const t = Math.min(1, (ts - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        render(start + delta * eased);
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = null;
          if (onDone) onDone();
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function confirm() {
      if (confirmed) return;
      confirmed = true;
      dragging = false;
      animateTo(maxPos(), function() {
        if (typeof config.onConfirm === 'function') config.onConfirm();
      });
    }

    function snapBack() {
      animateTo(0, null);
    }

    function onDown(pageX) {
      if (!enabled || confirmed) return;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      dragging = true;
      dragStartPageX = pageX;
      dragStartPos = pos;
    }

    function onMove(pageX) {
      if (!enabled || !dragging || confirmed) return;
      render(dragStartPos + (pageX - dragStartPageX));
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      if (confirmed || !enabled) return;
      const m = maxPos();
      const p = m > 0 ? Math.max(0, Math.min(pos, m)) / m : 0;
      if (p >= SNAP_AT) confirm();
      else snapBack();
    }

    track.addEventListener('touchstart', function(e) {
      if (!e.touches || !e.touches[0]) return;
      onDown(e.touches[0].pageX);
    }, { passive: true });
    track.addEventListener('touchmove', function(e) {
      if (!e.touches || !e.touches[0]) return;
      onMove(e.touches[0].pageX);
    }, { passive: true });
    track.addEventListener('touchend', onUp, { passive: true });
    track.addEventListener('touchcancel', onUp, { passive: true });
    track.addEventListener('mousedown', function(e) {
      onDown(e.pageX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', function(e) {
      if (dragging) onMove(e.pageX);
    });
    window.addEventListener('mouseup', onUp);

    render(0);

    return {
      setEnabled: function(nextEnabled) {
        enabled = !!nextEnabled;
        root.classList.toggle('is-disabled', !enabled);
        if (!enabled && !confirmed && !dragging) {
          pos = 0;
          render(0);
        }
      },
      setLabel: function(text) {
        return text;
      },
      reset: function() {
        confirmed = false;
        dragging = false;
        pos = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        render(0);
      },
      isConfirmed: function() {
        return confirmed;
      }
    };
  }

  function startIconRain(items, getItemIconSrc, pageEl) {
    if (!pageEl || !items || !items.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.dataset.allowRain) return;
    var flat = [];
    items.forEach(function(entry) {
      var n = (entry.qty || 0);
      var name = entry.itemName;
      for (var i = 0; i < n; i++) flat.push(name);
    });
    if (flat.length > 24) {
      var step = flat.length / 24;
      var sampled = [];
      for (var i = 0; i < 24; i++) sampled.push(flat[Math.min(Math.floor(i * step), flat.length - 1)]);
      flat = sampled;
    }
    if (flat.length === 0) return;
    var count = flat.length;
    // Rain particle sizing (edit these only)
    var CIRCLE_MAX = 128;
    var CIRCLE_MIN = 44;
    var COUNT_AT_MIN = 5;
    var ICON_TO_CIRCLE_RATIO = 0.74;
    var circleSize = Math.round(CIRCLE_MAX - ((count - 1) / (COUNT_AT_MIN - 1)) * (CIRCLE_MAX - CIRCLE_MIN));
    if (circleSize < CIRCLE_MIN) circleSize = CIRCLE_MIN;
    if (circleSize > CIRCLE_MAX) circleSize = CIRCLE_MAX;
    var iconSize = Math.round(circleSize * ICON_TO_CIRCLE_RATIO);

    // Home page: crank particle size up aggressively (confirmation page stays unchanged)
    if (pageEl && pageEl.classList && pageEl.classList.contains('page-home')) {
      circleSize = 150;
      iconSize = Math.round(circleSize * ICON_TO_CIRCLE_RATIO);
    }
    var rect = pageEl.getBoundingClientRect();
    var vw = rect.width;
    var vh = rect.height;
    var exitY = vh + 60 + circleSize;
    var fadeOutStartY = vh - 80;
    var layer = document.createElement('div');
    layer.id = 'dc-rain-layer';
    var particles = [];
    var startTime = performance.now();
    for (var i = 0; i < flat.length; i++) {
      var itemName = flat[i];
      var src = getItemIconSrc(itemName);
      var el = document.createElement('div');
      el.className = 'dc-rain-particle';
      el.style.width = circleSize + 'px';
      el.style.height = circleSize + 'px';
      var img = document.createElement('img');
      img.src = src || '';
      img.alt = '';
      img.style.width = iconSize + 'px';
      img.style.height = iconSize + 'px';
      el.appendChild(img);
      var startX = Math.random() * Math.max(0, vw - circleSize) + (Math.random() * 16 - 8);
      el.style.left = startX + 'px';
      el.style.top = '-60px';
      el.style.opacity = '0';
      layer.appendChild(el);
      var delay = flat.length === 1 ? 0 : (i / (flat.length - 1)) * 600;
      particles.push({
        el: el,
        startX: startX,
        y: 0,
        vy: 0.4 + Math.random() * 0.8,
        gravity: 0.18 + Math.random() * 0.14,
        delay: delay,
        startTime: startTime,
        driftPhase: Math.random() * Math.PI * 2,
        driftAmp: 18,
        driftSpeed: 0.02 + Math.random() * 0.02,
        drift: 0,
        angle: 0,
        rotationRate: (0.08 + Math.random() * 0.14) * (Math.random() < 0.5 ? -1 : 1),
        done: false
      });
    }
    pageEl.appendChild(layer);
    var rafId = null;
    function tick() {
      var now = performance.now();
      var allDone = true;
      particles.forEach(function(p) {
        if (p.done) return;
        allDone = false;
        var elapsed = now - p.startTime - p.delay;
        if (elapsed < 0) return;
        p.vy += p.gravity;
        p.vy *= 0.995;
        p.y += p.vy;
        var driftX = Math.sin(p.driftPhase + now * p.driftSpeed * 0.06) * p.driftAmp;
        p.driftPhase += 0.002;
        p.driftAmp *= 0.998;
        if (p.driftAmp < 0.5) p.driftAmp = 0.5;
        p.angle += p.rotationRate;
        p.el.style.transform = 'translate(' + (driftX) + 'px, ' + p.y + 'px) rotate(' + p.angle + 'deg)';
        var opacity = 1;
        if (elapsed < 200) opacity = elapsed / 200;
        else if (p.y > fadeOutStartY) {
          var fadeSpan = exitY - fadeOutStartY;
          opacity = Math.max(0, 1 - (p.y - fadeOutStartY) / fadeSpan);
        }
        p.el.style.opacity = String(opacity);
        if (p.y >= exitY) p.done = true;
      });
      if (!allDone) rafId = requestAnimationFrame(tick);
      else {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function startHomeIconRainHeavy(names, getItemIconSrc, pageEl) {
    if (!pageEl || !Array.isArray(names) || !names.length || typeof getItemIconSrc !== 'function') return;
    var items = [];
    var target = 7;
    for (var i = 0; i < target; i++) {
      items.push({ itemName: names[i % names.length], qty: 1 });
    }
    startIconRain(items, getItemIconSrc, pageEl);
  }

  // ── Single icon raindrop (hero card tap) ──
  function dropOneIcon(src, container) {
    if (!src || !container) return;
    var iconSize = 92;
    var rect = container.getBoundingClientRect();
    var vw = rect.width;
    var vh = rect.height;
    var exitY = vh + 60 + iconSize;
    var fadeOutStartY = vh - 80;
    var layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:999;';
    var el = document.createElement('div');
    // Icon-only particle (no background fill)
    el.style.position = 'absolute';
    el.style.width = iconSize + 'px';
    el.style.height = iconSize + 'px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    el.appendChild(img);
    var startX = Math.random() * Math.max(0, vw - iconSize);
    el.style.left = startX + 'px';
    el.style.top = (-iconSize) + 'px';
    el.style.opacity = '0';
    layer.appendChild(el);
    container.appendChild(layer);
    var p = {
      y: 0,
      vy: 0.5 + Math.random() * 0.7,
      gravity: 0.18 + Math.random() * 0.14,
      driftPhase: Math.random() * Math.PI * 2,
      driftAmp: 18,
      driftSpeed: 0.02 + Math.random() * 0.02,
      angle: 0,
      rotationRate: (0.08 + Math.random() * 0.14) * (Math.random() < 0.5 ? -1 : 1),
      done: false,
      startTime: performance.now()
    };
    function tick() {
      if (p.done) {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        return;
      }
      var now = performance.now();
      var elapsed = now - p.startTime;
      p.vy += p.gravity;
      p.vy *= 0.995;
      p.y += p.vy;
      var driftX = Math.sin(p.driftPhase + now * p.driftSpeed * 0.06) * p.driftAmp;
      p.driftPhase += 0.002;
      p.driftAmp *= 0.998;
      if (p.driftAmp < 0.5) p.driftAmp = 0.5;
      p.angle += p.rotationRate;
      el.style.transform = 'translate(' + driftX + 'px, ' + p.y + 'px) rotate(' + p.angle + 'deg)';
      var opacity = 1;
      if (elapsed < 200) opacity = elapsed / 200;
      else if (p.y > fadeOutStartY) opacity = Math.max(0, 1 - (p.y - fadeOutStartY) / (exitY - fadeOutStartY));
      el.style.opacity = String(opacity);
      if (p.y >= exitY) p.done = true;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  (function initHomePostDonationCelebration() {
    var homePage = document.querySelector('.page-home');
    var appContainer = document.querySelector('.app-container');
    var heroSection = homePage ? homePage.querySelector('.hero') : null;
    if (!homePage || !appContainer || !heroSection) return;

    var modalBackdropEl = null;
    var modalEl = null;
    var cardEl = null;
    var groupSliderControllers = new Map();
    var pendingTimeoutIds = [];
    var modalDelayTimer = null;
    var groupsCompleting = new Set();
    var cardGroupsEl = null;

    function prefersReducedMotion() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function trackTimeout(fn, ms) {
      var id = setTimeout(function() {
        pendingTimeoutIds = pendingTimeoutIds.filter(function(entry) { return entry !== id; });
        fn();
      }, ms);
      pendingTimeoutIds.push(id);
      return id;
    }

    function clearPendingTimeouts() {
      pendingTimeoutIds.forEach(function(id) { clearTimeout(id); });
      pendingTimeoutIds = [];
      if (modalDelayTimer) {
        clearTimeout(modalDelayTimer);
        modalDelayTimer = null;
      }
    }

    function normalizeDonationGroups() {
      donationGroups = (donationGroups || [])
        .map(function(group) {
          return {
            id: group.id,
            dropoff: group.dropoff,
            confirmedAt: group.confirmedAt || Date.now(),
            items: (group.items || []).filter(function(item) {
              return item && item.itemName && (item.qty || 0) > 0;
            })
          };
        })
        .filter(function(group) { return group.items.length > 0; })
        .sort(function(a, b) { return (a.confirmedAt || 0) - (b.confirmedAt || 0); });
    }

    function hasActiveDonation() {
      normalizeDonationGroups();
      return donationGroups.length > 0;
    }

    function getDisplayUsername() {
      var profileName = document.querySelector('.page-profile .prof-name');
      if (profileName && profileName.textContent.trim()) return profileName.textContent.trim();
      var homeTitle = document.querySelector('.page-home .hero-card h1');
      if (homeTitle && homeTitle.textContent.indexOf(',') !== -1) {
        return homeTitle.textContent.split(',').slice(1).join(',').trim() || 'friend';
      }
      return 'friend';
    }

    function getDropoffPresentation(dropoffObj) {
      if (!dropoffObj) return { name: 'Drop-off location', meta: 'Next: Monthly drive' };
      var raw = dropoffObj.mapQuery || '';
      var baseName = raw.split(',')[0] || 'Drop-off location';
      var id = dropoffObj.id || '';
      var meta = 'Next: Monthly drive';
      if (id === 'cross') meta = 'Wed-Sun · 11am-6pm';
      else if (id === 'wildfires') meta = 'Daily · 12pm-7pm';
      return { name: baseName, meta: meta };
    }

    function getDropoffMapUrl(dropoffObj) {
      if (!dropoffObj || !dropoffObj.mapQuery) return '';
      return 'https://www.google.com/maps?q=' + encodeURIComponent(dropoffObj.mapQuery) + '&output=embed';
    }

    function getTotalPendingItems() {
      normalizeDonationGroups();
      var total = 0;
      donationGroups.forEach(function(group) {
        group.items.forEach(function(entry) {
          total += (entry.qty || 0);
        });
      });
      return total;
    }

    function collectRainNames() {
      var names = (donationLastConfirmedItems || []).map(function(entry) { return entry.itemName; });
      if (names.length) return names;
      normalizeDonationGroups();
      donationGroups.forEach(function(group) {
        group.items.forEach(function(entry) { names.push(entry.itemName); });
      });
      return names;
    }

    function removeModalImmediately() {
      if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
      if (modalBackdropEl && modalBackdropEl.parentNode) modalBackdropEl.parentNode.removeChild(modalBackdropEl);
      modalEl = null;
      modalBackdropEl = null;
      document.body.classList.remove('home-thankyou-modal-open');
    }

    function triggerHeaderCountPop() {
      if (!cardEl || !donationCardCollapsed) return;
      var headerText = cardEl.querySelector('.donation-card-header-text');
      if (!headerText) return;
      headerText.classList.remove('di-badge-jump');
      void headerText.offsetWidth;
      headerText.classList.add('di-badge-jump');
      headerText.addEventListener('animationend', function done() {
        headerText.classList.remove('di-badge-jump');
        headerText.removeEventListener('animationend', done);
      });
    }

    function setCardCollapsed(nextCollapsed) {
      donationCardCollapsed = !!nextCollapsed;
      if (!cardEl) return;
      cardEl.classList.toggle('is-collapsed', donationCardCollapsed);
      var headerText = cardEl.querySelector('.donation-card-header-text');
      if (!headerText) return;
      if (donationCardCollapsed) {
        headerText.textContent = getTotalPendingItems() + ' items pending drop-off';
      } else {
        headerText.textContent = 'Currently contributing';
      }
    }

    function createGroupRow(itemName, qty, iconResolver, animateEnter) {
      var row = document.createElement('div');
      row.className = 'donation-card-item-row';
      row.dataset.itemName = itemName;
      if (animateEnter && !prefersReducedMotion()) row.classList.add('is-row-entering');
      row.innerHTML = '' +
        '<img src="' + iconResolver(itemName) + '" alt="">' +
        '<div class="donation-card-item-name">' + itemName + '</div>' +
        '<span class="donation-card-qty">×' + (qty || 0) + '</span>';
      return row;
    }

    function getGroupSliderRootId(groupId) {
      return 'home-group-slide-cta-' + groupId;
    }

    function escapeForSelector(value) {
      if (window.CSS && CSS.escape) return CSS.escape(value);
      return String(value).replace(/"/g, '\\"');
    }

    function initGroupSlider(groupId) {
      if (!groupId || groupSliderControllers.has(groupId)) return;
      var rootId = getGroupSliderRootId(groupId);
      var controller = initSlideConfirmCTA({
        rootId: rootId,
        onConfirm: function() {
          startGroupCompletionSequence(groupId);
        }
      });
      if (!controller) return;
      controller.setEnabled(true);
      groupSliderControllers.set(groupId, controller);
    }

    function applyQtyBadgePop(badge) {
      if (!badge) return;
      badge.classList.remove('di-badge-jump');
      void badge.offsetWidth;
      badge.classList.add('di-badge-jump');
      badge.addEventListener('animationend', function handle() {
        badge.classList.remove('di-badge-jump');
        badge.removeEventListener('animationend', handle);
      });
    }

    function renderGroupSection(group, iconResolver, animateEnter) {
      var wrap = document.createElement('section');
      wrap.className = 'donation-card-group';
      wrap.dataset.groupId = group.id;
      if (animateEnter && !prefersReducedMotion()) wrap.classList.add('is-group-entering');

      var dropoff = getDropoffPresentation(group.dropoff);
      var mapUrl = getDropoffMapUrl(group.dropoff);
      var sliderRootId = getGroupSliderRootId(group.id);
      wrap.innerHTML = '' +
        '<div class="donation-card-items"></div>' +
        '<div class="donation-card-dropoff">' +
          '<div class="donation-card-dropoff-main">' +
            '<img src="img/icons/icon-location.svg" alt="" aria-hidden="true">' +
            '<div>' +
              '<div class="donation-card-dropoff-name">' + dropoff.name + '</div>' +
              '<div class="donation-card-dropoff-meta">' + dropoff.meta + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="donation-card-dropoff-map">' +
            '<iframe class="donation-card-dropoff-frame" title="Drop-off location map" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>' +
          '</div>' +
        '</div>' +
        '<div class="donation-card-group-slider">' +
          '<div class="di-bs-slide-cta" id="' + sliderRootId + '" aria-label="Slide to confirm drop-off">' +
            '<div class="di-bs-slide-track">' +
              '<div class="di-bs-slide-fill"></div>' +
              '<div class="di-bs-slide-thumb" aria-hidden="true">' +
                '<img class="di-bs-slide-icon" src="img/icons/double-chevron.svg" alt="">' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      var mapFrameEl = wrap.querySelector('.donation-card-dropoff-frame');
      if (mapFrameEl && mapUrl) mapFrameEl.src = mapUrl;

      var itemsWrap = wrap.querySelector('.donation-card-items');
      var visibleItems = group.items.slice(0, 4);
      visibleItems.forEach(function(entry) {
        itemsWrap.appendChild(createGroupRow(entry.itemName, entry.qty, iconResolver, false));
      });
      if (group.items.length > 4) {
        var moreRow = document.createElement('div');
        moreRow.className = 'donation-card-item-row donation-card-item-row-more';
        moreRow.innerHTML = '<div class="donation-card-more">+' + (group.items.length - 4) + ' more items</div>';
        itemsWrap.appendChild(moreRow);
      }

      return wrap;
    }

    function syncMergedGroupInPlace(section, group, iconResolver) {
      if (!section || !group) return;
      var itemsWrap = section.querySelector('.donation-card-items');
      if (!itemsWrap) return;

      var nextVisible = group.items.slice(0, 4);
      var desiredNames = nextVisible.map(function(entry) { return entry.itemName; });
      var existingRows = Array.from(itemsWrap.querySelectorAll('.donation-card-item-row[data-item-name]'));
      existingRows.forEach(function(row) {
        if (desiredNames.indexOf(row.dataset.itemName) === -1 && row.parentNode) {
          row.parentNode.removeChild(row);
        }
      });

      nextVisible.forEach(function(entry, idx) {
        var selectorName = entry.itemName.replace(/"/g, '\\"');
        var row = itemsWrap.querySelector('.donation-card-item-row[data-item-name="' + selectorName + '"]');
        if (!row) {
          row = createGroupRow(entry.itemName, entry.qty, iconResolver, true);
          var refRow = itemsWrap.querySelector('.donation-card-item-row:nth-child(' + (idx + 1) + ')');
          if (refRow) itemsWrap.insertBefore(row, refRow);
          else itemsWrap.appendChild(row);
        } else {
          var qtyBadge = row.querySelector('.donation-card-qty');
          var nextText = '×' + entry.qty;
          if (qtyBadge && qtyBadge.textContent !== nextText) {
            qtyBadge.textContent = nextText;
            applyQtyBadgePop(qtyBadge);
          }
        }
      });

      var moreRow = itemsWrap.querySelector('.donation-card-item-row-more');
      var overflow = group.items.length - 4;
      if (overflow > 0) {
        if (!moreRow) {
          moreRow = document.createElement('div');
          moreRow.className = 'donation-card-item-row donation-card-item-row-more';
          moreRow.innerHTML = '<div class="donation-card-more"></div>';
          itemsWrap.appendChild(moreRow);
        }
        var moreLabel = moreRow.querySelector('.donation-card-more');
        if (moreLabel) moreLabel.textContent = '+' + overflow + ' more items';
      } else if (moreRow && moreRow.parentNode) {
        moreRow.parentNode.removeChild(moreRow);
      }
    }

    function syncCardGroups(animateDelta) {
      if (!cardGroupsEl) return;
      normalizeDonationGroups();
      var iconResolver = donationGetItemIconSrc || function() { return 'img/icons/icon-stars.svg'; };

      if (!animateDelta || !donationCardShownOnce) {
        cardGroupsEl.innerHTML = '';
        groupSliderControllers.clear();
        groupsCompleting.clear();
        donationGroups.forEach(function(group) {
          cardGroupsEl.appendChild(renderGroupSection(group, iconResolver, false));
          initGroupSlider(group.id);
        });
        return;
      }

      var existingSections = Array.from(cardGroupsEl.querySelectorAll('.donation-card-group'));
      var sectionById = new Map();
      existingSections.forEach(function(section) { sectionById.set(section.dataset.groupId, section); });

      donationGroups.forEach(function(group) {
        var existing = sectionById.get(group.id);
        if (!existing) {
          cardGroupsEl.appendChild(renderGroupSection(group, iconResolver, true));
          initGroupSlider(group.id);
        } else {
          syncMergedGroupInPlace(existing, group, iconResolver);
        }
      });

      existingSections.forEach(function(section) {
        var keep = donationGroups.some(function(group) { return group.id === section.dataset.groupId; });
        if (!keep) {
          groupSliderControllers.delete(section.dataset.groupId);
          if (section.parentNode) section.parentNode.removeChild(section);
        }
      });
    }

    function finalizeDonationCard() {
      if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
      cardEl = null;
      cardGroupsEl = null;
      groupSliderControllers.clear();
      groupsCompleting.clear();
      donationGroups = [];
      donationLastConfirmedItems = [];
      pendingHomeCelebrations = 0;
      donationCardShownOnce = false;
      donationCardCollapsed = false;
    }

    function startGroupCompletionSequence(groupId) {
      if (!cardEl || !groupId || groupsCompleting.has(groupId)) return;
      var safeGroupId = escapeForSelector(groupId);
      var section = cardEl.querySelector('.donation-card-group[data-group-id="' + safeGroupId + '"]');
      if (!section) return;
      groupsCompleting.add(groupId);

      var rows = Array.from(section.querySelectorAll('.donation-card-item-row[data-item-name]'));
      var reduced = prefersReducedMotion();
      var stagger = reduced ? 0 : 60;
      var revealDuration = reduced ? 0 : 200;

      function revealCheck(row) {
        if (!row || !row.isConnected) return;
        var qtyBadge = row.querySelector('.donation-card-qty');
        if (!qtyBadge) return;
        var check = document.createElement('span');
        check.className = 'donation-card-check';
        check.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8.4l3.1 3.1 6.5-6.7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        qtyBadge.replaceWith(check);
        if (reduced) check.classList.add('is-visible');
        else requestAnimationFrame(function() { check.classList.add('is-visible'); });
      }

      if (reduced) {
        rows.forEach(revealCheck);
      } else {
        rows.forEach(function(row, idx) {
          trackTimeout(function() { revealCheck(row); }, idx * stagger);
        });
      }

      var settle = (rows.length ? ((rows.length - 1) * stagger + revealDuration) : 0) + 400;
      trackTimeout(function() {
        if (!section || !section.isConnected) {
          groupsCompleting.delete(groupId);
          return;
        }
        if (!reduced) section.classList.add('is-group-leaving');

        trackTimeout(function() {
          if (section && section.parentNode) section.parentNode.removeChild(section);
          groupSliderControllers.delete(groupId);
          groupsCompleting.delete(groupId);
          donationGroups = donationGroups.filter(function(group) { return group.id !== groupId; });
          normalizeDonationGroups();

          if (donationGroups.length === 0) {
            if (!cardEl || !cardEl.isConnected) return finalizeDonationCard();
            if (!reduced) cardEl.classList.add('is-pulsing');
            trackTimeout(function() {
              if (!cardEl || !cardEl.isConnected) return finalizeDonationCard();
              if (reduced) return finalizeDonationCard();
              cardEl.classList.add('is-leaving');
              trackTimeout(finalizeDonationCard, 300);
            }, reduced ? 0 : 300);
            return;
          }

          setCardCollapsed(donationCardCollapsed);
          triggerHeaderCountPop();
        }, reduced ? 0 : 280);
      }, settle);
    }

    function renderDonationCard(withEntryAnimation) {
      if (!hasActiveDonation()) return;
      if (!heroSection.parentNode) return;

      if (!cardEl) {
        cardEl = document.createElement('section');
        cardEl.className = 'donation-card';
        if (withEntryAnimation && !prefersReducedMotion() && !donationCardShownOnce) {
          cardEl.classList.add('is-entering');
        }
        cardEl.innerHTML = '' +
          '<button type="button" class="donation-card-header" aria-expanded="true">' +
            '<div class="donation-card-left">' +
              '<span class="donation-card-dot" aria-hidden="true"></span>' +
              '<span class="donation-card-header-text">Currently contributing</span>' +
            '</div>' +
            '<span class="donation-card-chevron" aria-hidden="true">⌃</span>' +
          '</button>' +
          '<div class="donation-card-body">' +
            '<div class="donation-card-groups"></div>' +
          '</div>';

        heroSection.parentNode.insertBefore(cardEl, heroSection);
        donationCardShownOnce = true;
        cardGroupsEl = cardEl.querySelector('.donation-card-groups');

        var headerBtn = cardEl.querySelector('.donation-card-header');
        if (headerBtn) {
          headerBtn.addEventListener('click', function() {
            setCardCollapsed(!donationCardCollapsed);
            headerBtn.setAttribute('aria-expanded', String(!donationCardCollapsed));
          });
        }
      }

      syncCardGroups(!!(donationCardShownOnce && withEntryAnimation));
      setCardCollapsed(donationCardCollapsed);

      if (cardEl.classList.contains('is-entering')) {
        requestAnimationFrame(function() {
          if (cardEl) cardEl.classList.remove('is-entering');
        });
      }
    }

    function dismissModalAndContinue() {
      if (!modalEl && !modalBackdropEl) {
        renderDonationCard(true);
        triggerHeaderCountPop();
        return;
      }
      if (prefersReducedMotion()) {
        removeModalImmediately();
        renderDonationCard(true);
        triggerHeaderCountPop();
        return;
      }
      if (modalEl) modalEl.classList.remove('is-visible');
      if (modalBackdropEl) modalBackdropEl.classList.remove('is-visible');
      trackTimeout(function() {
        removeModalImmediately();
        renderDonationCard(true);
        triggerHeaderCountPop();
      }, 200);
    }

    function renderThankYouModal() {
      if (modalEl || !hasActiveDonation()) return;
      var snapshot = donationLastConfirmedSnapshot || null;
      var entries = snapshot && Array.isArray(snapshot.items) ? snapshot.items : [];
      var selectedDropoff = snapshot && snapshot.selectedDropoff ? snapshot.selectedDropoff : null;
      function getDropoffLabel(dropoff) {
        var id = dropoff && dropoff.id ? dropoff.id : '';
        if (id === 'upcoming-drive') return 'Upcoming drive - Trout Lake Community Centre';
        if (id === 'private') return 'Private residence drop-off';
        if (id === 'cross') return 'Cross & Crows Books';
        if (id === 'wildfires') return 'Wildfires Bookshop';
        if (dropoff && dropoff.mapQuery) return dropoff.mapQuery;
        return 'Drop-off location pending';
      }
      modalBackdropEl = document.createElement('div');
      modalBackdropEl.className = 'donation-modal-backdrop';

      modalEl = document.createElement('div');
      modalEl.className = 'donation-modal';
      modalEl.innerHTML = '' +
        '<button type="button" class="donation-modal-close" aria-label="Close">×</button>' +
        '<div class="donation-modal-copy">' +
          '<img src="img/hearthands.gif" alt="" class="donation-modal-hero-image">' +
          '<h3 class="donation-modal-title">Thank you, <span></span>.</h3>' +
          '<p class="donation-modal-kicker">Your contribution is queued for drop-off. This helps us keep essentials moving through the community.</p>' +
          '<div class="donation-modal-hero-divider"></div>' +
          '<div class="donation-modal-queue-content">' +
            '<div class="donation-modal-queue-section">' +
              '<p class="donation-modal-queue-label">You are bringing</p>' +
              '<div class="donation-modal-queue-list" id="dc-modal-item-list"></div>' +
            '</div>' +
            '<div class="donation-modal-queue-section">' +
              '<p class="donation-modal-queue-label">Drop-off</p>' +
              '<p class="donation-modal-queue-dropoff" id="dc-modal-dropoff"></p>' +
              '<div class="donation-modal-map-wrap hidden" id="dc-modal-map-wrap" aria-hidden="true">' +
                '<iframe id="dc-modal-map" class="donation-modal-map-frame" title="Drop-off location map" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="" allow="fullscreen"></iframe>' +
              '</div>' +
              '<p class="donation-modal-queue-note">We\'ll remind you before your drop-off window.</p>' +
            '</div>' +
          '</div>' +
          '<div class="donation-modal-queue-actions">' +
            '<button type="button" class="btn btn-primary donation-modal-cta" id="dc-modal-confirm-btn"><span class="btn__label">Go back home</span></button>' +
            '<button type="button" class="btn btn-secondary donation-modal-cta donation-modal-cta-secondary" id="dc-modal-make-changes-btn"><span class="btn__label">Make changes</span></button>' +
          '</div>' +
        '</div>';

      var titleName = modalEl.querySelector('.donation-modal-title span');
      if (titleName) titleName.textContent = getDisplayUsername();
      var listEl = modalEl.querySelector('#dc-modal-item-list');
      var dropoffEl = modalEl.querySelector('#dc-modal-dropoff');
      var mapWrapEl = modalEl.querySelector('#dc-modal-map-wrap');
      var mapFrameEl = modalEl.querySelector('#dc-modal-map');
      if (listEl) {
        listEl.innerHTML = '';
        if (!entries.length) {
          var empty = document.createElement('div');
          empty.className = 'di-sheet-empty';
          empty.textContent = 'No items added.';
          listEl.appendChild(empty);
        } else {
          entries.forEach(function(entry) {
            var row = document.createElement('div');
            row.className = 'di-sheet-item-row';

            var left = document.createElement('div');
            left.className = 'di-sheet-item-left';

            var main = document.createElement('div');
            main.className = 'di-sheet-item-main';

            var thumb = document.createElement('div');
            thumb.className = 'di-sheet-item-thumb';
            var icon = document.createElement('img');
            icon.src = typeof donationGetItemIconSrc === 'function' ? donationGetItemIconSrc(entry.itemName) : 'img/icons/icon-stars.svg';
            icon.alt = '';
            thumb.appendChild(icon);

            var name = document.createElement('span');
            name.className = 'di-sheet-item-name';
            name.textContent = entry.itemName;

            main.appendChild(thumb);
            main.appendChild(name);
            left.appendChild(main);

            var right = document.createElement('div');
            right.className = 'di-sheet-item-right';
            var qtyBadge = document.createElement('span');
            qtyBadge.className = 'donation-card-qty';
            qtyBadge.textContent = '×' + String(entry.qty);
            right.appendChild(qtyBadge);

            row.appendChild(left);
            row.appendChild(right);
            listEl.appendChild(row);
          });
        }
      }
      if (dropoffEl) dropoffEl.textContent = getDropoffLabel(selectedDropoff);
      if (mapWrapEl && mapFrameEl) {
        if (selectedDropoff && selectedDropoff.mapQuery) {
          mapWrapEl.classList.remove('hidden');
          mapWrapEl.setAttribute('aria-hidden', 'false');
          mapFrameEl.src = 'https://www.google.com/maps?q=' + encodeURIComponent(selectedDropoff.mapQuery) + '&output=embed';
        } else {
          mapWrapEl.classList.add('hidden');
          mapWrapEl.setAttribute('aria-hidden', 'true');
          mapFrameEl.removeAttribute('src');
        }
      }

      appContainer.appendChild(modalBackdropEl);
      appContainer.appendChild(modalEl);
      document.body.classList.add('home-thankyou-modal-open');

      modalBackdropEl.addEventListener('click', dismissModalAndContinue);
      var closeBtn = modalEl.querySelector('.donation-modal-close');
      var confirmBtn = modalEl.querySelector('#dc-modal-confirm-btn');
      var makeChangesBtn = modalEl.querySelector('#dc-modal-make-changes-btn');
      if (closeBtn) closeBtn.addEventListener('click', dismissModalAndContinue);
      if (confirmBtn) confirmBtn.addEventListener('click', dismissModalAndContinue);
      if (makeChangesBtn) {
        makeChangesBtn.addEventListener('click', function() {
          var snapshotForEdit = donationLastConfirmedSnapshot;
          dismissModalAndContinue();
          setTimeout(function() {
            if (typeof restoreDonateItemsFromSnapshot === 'function') {
              restoreDonateItemsFromSnapshot(snapshotForEdit);
            } else {
              showPage('donate-items');
            }
          }, 220);
        });
      }

      if (prefersReducedMotion()) {
        modalBackdropEl.classList.add('is-visible');
        modalEl.classList.add('is-visible');
      } else {
        requestAnimationFrame(function() {
          if (modalBackdropEl) modalBackdropEl.classList.add('is-visible');
          if (modalEl) modalEl.classList.add('is-visible');
        });
      }
    }

    function startCelebrationFlow() {
      if (!hasActiveDonation()) return;
      if (typeof donationGetItemIconSrc === 'function') {
        var names = collectRainNames();
        if (!names.length) names = ['Tents', 'Sleeping bags', 'Tarps'];
        startHomeIconRainHeavy(names, donationGetItemIconSrc, homePage);
      }
      modalDelayTimer = setTimeout(function() {
        modalDelayTimer = null;
        if (activePageName !== 'home') return;
        renderThankYouModal();
      }, 1200);
    }

    function processPendingCelebration() {
      if (!hasActiveDonation() || pendingHomeCelebrations <= 0) return;
      if (modalEl || modalBackdropEl) removeModalImmediately();
      pendingHomeCelebrations = Math.max(0, pendingHomeCelebrations - 1);
      startCelebrationFlow();
    }

    homeDonationCelebrationController = {
      onHomeShown: function() {
        if (!hasActiveDonation()) return;
        if (donationJustConfirmed || pendingHomeCelebrations > 0) {
          donationJustConfirmed = false;
          processPendingCelebration();
          return;
        }
        if (!modalEl && !cardEl) {
          renderDonationCard(!donationCardShownOnce);
        } else if (cardEl) {
          syncCardGroups(false);
          setCardCollapsed(donationCardCollapsed);
        }
      },
      onHomeHidden: function() {
        clearPendingTimeouts();
        if (modalEl || modalBackdropEl) {
          removeModalImmediately();
          donationJustConfirmed = false;
        }
        if (groupsCompleting.size > 0) {
          finalizeDonationCard();
        }
      }
    };
  })();

  function initDonateMoneyConfirmPage() {
    const page = document.querySelector('.page-donate-money-confirm');
    const doneBtn = document.getElementById('dcm-done-btn');
    const againBtn = document.getElementById('dcm-donate-again-btn');
    const thankYou = document.getElementById('dcm-thank-you');
    const subline = document.getElementById('dcm-subline');
    const summaryTitle = document.getElementById('dcm-summary-title');
    const summaryAmount = document.getElementById('dcm-summary-amount');
    if (!page || !doneBtn || !againBtn || !thankYou || !subline || !summaryTitle || !summaryAmount) return null;

    function animateEntrance() {
      page.classList.remove('is-open', 'is-content-visible');
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          page.classList.add('is-open');
          setTimeout(function() { page.classList.add('is-content-visible'); }, 320);
        });
      });
    }

    function formatAmount(value) {
      return '$' + Number(value || 0).toFixed(2);
    }

    function toDonateItemsPage() {
      showPage('donate-items');
    }

    function toHomePage() {
      showPage('home');
    }

    againBtn.addEventListener('click', toDonateItemsPage);
    doneBtn.addEventListener('click', toHomePage);

    return {
      open: function(snapshot) {
        var amount = snapshot && snapshot.amount != null ? snapshot.amount : donateState.amount;
        var isMonthly = !!(snapshot && snapshot.isMonthly);
        thankYou.textContent = isMonthly ? 'Your monthly contribution is active.' : 'Your contribution was sent.';
        subline.textContent = isMonthly ? 'Your subscription is now set. You can update it anytime in Contribute Money.' : 'Thank you for supporting mutual aid.';
        summaryTitle.textContent = isMonthly ? 'Monthly contribution' : 'One-time contribution';
        summaryAmount.textContent = formatAmount(amount);
        showPage('donate-money-confirm');
        animateEntrance();
      }
    };
  }

  function initVolunteerConfirmPage() {
    var page = document.querySelector('.page-volunteer-confirm');
    var doneBtn = document.getElementById('vc-done-btn');
    var secondaryBtn = document.getElementById('vc-secondary-btn');
    var vcEventTitle = document.getElementById('vc-event-title');
    var vcEventDatetime = document.getElementById('vc-event-datetime');
    var vcEventLocation = document.getElementById('vc-event-location');
    var vcEventCategoryIcon = document.getElementById('vc-event-category-icon');
    var vcRole = document.getElementById('vc-role');
    var vcShift = document.getElementById('vc-shift');
    var vcDate = document.getElementById('vc-date');
    var vcImpactCopy = document.getElementById('vc-impact-copy');
    if (!page) return null;

    function animateEntrance() {
      page.classList.remove('is-open', 'is-content-visible');
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          page.classList.add('is-open');
          setTimeout(function() { page.classList.add('is-content-visible'); }, 320);
        });
      });
    }

    function applyPayload(data) {
      var d = Object.assign({}, VOLUNTEER_CONFIRM_DEFAULTS, data || {});
      if (vcEventTitle) vcEventTitle.textContent = d.eventTitle;
      if (vcEventDatetime) vcEventDatetime.textContent = d.eventDateTime;
      if (vcEventLocation) vcEventLocation.textContent = d.eventLocation;
      if (vcEventCategoryIcon) {
        vcEventCategoryIcon.src = d.categoryIcon;
        vcEventCategoryIcon.alt = d.eventTitle || '';
      }
      if (vcRole) vcRole.textContent = d.role;
      if (vcShift) vcShift.textContent = d.shift;
      if (vcDate) vcDate.textContent = d.eventDate != null ? d.eventDate : '';
      if (vcImpactCopy && d.impactCopy) vcImpactCopy.textContent = d.impactCopy;

      var id = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
      var vc = {
        id: id,
        eventTitle: d.eventTitle,
        categoryIcon: d.categoryIcon,
        role: d.role,
        shift: d.shift,
        eventDate: d.eventDate
      };
      volunteerCommitments = volunteerCommitments || [];
      volunteerCommitments.push(vc);
    }

    if (doneBtn) {
      doneBtn.addEventListener('click', function() {
        var latest = volunteerCommitments && volunteerCommitments.length ? volunteerCommitments[volunteerCommitments.length - 1] : null;
        profileCommitmentNewType = 'volunteer';
        profileCommitmentNewId = latest && latest.id ? latest.id : null;
        showPage('profile');
      });
    }
    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', function() {
        showPage('events');
      });
    }

    if (detailCta) {
      detailCta.addEventListener('click', function() {
        var id = lastEventDetailId;
        var ev = id && eventDetails[id];
        if (!ev) return;
        var locParts = [ev.locationLabel, ev.address].filter(Boolean);
        var loc = locParts.length ? locParts.join(', ') : VOLUNTEER_CONFIRM_DEFAULTS.eventLocation;
        window.__openVolunteerConfirm({
          eventTitle: ev.title,
          eventDateTime: ev.datetime,
          eventDate: ev.eventDate || VOLUNTEER_CONFIRM_DEFAULTS.eventDate,
          eventLocation: loc,
          categoryIcon: ev.icon,
          role: VOLUNTEER_CONFIRM_DEFAULTS.role,
          shift: VOLUNTEER_CONFIRM_DEFAULTS.shift
        }, 'detail');
      });
    }

    window.__openVolunteerConfirm = function(payload, returnPage) {
      volunteerConfirmReturnPage = returnPage || 'home';
      applyPayload(payload);
      showPage('volunteer-confirm');
      animateEntrance();
    };

    return { open: window.__openVolunteerConfirm };
  }

  // ── Donate Items Page ──
  (function initDonateItemsPage() {
    const itemQuantities = new Map();
    let diSheetOpen = false;
    let selectedDropoff = 'upcoming-drive';
    const DI_SHEET_QTY_MAX = 999;
    const confirmUsername = 'Rgdfriend';
    const CLOTHING_ITEM_NAMES = new Set(['2XL-6XL clothes', 'Socks', 'Rain jackets']);
    const BOOKSTORE_DROPOFF_IDS = new Set(['cross', 'wildfires']);
    const DROP_OFF_LOCATIONS = [
      { id: 'upcoming-drive', mapQuery: 'Trout Lake Community Centre, Vancouver, BC' },
      { id: 'private', mapQuery: 'Private Residence, 436 12th Ave East, Vancouver, BC' },
      { id: 'cross', mapQuery: 'Cross & Crows Books, 2836 Commercial Dr, Vancouver, BC' },
      { id: 'wildfires', mapQuery: 'Wildfires Bookshop, 712B 12th St, New Westminster, BC' }
    ];

    const diFab = document.getElementById('di-fab');
    const diFabCount = document.getElementById('di-fab-count');
    let lastFabCount = 0;
    const diSheetBackdrop = document.getElementById('di-sheet-backdrop');
    const diSheet = document.getElementById('di-sheet');
    const diSheetClose = document.getElementById('di-sheet-close');
    const diSheetConsent = document.getElementById('di-bs-consent-box');
    const diSheetItems = document.getElementById('di-sheet-items');
    const diSheetResetItemsBtn = document.getElementById('di-sheet-reset-items-btn');
    const diSheetAddMoreLink = document.getElementById('di-sheet-add-more-link');
    const diConfirmBtn = document.getElementById('di-confirm-btn');
    const diDropoffSection = document.querySelector('.di-sheet-body-dropoff .di-sheet-section');

    const getItemIconSrc = (name) => ({
      '2XL-6XL clothes': 'img/icons/icon-2xl-6xl-clothes.svg',
      'Tents': 'img/icons/icon-tents.svg',
      'Reusable bags': 'img/icons/icon-reusable-bags.svg',
      'Socks': 'img/icons/icon-socks.svg',
      'AA Batteries': 'img/icons/icon-batteries.svg',
      'Tarps': 'img/icons/icon-tarps.svg',
      'Tea lights': 'img/icons/icon-tea-lights.svg',
      'Umbrellas': 'img/icons/icon-umbrellas.svg',
      'Sleeping bags': 'img/icons/icon-tarps.svg',
      'Rain jackets': 'img/icons/icon-2xl-6xl-clothes.svg'
    }[name] || 'img/icons/icon-stars.svg');

    function getDropoffById(id) {
      return DROP_OFF_LOCATIONS.find(function(loc) { return loc.id === id; }) || DROP_OFF_LOCATIONS[0];
    }

    function getDonateConfirmSnapshot() {
      const items = Array.from(itemQuantities.entries()).map(function(entry) {
        return { itemName: entry[0], qty: entry[1] };
      });
      const selectedDropoffObj = getDropoffById(selectedDropoff);
      return {
        username: confirmUsername,
        items: items,
        selectedDropoff: selectedDropoffObj
      };
    }

    function resetDonateItemsUIForNextRun() {
      if (diSheetConsent) {
        diSheetConsent.classList.remove('checked');
        diSheetConsent.innerHTML = '';
      }
      if (diSheetBackdrop) diSheetBackdrop.classList.remove('is-open');
      if (diSheet) diSheet.classList.remove('is-open');
      diSheetOpen = false;
      document.body.classList.remove('donate-sheet-open');
      document.body.style.overflow = '';
      updateSheetDonateState();
    }

    donateMoneyConfirmController = initDonateMoneyConfirmPage();
    volunteerConfirmController = initVolunteerConfirmPage();

    function commitDonationSnapshot(snapshot) {
      if (!snapshot || !snapshot.items || !snapshot.items.length) return false;
      var session = {
        id: String(Date.now()) + '-' + Math.random().toString(36).slice(2),
        confirmedAt: Date.now(),
        dropoff: snapshot.selectedDropoff || getDropoffById(selectedDropoff),
        items: snapshot.items.map(function(entry) {
          return { itemName: entry.itemName, qty: entry.qty };
        })
      };
      if (!mergeDonationGroupSession(session)) return false;
      donationGetItemIconSrc = getItemIconSrc;
      donationLastConfirmedItems = session.items.map(function(entry) {
        return { itemName: entry.itemName, qty: entry.qty };
      });
      donationLastConfirmedSnapshot = {
        username: snapshot.username || confirmUsername,
        selectedDropoff: session.dropoff,
        items: donationLastConfirmedItems.map(function(entry) {
          return { itemName: entry.itemName, qty: entry.qty };
        })
      };
      donationJustConfirmed = true;
      pendingHomeCelebrations += 1;
      return true;
    }

    function openDonateConfirm() {
      const snapshot = getDonateConfirmSnapshot();
      if (!commitDonationSnapshot(snapshot)) return;
      itemQuantities.clear();
      selectedDropoff = 'upcoming-drive';
      resetDonateItemsUIForNextRun();
      showPage('home');
      updateDiUI();
    }

    function resetDrawerStateCompletely() {
      itemQuantities.clear();
      selectedDropoff = 'upcoming-drive';
      if (diSheetConsent) {
        diSheetConsent.classList.remove('checked');
        diSheetConsent.innerHTML = '';
      }
      resetDonateItemsUIForNextRun();
      updateDiUI();
    }

    restoreDonateItemsFromSnapshot = function(snapshot) {
      itemQuantities.clear();
      if (snapshot && Array.isArray(snapshot.items)) {
        snapshot.items.forEach(function(entry) {
          var name = entry && entry.itemName;
          var qty = entry && Number(entry.qty);
          if (!name || !Number.isFinite(qty) || qty <= 0) return;
          itemQuantities.set(name, Math.max(1, Math.floor(qty)));
        });
      }
      selectedDropoff = snapshot && snapshot.selectedDropoff && snapshot.selectedDropoff.id
        ? snapshot.selectedDropoff.id
        : 'upcoming-drive';
      showPage('donate-items');
      updateDiUI();
      openDiSheet();
    };

    function getTotalItemCount() {
      let total = 0;
      itemQuantities.forEach(function(qty) { total += qty; });
      return total;
    }

    function hasClothingInCart() {
      var has = false;
      itemQuantities.forEach(function(qty, itemName) {
        if (!has && qty > 0 && CLOTHING_ITEM_NAMES.has(itemName)) has = true;
      });
      return has;
    }

    function isBookstoreDropoff(id) {
      return BOOKSTORE_DROPOFF_IDS.has(id);
    }

    function setItemQuantity(itemName, qty) {
      if (qty <= 0) itemQuantities.delete(itemName);
      else itemQuantities.set(itemName, qty);
    }

    function syncPageCardsFromState() {
      document.querySelectorAll('.page-donate-items .di-item-card[data-item]').forEach(function(card) {
        const itemName = card.dataset.item;
        const btn = card.querySelector('.di-item-btn');
        const icon = card.querySelector('.item-icon[data-icon-active][data-icon-inactive]');
        const active = itemQuantities.has(itemName);
        card.classList.toggle('selected', active);
        if (btn) btn.textContent = active ? 'Added' : 'I have this';
        if (icon) {
          icon.src = active ? icon.dataset.iconActive : icon.dataset.iconInactive;
        }
      });
    }

    function jumpDiItemIconForItem(itemName) {
      if (!itemName || prefersReducedMotionUI()) return;
      var safe = itemName;
      if (window.CSS && CSS.escape) {
        safe = CSS.escape(itemName);
      } else {
        safe = itemName.replace(/"/g, '\\"');
      }
      var card = document.querySelector('.page-donate-items .di-item-card[data-item="' + safe + '"]');
      if (!card) return;
      var icon = card.querySelector('.item-icon');
      if (!icon) return;
      icon.classList.remove('di-item-icon-jump');
      void icon.offsetWidth;
      icon.classList.add('di-item-icon-jump');
      icon.addEventListener('animationend', function handleDiItemIconJump() {
        icon.classList.remove('di-item-icon-jump');
        icon.removeEventListener('animationend', handleDiItemIconJump);
      });
    }

    function commitSheetQtyFromInput(input) {
      if (!input || !input.dataset.item) return;
      const itemName = input.dataset.item;
      if (!itemQuantities.has(itemName)) return;
      const raw = String(input.value).trim();
      const nParsed = parseInt(raw, 10);
      const current = itemQuantities.get(itemName);
      if (raw === '' || !Number.isFinite(nParsed)) {
        input.value = String(current);
        return;
      }
      if (nParsed <= 0) {
        setItemQuantity(itemName, 0);
        updateDiUI();
        return;
      }
      const n = Math.min(DI_SHEET_QTY_MAX, Math.max(1, nParsed));
      if (n !== current) {
        setItemQuantity(itemName, n);
        updateDiUI();
        if (itemQuantities.has(itemName)) jumpBadgeForItem(itemName, n);
      } else {
        input.value = String(n);
      }
    }

    function renderSheetItems() {
      if (!diSheetItems) return;
      diSheetItems.innerHTML = '';

      if (itemQuantities.size === 0) {
        const empty = document.createElement('div');
        empty.className = 'di-sheet-empty';
        empty.textContent = 'No items added yet.';
        diSheetItems.appendChild(empty);
        return;
      }

      const entries = Array.from(itemQuantities.entries());

      function appendRow(itemName, qty, isPaired) {
        const row = document.createElement('div');
        row.className = 'di-sheet-item-row';
        if (isPaired) row.classList.add('is-paired');
        row.dataset.item = itemName;

        const left = document.createElement('div');
        left.className = 'di-sheet-item-left';

        const main = document.createElement('div');
        main.className = 'di-sheet-item-main';

        const thumb = document.createElement('div');
        thumb.className = 'di-sheet-item-thumb';
        const icon = document.createElement('img');
        icon.alt = '';
        icon.src = getItemIconSrc(itemName);
        thumb.appendChild(icon);

        const name = document.createElement('div');
        name.className = 'di-sheet-item-name';
        name.textContent = itemName;

        main.appendChild(thumb);
        main.appendChild(name);
        left.appendChild(main);
        row.appendChild(left);

        const right = document.createElement('div');
        right.className = 'di-sheet-item-right';

        const qtyWrap = document.createElement('div');
        qtyWrap.className = 'di-sheet-qty';

        const dec = document.createElement('button');
        dec.className = 'di-sheet-qty-btn';
        dec.dataset.action = 'dec';
        dec.dataset.item = itemName;
        dec.type = 'button';
        dec.textContent = '-';

        const qtyInput = document.createElement('input');
        qtyInput.className = 'di-sheet-qty-input';
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.max = String(DI_SHEET_QTY_MAX);
        qtyInput.dataset.item = itemName;
        qtyInput.value = String(qty);
        qtyInput.setAttribute('aria-label', 'Quantity for ' + itemName);

        const inc = document.createElement('button');
        inc.className = 'di-sheet-qty-btn';
        inc.dataset.action = 'inc';
        inc.dataset.item = itemName;
        inc.type = 'button';
        inc.textContent = '+';

        qtyWrap.appendChild(dec);
        qtyWrap.appendChild(qtyInput);
        qtyWrap.appendChild(inc);
        right.appendChild(qtyWrap);
        row.appendChild(right);

        diSheetItems.appendChild(row);
      }

      entries.forEach(function(entry) {
        const itemName = entry[0];
        const qty = entry[1];
        appendRow(itemName, qty, false);
      });
    }

    function renderDropoffSelection() {
      const clothingInCart = hasClothingInCart();
      let hasBlocked = false;
      if (clothingInCart && isBookstoreDropoff(selectedDropoff)) {
        selectedDropoff = 'upcoming-drive';
      }
      document.querySelectorAll('.di-bs-location-card').forEach(function(card) {
        const id = card.dataset.sheetLocation;
        const isBlocked = clothingInCart && isBookstoreDropoff(id);
        if (isBlocked) hasBlocked = true;
        const isSelected = !isBlocked && id === selectedDropoff;
        card.classList.toggle('is-clothing-blocked', isBlocked);
        card.classList.toggle('is-selected', isSelected);
        card.classList.toggle('is-muted', !isSelected && !isBlocked);
        card.setAttribute('aria-disabled', isBlocked ? 'true' : 'false');
      });
      if (diDropoffSection) {
        diDropoffSection.classList.toggle('has-blocked-dropoffs', hasBlocked);
      }
    }

    function updateSheetDonateState() {
      if (!diConfirmBtn || !diSheetConsent) return;
      const enabled = diSheetConsent.classList.contains('checked') && getTotalItemCount() > 0 && !!selectedDropoff;
      const count = getTotalItemCount();
      diConfirmBtn.disabled = !enabled;
      diConfirmBtn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      const label = diConfirmBtn.querySelector('.btn__label');
      if (label) label.textContent = 'Confirm contribution (' + count + ' item' + (count === 1 ? '' : 's') + ')';
    }

    function openDiSheet() {
      if (!diSheet || !diSheetBackdrop) return;
      if (getTotalItemCount() === 0) return;
      diSheetOpen = true;
      diSheetBackdrop.classList.add('is-open');
      diSheet.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('donate-sheet-open');
      renderSheetItems();
      renderDropoffSelection();
      updateSheetDonateState();
    }

    function closeDiSheet() {
      if (!diSheet || !diSheetBackdrop) return;
      diSheetOpen = false;
      diSheetBackdrop.classList.remove('is-open');
      diSheet.classList.remove('is-open');
      document.body.style.overflow = '';
      document.body.classList.remove('donate-sheet-open');
    }

    function updateDiUI() {
      const count = getTotalItemCount();
      const hasResettableQty = Array.from(itemQuantities.values()).some(function(qty) { return qty > 1; });
      if (diFab && diFabCount) {
        diFab.classList.toggle('visible', count > 0);
        diFabCount.textContent = String(count);

        if (count > lastFabCount && count > 0) {
          diFab.classList.remove('di-fab-bounce');
          // Force reflow so the animation can restart
          void diFab.offsetWidth;
          diFab.classList.add('di-fab-bounce');
        }
        lastFabCount = count;
      }
      if (count === 0 && diSheetOpen) closeDiSheet();
      syncPageCardsFromState();
      renderSheetItems();
      renderDropoffSelection();
      if (diSheetResetItemsBtn) {
        diSheetResetItemsBtn.hidden = !hasResettableQty;
      }
      if (diSheetAddMoreLink) {
        diSheetAddMoreLink.hidden = count === 0;
      }
      updateSheetDonateState();
    }

    function jumpBadgeForItem(itemName, qty) {
      if (!diSheetItems || !itemName || qty == null) return;
      var safe = itemName;
      if (window.CSS && CSS.escape) {
        safe = CSS.escape(itemName);
      } else {
        safe = itemName.replace(/"/g, '\\"');
      }
      const row = diSheetItems.querySelector('.di-sheet-item-row[data-item="' + safe + '"]');
      if (!row) return;
      const qtyInput = row.querySelector('.di-sheet-qty-input');
      if (!qtyInput) return;
      qtyInput.classList.remove('di-badge-jump');
      void qtyInput.offsetWidth;
      qtyInput.classList.add('di-badge-jump');
      qtyInput.addEventListener('animationend', function handle() {
        qtyInput.classList.remove('di-badge-jump');
        qtyInput.removeEventListener('animationend', handle);
      });
    }

    // Drop-off selection (single select persisted)
    document.querySelectorAll('.di-bs-location-card').forEach(function(card) {
      card.addEventListener('click', function() {
        if (card.classList.contains('is-clothing-blocked')) return;
        selectedDropoff = card.dataset.sheetLocation || selectedDropoff;
        card.classList.remove('di-badge-jump');
        void card.offsetWidth;
        card.classList.add('di-badge-jump');
        card.addEventListener('animationend', function handleDropoffBounce() {
          card.classList.remove('di-badge-jump');
          card.removeEventListener('animationend', handleDropoffBounce);
        });
        renderDropoffSelection();
        updateSheetDonateState();
      });
    });

    // Tap scale effect on pointerdown so it fires immediately before click (things may disappear on click)
    var diSheetTapTimeout = null;
    var diSheetTapEl = null;
    var diSheetTappableSelector = 'button, a, [role="button"], .di-sheet-close, .di-bs-consent-box, .di-bs-consent';
    if (diSheet) {
      diSheet.addEventListener('pointerdown', function(e) {
        var el = e.target.closest(diSheetTappableSelector);
        if (!el || !diSheet.contains(el)) return;
        if (el.classList.contains('di-bs-consent') || el.closest('.di-bs-consent') === el) el = el.querySelector('.di-bs-consent-box') || el;
        if (diSheetTapTimeout) { clearTimeout(diSheetTapTimeout); if (diSheetTapEl) { diSheetTapEl.style.transform = ''; diSheetTapEl.style.transition = ''; } }
        diSheetTapEl = el;
        el.style.transform = 'scale(1.03)';
        diSheetTapTimeout = setTimeout(function() { if (diSheetTapEl) diSheetTapEl.style.transform = ''; diSheetTapEl = null; diSheetTapTimeout = null; }, 90);
      });
    }

    // Inline quantity controls (event delegation)
    if (diSheetItems) {
      diSheetItems.addEventListener('focusout', function(e) {
        const input = e.target;
        if (!input || !input.classList || !input.classList.contains('di-sheet-qty-input')) return;
        if (!diSheetItems.contains(input)) return;
        commitSheetQtyFromInput(input);
      });
      diSheetItems.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        const input = e.target;
        if (!input || !input.classList || !input.classList.contains('di-sheet-qty-input')) return;
        e.preventDefault();
        commitSheetQtyFromInput(input);
        input.blur();
      });
      diSheetItems.addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const itemName = btn.dataset.item;
        if (!itemName || !itemQuantities.has(itemName)) return;

        if (action === 'inc') {
          const nextQty = Math.min(DI_SHEET_QTY_MAX, (itemQuantities.get(itemName) || 0) + 1);
          setItemQuantity(itemName, nextQty);
          updateDiUI();
          jumpBadgeForItem(itemName, nextQty);
          return;
        }

        if (action === 'dec') {
          const nextQty = (itemQuantities.get(itemName) || 0) - 1;
          setItemQuantity(itemName, nextQty);
          if (!itemQuantities.has(itemName)) {
            updateDiUI();
            return;
          }
          updateDiUI();
          jumpBadgeForItem(itemName, nextQty);
        }
      });
    }

    // Item selection buttons
    document.querySelectorAll('.page-donate-items .di-item-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = btn.closest('.di-item-card');
        if (!card) return;
        const itemName = card.dataset.item;
        if (!itemName) return;

        var diItemJustAdded = false;
        if (itemQuantities.has(itemName)) {
          setItemQuantity(itemName, 0);
        } else {
          setItemQuantity(itemName, 1);
          diItemJustAdded = true;
          btn.style.transform = 'scale(1.12)';
          setTimeout(function() { btn.style.transform = ''; }, 90);
        }
        updateDiUI();
        if (diItemJustAdded) jumpDiItemIconForItem(itemName);
      });
    });

    // FAB and bottom sheet open/close
    if (diFab) diFab.addEventListener('click', openDiSheet);
    if (diSheetClose) {
      diSheetClose.addEventListener('click', function() {
        resetDrawerStateCompletely();
      });
    }
    if (diSheetAddMoreLink) {
      diSheetAddMoreLink.addEventListener('click', function() {
        closeDiSheet();
      });
    }
    if (diSheetResetItemsBtn) {
      diSheetResetItemsBtn.addEventListener('click', function() {
        itemQuantities.forEach(function(_, itemName) {
          itemQuantities.set(itemName, 1);
        });
        updateDiUI();
      });
    }
    if (diConfirmBtn) {
      diConfirmBtn.addEventListener('click', function() {
        if (diConfirmBtn.disabled) return;
        if (diSheet && diSheet.classList.contains('is-open')) {
          openDonateConfirm();
        }
      });
    }
    if (diSheetBackdrop) diSheetBackdrop.addEventListener('click', closeDiSheet);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && diSheetOpen) closeDiSheet();
    });

    // consent
    if (diSheetConsent) {
      diSheetConsent.addEventListener('click', function() {
        diSheetConsent.classList.toggle('checked');
        diSheetConsent.innerHTML = diSheetConsent.classList.contains('checked')
          ? '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><polyline points="20 6 9 17 4 12"/></svg>'
          : '';
        updateSheetDonateState();
      });
    }

    const diSwitchToMoney = document.getElementById('di-switch-to-money');
    if (diSwitchToMoney) {
      diSwitchToMoney.addEventListener('click', function() {
        window.__swapIconAnimTarget = 'donate-money';
        closeDiSheet();
        showPage('donate-money');
      });
    }

    function scrollDiItemCardIntoView(itemName) {
      if (!itemName) return;
      var safe = itemName;
      if (window.CSS && CSS.escape) {
        safe = CSS.escape(itemName);
      } else {
        safe = itemName.replace(/"/g, '\\"');
      }
      var card = document.querySelector('.page-donate-items .di-item-card[data-item="' + safe + '"]');
      if (!card || !card.scrollIntoView) return;
      var smooth = !prefersReducedMotionUI();
      card.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    }

    function addDonateItemFromHotTicketAndOpen(itemName) {
      if (!itemName) return;
      var diHotTicketJustAdded = !itemQuantities.has(itemName) || itemQuantities.get(itemName) < 1;
      if (diHotTicketJustAdded) {
        setItemQuantity(itemName, 1);
      }
      donateReturnPage = activePageName || 'home';
      updateDiUI();
      showPage('donate-items');
      if (diHotTicketJustAdded) jumpDiItemIconForItem(itemName);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          scrollDiItemCardIntoView(itemName);
        });
      });
    }

    var homeHotItemsRoot = document.querySelector('.page-home .hot-items');
    if (homeHotItemsRoot) {
      homeHotItemsRoot.addEventListener('click', function(e) {
        var btn = e.target.closest('.item-card[data-item] .btn.btn-secondary');
        if (!btn || !homeHotItemsRoot.contains(btn)) return;
        var card = btn.closest('.item-card');
        if (!card || !card.dataset.item) return;
        e.preventDefault();
        addDonateItemFromHotTicketAndOpen(card.dataset.item);
      });
    }

    updateDiUI();
  })();

  // ── Settings Page ──
  (function initSettingsPage() {
    document.querySelectorAll('.page-settings [data-toggle]').forEach(toggle => {
      toggle.addEventListener('click', () => toggle.classList.toggle('on'));
    });
  })();

  // Segment toggle (donate money/items; sliding pill)
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      var seg = btn.closest('.segment');
      if (!seg) return;
      if (seg.classList.contains('donate-switch-segment')) return;
      seg.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      var opts = Array.from(seg.querySelectorAll('.seg-btn'));
      seg.classList.toggle('right', opts.indexOf(btn) === 1);
    });
  });

  // Tab Interaction Logic
  function setupTabs(containerSelector) {
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
      const tabs = container.querySelectorAll('.tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    });
  }

  // Setup main content tabs (exclude forum – handled below)
  setupTabs('.tabs-container:not(.forum-tabs)');

  // Events tab panel switching (home upcoming events)
  document.querySelectorAll('.section.events').forEach(eventsSection => {
    eventsSection.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.textContent.trim().toLowerCase();
        eventsSection.querySelectorAll('.events-panel').forEach(p => p.classList.remove('active'));
        const target = eventsSection.querySelector(`.events-panel[data-panel="${key}"]`);
        if (target) target.classList.add('active');
      });
    });
  });

  // Forum filter tabs: active state + reorder cards by selected sort
  const forumSection = document.querySelector('.section.forum');
  if (forumSection) {
    const forumTabContainer = forumSection.querySelector('.forum-tabs');
    const forumTabs = forumSection.querySelectorAll('.forum-tabs .tab');
    const forumCards = forumSection.querySelector('.forum-cards');
    if (forumCards) {
      forumCards.addEventListener('click', function(e) {
        const card = e.target.closest('.forum-card');
        if (!card) return;
        if (e.target.closest('.comment-input-row')) return;
        e.preventDefault();
        var postId = card.getAttribute('data-post-id');
        if (!postId) {
          showPage('forums');
          return;
        }
        var replyCount = parseInt(card.getAttribute('data-reply-count') || '0', 10);
        if (!Number.isFinite(replyCount)) replyCount = 0;
        showPage('forum-detail');
        openForumPostDetail(postId, replyCount);
      });
    }
    if (forumTabContainer && forumCards) {
      forumTabs.forEach(tab => {
        tab.setAttribute('role', 'button');
        tab.setAttribute('tabindex', '0');
        tab.addEventListener('click', function forumTabClick() {
          const sort = this.getAttribute('data-forum-sort');
          forumTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
          if (!sort) return;
          const key = 'data-sort-' + sort;
          const cards = Array.from(forumCards.querySelectorAll('.forum-card'));
          cards.sort((a, b) => {
            const va = parseInt(a.getAttribute(key), 10) || 0;
            const vb = parseInt(b.getAttribute(key), 10) || 0;
            return va - vb;
          });
          cards.forEach(c => forumCards.appendChild(c));
        });
        tab.addEventListener('keydown', function forumTabKey(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
    }
  }

  // Events horizontal drag-to-scroll (desktop)
  function initDragScroll(el) {
    let startX, scrollLeft, isDragging = false;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let rafId = null;

    const stopMomentum = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const startMomentum = () => {
      stopMomentum();
      const step = () => {
        // friction / deceleration
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.08) {
          rafId = null;
          return;
        }
        el.scrollLeft -= velocity;
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
      stopMomentum();
      el.style.userSelect = 'none';
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      el.style.userSelect = '';
      // momentum after release (mouse only)
      if (Math.abs(velocity) > 0.5) startMomentum();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const nextScrollLeft = scrollLeft - (x - startX) * 1.2;
      el.scrollLeft = nextScrollLeft;

      // estimate velocity (px per frame-ish) for momentum
      const now = performance.now();
      const dt = Math.max(8, now - lastTime);
      const dx = e.pageX - lastX;
      // positive dx means mouse moved right => content moves left (scrollLeft increases)
      velocity = (dx / dt) * 16 * 1.2;
      lastX = e.pageX;
      lastTime = now;
    });
  }

  document.querySelectorAll('.page-home .section.events .events-panel').forEach(initDragScroll);

  // Donate icon micro-interaction (bounce: globe-accent-pop + spark-flick; particles + globePulse via .fired)
  const donateBtn = document.getElementById('donate-btn');
  donateBtn.addEventListener('click', () => {
    openDonateMoneyPage();
    const donateSvg = donateBtn.querySelector('.donate-svg');
    donateSvg.classList.remove('active');
    void donateSvg.offsetWidth;
    donateSvg.classList.add('active');
    setTimeout(() => donateSvg.classList.remove('active'), 500);
    donateBtn.classList.remove('fired');
    void donateBtn.offsetWidth;
    donateBtn.classList.add('fired');
  });
  donateBtn.addEventListener('animationend', (e) => {
    if (e.target.id === 'p5') donateBtn.classList.remove('fired');
  });

  // Touch-style cursor (desktop)
  const touchCursor = document.getElementById('touch-cursor');
  if (touchCursor && window.matchMedia('(pointer: fine)').matches) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    const moveCursor = (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      touchCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', () => {
      touchCursor.classList.add('touch-cursor--down');
    });
    window.addEventListener('mouseup', () => {
      touchCursor.classList.remove('touch-cursor--down');
    });

    const interactiveSelector = 'button, a, [role="button"], .tab, .nav-item, input, textarea, label, .stat-cell-icon, .vol-role-card-header, .vol-check-box, .vol-toggle-switch, .vol-contact-opt, .vol-consent-check, .settings-row--link, .settings-toggle, .prof-forum-post, .prof-settings-link, .forum-filter-btn, .bpost, .forum-new-post-btn, .bpost-like-btn, .bpost-reply-hint, .bpost-reply-send, .compose-submit, .compose-cat-btn, .compose-attach, .forum-comment-like-btn, .forum-comment-reply-btn, .forum-comment-delete-btn, .forum-comment-byline--thread, .top-nav-activities, .activities-filter-btn, .activities-item, .add-btn, .back-to-top, .logo-home-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector) && !e.target.closest('.bottom-nav')) {
        touchCursor.classList.add('touch-cursor--hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        touchCursor.classList.remove('touch-cursor--hover');
      }
    });
  } else if (touchCursor) {
    // On touch devices, keep native touch cursor
    touchCursor.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* Mobile: show active state on touchstart so it's visible before tap completes */
  (function initTouchActivePolyfill() {
    var touchActiveSelector = 'button, a, [role="button"], .nav-item, input, textarea, label, ' +
      '.vol-role-card-header, .vol-check-box, .vol-toggle-switch, .vol-contact-opt, .vol-consent-check, ' +
      '.settings-row--link, .settings-toggle, ' +
      '.prof-forum-post, .prof-settings-link, ' +
      '.btn, .icon-btn, .logo-home-btn, .seg-btn, .donate-icon-btn, .comment-btn, .vol-toggle-opt, .vol-cta-btn, .event-detail-share, ' +
      '.forum-filter-btn, .bpost, .forum-new-post-btn, .bpost-like-btn, .bpost-reply-hint, .bpost-reply-send, .compose-submit, .compose-cat-btn, .compose-attach, .forum-detail-comment-post, .forum-comment-like-btn, .forum-comment-reply-btn, .forum-comment-byline--thread, .top-nav-activities, .activities-filter-btn, .activities-item, .add-btn, .back-to-top, ' +
      '.dm-cta-btn, .dm-switch-to-items, .dm-toggle-switch, .dm-copy-btn, .di-item-btn, .di-switch-to-money, .di-fab, .di-sheet-close, .di-bs-consent-box, .ap-pay-btn, .ap-pay-done-btn, .ap-pay-grabber';
    function clearTouchActive() {
      document.querySelectorAll('.touch-active').forEach(function(el) { el.classList.remove('touch-active'); });
    }
    document.addEventListener('touchstart', function(e) {
      var el = e.target && e.target.closest && e.target.closest(touchActiveSelector);
      if (el) el.classList.add('touch-active');
    }, { passive: true });
    document.addEventListener('touchend', clearTouchActive, { passive: true });
    document.addEventListener('touchcancel', clearTouchActive, { passive: true });
  })();

  // ── Hero card icon tap: bounce + single raindrop ──
  (function initStatCellIconTaps() {
    var appContainer = document.querySelector('.app-container');
    document.querySelectorAll('.stat-cell-icon').forEach(function(icon) {
      icon.addEventListener('click', function() {
        icon.classList.remove('stat-icon-bouncing');
        void icon.offsetWidth;
        icon.classList.add('stat-icon-bouncing');
        icon.addEventListener('animationend', function() {
          icon.classList.remove('stat-icon-bouncing');
        }, { once: true });
        dropOneIcon(icon.src, appContainer);
      });
    });
  })();

  bindBackToTopToActivePage();
  bindTopNavScrollToActivePage();

  document.querySelectorAll('.logo-home-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (activePageName === 'home') {
        var p = document.querySelector('.page-home');
        if (p) {
          p.scrollTo({ top: 0, behavior: prefersReducedMotionUI() ? 'auto' : 'smooth' });
          var nav = p.querySelector('.top-nav');
          if (nav) nav.classList.remove('is-scroll-hidden');
        }
      } else {
        showPage('home');
      }
    });
  });

  // ── "G" key: toggle dev TODO sidebar + team corner ──
  (function initDevTodoToggle() {
    var todoShell = document.querySelector('.dev-todo-shell');
    var cornerWrap = document.querySelector('.corner-logo-wrap');
    if (todoShell && todoShell.classList.contains('is-open')) {
      todoShell.setAttribute('aria-hidden', 'false');
      if (cornerWrap) cornerWrap.style.visibility = 'hidden';
    }
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'g' && e.key !== 'G') return;
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      var open = todoShell && todoShell.classList.toggle('is-open');
      if (todoShell) todoShell.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (cornerWrap) cornerWrap.style.visibility = open ? 'hidden' : '';
    });
  })();

  // ── Retrospective impact drawer ──
  (function initRetroDrawer() {
    var drawer   = document.getElementById('retro-drawer');
    var card     = document.getElementById('retro-card');
    var tab      = document.getElementById('retro-tab');
    var closeBtn = document.getElementById('retro-close');
    var overlay  = document.getElementById('retro-overlay');
    var mascot   = document.getElementById('retro-mascot');
    if (!drawer || !card || !tab || !overlay) return;

    var isOpen     = false;
    var isDragging = false;
    var startX     = 0;
    var currentTX  = 0;
    var countNodes = card.querySelectorAll('.retro-count-num');
    var countRafId = 0;
    var mascotTimer = 0;
    var openSnapEnd = null;

    function clearOpenSnapEndListener() {
      if (!openSnapEnd) return;
      card.removeEventListener('transitionend', openSnapEnd);
      openSnapEnd = null;
    }

    // App container is 390px fixed; left: 50% puts card left edge at 195px.
    // REST_TX shifts it so card left edge sits at the right screen edge (card off-screen, tab visible).
    // OPEN_TX centres the card: translateX(-50%) = -(cardWidth/2).
    function getRestTX() {
      var pw = card.closest('.page') ? card.closest('.page').offsetWidth : 390;
      return pw / 2;
    }
    function getOpenTX() {
      return -(card.offsetWidth / 2); // negative half-width centres it
    }

    function applyTX(tx, scale) {
      card.style.transform = 'translateX(' + tx + 'px) scale(' + scale + ')';
    }

    function formatCount(value, format) {
      if (format === 'comma') return value.toLocaleString() + 'x';
      return String(value) + 'x';
    }

    function animateCounts() {
      if (!countNodes.length) return;
      if (countRafId) cancelAnimationFrame(countRafId);

      var duration = 1500;
      var start = 0;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        countNodes.forEach(function (node) {
          var to = parseInt(node.getAttribute('data-count-to') || '0', 10) || 0;
          var format = node.getAttribute('data-format') || 'plain';
          node.textContent = formatCount(to, format);
        });
        return;
      }

      function step(ts) {
        if (!start) start = ts;
        var elapsed = ts - start;
        var t = Math.min(1, elapsed / duration);
        var eased = 1 - Math.pow(1 - t, 3);

        countNodes.forEach(function (node) {
          var to = parseInt(node.getAttribute('data-count-to') || '0', 10) || 0;
          var format = node.getAttribute('data-format') || 'plain';
          var current = Math.round(to * eased);
          node.textContent = formatCount(current, format);
        });

        if (t < 1) {
          countRafId = requestAnimationFrame(step);
        } else {
          countRafId = 0;
        }
      }

      countNodes.forEach(function (node) {
        node.textContent = '0';
      });
      countRafId = requestAnimationFrame(step);
    }

    function open() {
      isDragging = false;
      isOpen = true;
      card.style.transform = '';
      clearOpenSnapEndListener();
      card.classList.remove('is-closing', 'is-dragging');
      card.classList.add('is-snapping', 'is-open');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      tab.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      animateCounts();
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        requestAnimationFrame(function() {
          if (!isOpen || !card.classList.contains('is-open')) return;
          card.classList.remove('is-snapping');
        });
      } else {
        openSnapEnd = function(e) {
          if (e.target !== card || e.propertyName !== 'transform') return;
          clearOpenSnapEndListener();
          if (!isOpen) return;
          card.classList.remove('is-snapping');
        };
        card.addEventListener('transitionend', openSnapEnd);
      }
      if (mascot) {
        if (mascotTimer) clearTimeout(mascotTimer);
        mascot.classList.remove('is-in');
        mascot.setAttribute('aria-hidden', 'true');
        mascotTimer = setTimeout(function() {
          mascotTimer = 0;
          if (!isOpen || !mascot) return;
          drawer.style.setProperty('--retro-card-h', card.offsetHeight + 'px');
          mascot.classList.add('is-in');
          mascot.setAttribute('aria-hidden', 'false');
        }, 470);
      }
    }

    function close() {
      clearOpenSnapEndListener();
      if (mascotTimer) {
        clearTimeout(mascotTimer);
        mascotTimer = 0;
      }
      if (mascot) {
        mascot.classList.remove('is-in');
        mascot.setAttribute('aria-hidden', 'true');
      }
      isOpen = false;
      card.classList.remove('is-snapping', 'is-open', 'is-dragging');
      card.classList.add('is-closing');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      tab.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      card.addEventListener('transitionend', function onDone() {
        card.removeEventListener('transitionend', onDone);
        card.classList.remove('is-closing');
        card.style.transform = '';
      }, { once: true });
    }

    function onPointerDown(e) {
      if (isOpen) return;
      isDragging = true;
      startX = e.clientX;
      currentTX = getRestTX();
      card.classList.remove('is-snapping', 'is-closing', 'is-open');
      card.classList.add('is-dragging');
      card.style.transform = 'translateX(' + currentTX + 'px) scale(0.92)';
      tab.setPointerCapture(e.pointerId);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var delta = e.clientX - startX; // negative = pulled left
      var restTX = getRestTX();
      var openTX = getOpenTX();
      currentTX = Math.min(restTX, Math.max(openTX, restTX + delta));
      var progress = (restTX - currentTX) / (restTX - openTX);
      var scale = 0.92 + (0.08 * progress);
      applyTX(currentTX, scale);
      // Auto-snap once past 40% of the pull distance
      var pullNeeded = (restTX - openTX) * 0.40;
      if (restTX - currentTX >= pullNeeded) {
        open();
      }
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('is-dragging');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      if (!isOpen && e && e.type === 'pointerup') {
        var delta = typeof e.clientX === 'number' ? Math.abs(e.clientX - startX) : 999;
        if (delta <= 8) {
          open();
          return;
        }
      }
      // If not already opened by auto-snap, snap back.
      card.style.transform = '';
    }

    tab.addEventListener('pointerdown', onPointerDown);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
  })();
