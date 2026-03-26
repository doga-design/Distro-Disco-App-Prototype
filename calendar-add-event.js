(function initCalendarAddEvent() {
  var modalRoot = document.getElementById('cal-add-modal-root');
  var modalScrim = document.getElementById('cal-add-modal-scrim');
  var form = document.getElementById('cal-add-event-form');
  var titleInput = document.getElementById('cal-add-title');
  var dateInput = document.getElementById('cal-add-date');
  var coverInput = document.getElementById('cal-add-cover');
  var coverPreviewWrap = document.getElementById('cal-add-cover-preview-wrap');
  var coverPreviewImg = document.getElementById('cal-add-cover-preview');
  var coverRemoveBtn = document.getElementById('cal-add-cover-remove');
  var fieldTitle = document.getElementById('cal-add-field-title');
  var fieldDate = document.getElementById('cal-add-field-date');
  var fieldCover = document.getElementById('cal-add-field-cover');
  var submitBtn = document.getElementById('cal-add-submit-btn');
  var cancelBtn = document.getElementById('cal-add-cancel-btn');
  var modalCloseBtn = document.getElementById('cal-add-modal-close');
  var addEventTrigger = document.getElementById('cal-add-event-btn');
  var chipWrap = document.getElementById('cal-add-category-chips');
  var statusRoot = document.getElementById('cal-add-status-root');
  var statusScrim = document.getElementById('cal-add-status-scrim');
  var statusDoneBtn = document.getElementById('cal-add-status-done-btn');

  if (!modalRoot || !form || !statusRoot) return;

  var coverObjectUrl = null;
  var lastFocusEl = null;
  var closeModalTimer = null;

  function readCssInt(prop, fallback) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
    var n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function readCoverMaxBytes() {
    return readCssInt('--cal-add-cover-max-bytes', 5242880);
  }

  /**
   * Placeholder — swap for real API (fetch) later. Resolves after token delay.
   * @param {object} payload — collected form payload
   * @returns {Promise<{ ok: boolean }>}
   */
  function submitCalendarAddEventRequest(payload) {
    return new Promise(function(resolve) {
      var ms = readCssInt('--cal-add-submit-ms', 1500);
      window.setTimeout(function() {
        resolve({ ok: true, payload: payload });
      }, ms);
    });
  }

  function clearCoverPreview() {
    if (coverObjectUrl) {
      URL.revokeObjectURL(coverObjectUrl);
      coverObjectUrl = null;
    }
    if (coverPreviewImg) coverPreviewImg.removeAttribute('src');
    if (coverPreviewWrap) coverPreviewWrap.classList.remove('is-visible');
    if (coverInput) coverInput.value = '';
    if (fieldCover) fieldCover.classList.remove('has-error');
  }

  function resetForm() {
    form.reset();
    clearCoverPreview();
    if (chipWrap) {
      chipWrap.querySelectorAll('.cal-add-chip').forEach(function(c) {
        c.classList.remove('is-active');
      });
    }
    clearFieldErrors();
  }

  function clearFieldErrors() {
    if (fieldTitle) fieldTitle.classList.remove('has-error');
    if (fieldDate) fieldDate.classList.remove('has-error');
    if (titleInput) titleInput.removeAttribute('aria-invalid');
    if (dateInput) dateInput.removeAttribute('aria-invalid');
  }

  function validateRequired() {
    var ok = true;
    clearFieldErrors();
    if (!titleInput || !titleInput.value.trim()) {
      ok = false;
      if (fieldTitle) fieldTitle.classList.add('has-error');
      if (titleInput) titleInput.setAttribute('aria-invalid', 'true');
    }
    if (!dateInput || !dateInput.value) {
      ok = false;
      if (fieldDate) fieldDate.classList.add('has-error');
      if (dateInput) dateInput.setAttribute('aria-invalid', 'true');
    }
    return ok;
  }

  function playSubmitBtnShake() {
    if (!submitBtn) return;
    submitBtn.classList.remove('cal-add-submit-shake');
    submitBtn.offsetWidth;
    submitBtn.classList.add('cal-add-submit-shake');
    function onAnimEnd(e) {
      if (e.target !== submitBtn) return;
      submitBtn.removeEventListener('animationend', onAnimEnd);
      submitBtn.classList.remove('cal-add-submit-shake');
    }
    submitBtn.addEventListener('animationend', onAnimEnd);
  }

  function scrollFirstCalAddFieldErrorIntoView() {
    var firstErr = form && form.querySelector('.cal-add-field.has-error');
    if (!firstErr || !firstErr.scrollIntoView) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    firstErr.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }

  function collectPayload() {
    var timeStart = document.getElementById('cal-add-time-start');
    var timeEnd = document.getElementById('cal-add-time-end');
    var locationEl = document.getElementById('cal-add-location');
    var descEl = document.getElementById('cal-add-description');
    var activeChip = chipWrap && chipWrap.querySelector('.cal-add-chip.is-active');
    var file = coverInput && coverInput.files && coverInput.files[0] ? coverInput.files[0] : null;
    return {
      title: titleInput ? titleInput.value.trim() : '',
      coverFile: file,
      date: dateInput ? dateInput.value : '',
      startTime: timeStart ? timeStart.value : '',
      endTime: timeEnd ? timeEnd.value : '',
      location: locationEl ? locationEl.value.trim() : '',
      category: activeChip ? (activeChip.getAttribute('data-cal-category') || '') : '',
      description: descEl ? descEl.value.trim() : ''
    };
  }

  function openCalAddEventModal(prefillISODate) {
    resetForm();
    var iso = prefillISODate;
    if (iso === undefined && typeof window.__ddGetCalendarAddEventPrefillISO === 'function') {
      iso = window.__ddGetCalendarAddEventPrefillISO();
    }
    if (dateInput && iso) dateInput.value = iso;

    lastFocusEl = document.activeElement;
    if (closeModalTimer) {
      clearTimeout(closeModalTimer);
      closeModalTimer = null;
    }
    modalRoot.classList.remove('is-closing');
    modalRoot.classList.add('is-open');
    modalRoot.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function() {
      if (titleInput) titleInput.focus();
    });
  }

  function closeCalAddEventModal() {
    if (!modalRoot.classList.contains('is-open')) return;
    modalRoot.classList.remove('is-open');
    modalRoot.classList.add('is-closing');
    if (closeModalTimer) clearTimeout(closeModalTimer);
    closeModalTimer = setTimeout(function() {
      closeModalTimer = null;
      modalRoot.classList.remove('is-closing');
      modalRoot.setAttribute('aria-hidden', 'true');
      resetForm();
    }, 320);
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
      try {
        lastFocusEl.focus();
      } catch (e) { /* ignore */ }
    }
  }

  function openStatusOverlay() {
    statusRoot.classList.remove('cal-add-status-phase-done');
    statusRoot.classList.add('is-open');
    statusRoot.setAttribute('aria-hidden', 'false');
  }

  function closeStatusOverlay() {
    statusRoot.classList.remove('is-open', 'cal-add-status-phase-done');
    statusRoot.setAttribute('aria-hidden', 'true');
  }

  function runSubmitFlow() {
    if (!validateRequired()) {
      playSubmitBtnShake();
      scrollFirstCalAddFieldErrorIntoView();
      return;
    }

    var payload = collectPayload();

    closeCalAddEventModal();
    openStatusOverlay();

    submitCalendarAddEventRequest(payload).then(function() {
      statusRoot.classList.add('cal-add-status-phase-done');
    });
  }

  if (addEventTrigger) {
    addEventTrigger.addEventListener('click', function() {
      openCalAddEventModal();
    });
  }

  window.__ddOpenCalAddEventModal = openCalAddEventModal;

  if (modalScrim) {
    modalScrim.addEventListener('click', function() {
      closeCalAddEventModal();
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      closeCalAddEventModal();
    });
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function() {
      closeCalAddEventModal();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      runSubmitFlow();
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    runSubmitFlow();
  });

  if (titleInput) {
    titleInput.addEventListener('input', function() {
      if (fieldTitle && fieldTitle.classList.contains('has-error')) {
        fieldTitle.classList.remove('has-error');
        titleInput.removeAttribute('aria-invalid');
      }
    });
  }
  if (dateInput) {
    function clearDateFieldError() {
      if (fieldDate && fieldDate.classList.contains('has-error') && dateInput.value) {
        fieldDate.classList.remove('has-error');
        dateInput.removeAttribute('aria-invalid');
      }
    }
    dateInput.addEventListener('change', clearDateFieldError);
    dateInput.addEventListener('input', clearDateFieldError);
  }

  if (coverInput) {
    coverInput.addEventListener('change', function() {
      if (fieldCover) fieldCover.classList.remove('has-error');
      var f = coverInput.files && coverInput.files[0];
      if (!f) {
        clearCoverPreview();
        return;
      }
      var maxBytes = readCoverMaxBytes();
      var isPng = f.type === 'image/png';
      var isJpeg = f.type === 'image/jpeg' || f.type === 'image/jpg';
      if (!isPng && !isJpeg || f.size > maxBytes) {
        if (fieldCover) fieldCover.classList.add('has-error');
        coverInput.value = '';
        clearCoverPreview();
        return;
      }
      if (coverObjectUrl) URL.revokeObjectURL(coverObjectUrl);
      coverObjectUrl = URL.createObjectURL(f);
      if (coverPreviewImg) coverPreviewImg.src = coverObjectUrl;
      if (coverPreviewWrap) coverPreviewWrap.classList.add('is-visible');
    });
  }

  if (coverRemoveBtn) {
    coverRemoveBtn.addEventListener('click', function() {
      clearCoverPreview();
    });
  }

  if (chipWrap) {
    chipWrap.addEventListener('click', function(e) {
      var chip = e.target.closest('.cal-add-chip');
      if (!chip || !chipWrap.contains(chip)) return;
      var wasActive = chip.classList.contains('is-active');
      chipWrap.querySelectorAll('.cal-add-chip').forEach(function(c) {
        c.classList.remove('is-active');
      });
      if (!wasActive) chip.classList.add('is-active');
    });
  }

  if (statusDoneBtn) {
    statusDoneBtn.addEventListener('click', function() {
      closeStatusOverlay();
    });
  }

  if (statusScrim) {
    statusScrim.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (modalRoot.classList.contains('is-open')) {
      closeCalAddEventModal();
    }
  });
})();
