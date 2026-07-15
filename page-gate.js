/**
 * Gate for protected document pages.
 * Requires access-passwords.js (window.DOCUMENT_PASSWORD).
 * Usage: <body data-gate-id="authorization"> ... <script src="access-passwords.js"></script><script src="page-gate.js"></script>
 */
(function () {
  var password = String(window.DOCUMENT_PASSWORD || '').trim();
  var gateId = (document.body && document.body.getAttribute('data-gate-id')) || 'document';
  var sessionKey = 'albab_doc_unlock_' + gateId;

  function alreadyUnlocked() {
    try {
      return sessionStorage.getItem(sessionKey) === '1';
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    try {
      sessionStorage.setItem(sessionKey, '1');
    } catch (e) {}
    var gate = document.getElementById('albabPageGate');
    if (gate) gate.remove();
    document.documentElement.classList.remove('albab-gate-locked');
  }

  function injectStyles() {
    if (document.getElementById('albabGateStyles')) return;
    var style = document.createElement('style');
    style.id = 'albabGateStyles';
    style.textContent =
      'html.albab-gate-locked body > *:not(#albabPageGate){visibility:hidden !important;}' +
      '#albabPageGate{visibility:visible !important;position:fixed;inset:0;z-index:99999;' +
      'display:flex;align-items:center;justify-content:center;padding:24px;' +
      'background:radial-gradient(ellipse 80% 50% at 100% 0%,rgba(26,35,126,.1),transparent 55%),' +
      'linear-gradient(180deg,#f7f8fc 0%,#f3f5f9 100%);' +
      'font-family:"IBM Plex Sans Arabic",Tahoma,Arial,sans-serif;}' +
      '#albabPageGate .gate-card{width:100%;max-width:420px;background:#fff;border:1px solid #d9e0ea;' +
      'border-radius:18px;box-shadow:0 12px 32px rgba(15,28,77,.1);padding:28px 24px;position:relative;overflow:hidden;}' +
      '#albabPageGate .gate-card:before{content:"";position:absolute;inset:0 auto 0 0;width:5px;' +
      'background:linear-gradient(180deg,#1a237e,#c62828);}' +
      '#albabPageGate .gate-kicker{font-size:12px;font-weight:700;letter-spacing:.12em;color:#c62828;' +
      'text-transform:uppercase;margin-bottom:8px;}' +
      '#albabPageGate h1{font-size:1.35rem;color:#0f1c4d;margin:0 0 8px;}' +
      '#albabPageGate p{color:#5c6b7a;line-height:1.65;margin:0 0 16px;font-size:.95rem;}' +
      '#albabPageGate label{display:block;font-weight:600;color:#0f1c4d;margin-bottom:8px;font-size:.92rem;}' +
      '#albabPageGate input{width:100%;padding:12px 14px;border:1px solid #d9e0ea;border-radius:10px;' +
      'font-size:1rem;margin-bottom:12px;box-sizing:border-box;font-family:inherit;}' +
      '#albabPageGate input:focus{outline:none;border-color:#9aa8d4;box-shadow:0 0 0 3px rgba(26,35,126,.12);}' +
      '#albabPageGate .gate-actions{display:flex;flex-wrap:wrap;gap:10px;}' +
      '#albabPageGate button,#albabPageGate a{display:inline-flex;align-items:center;justify-content:center;' +
      'padding:11px 16px;border-radius:10px;font-weight:600;font-size:.92rem;text-decoration:none;cursor:pointer;font-family:inherit;}' +
      '#albabPageGate button{background:#1a237e;color:#fff;border:none;}' +
      '#albabPageGate button:hover{background:#0f1c4d;}' +
      '#albabPageGate a{background:#fff;color:#1a237e;border:1px solid #d9e0ea;}' +
      '#albabPageGate .gate-error{display:none;background:#ffebee;color:#b71c1c;border:1px solid #ef9a9a;' +
      'border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:.9rem;}' +
      '#albabPageGate .gate-error.is-visible{display:block;}' +
      '@media print{#albabPageGate{display:none !important;}}';
    document.head.appendChild(style);
  }

  function showGate() {
    document.documentElement.classList.add('albab-gate-locked');
    injectStyles();

    var titles = {
      authorization: 'نموذج التخويل',
      importReport: 'تقرير متطلبات الاستيراد'
    };

    var gate = document.createElement('div');
    gate.id = 'albabPageGate';
    gate.setAttribute('dir', 'rtl');
    gate.innerHTML =
      '<div class="gate-card">' +
      '<div class="gate-kicker">Protected Document</div>' +
      '<h1>' + (titles[gateId] || 'مستند محمي') + '</h1>' +
      '<p>أدخل كلمة المرور لفتح الصفحة.</p>' +
      '<div class="gate-error" id="albabGateError">كلمة المرور غير صحيحة.</div>' +
      '<form id="albabGateForm">' +
      '<label for="albabGatePassword">كلمة المرور</label>' +
      '<input type="password" id="albabGatePassword" autocomplete="current-password" required>' +
      '<div class="gate-actions">' +
      '<button type="submit">فتح</button>' +
      '<a href="index.html">الصفحة الرئيسية</a>' +
      '</div>' +
      '</form>' +
      '</div>';

    document.body.appendChild(gate);

    document.getElementById('albabGateForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('albabGatePassword');
      var err = document.getElementById('albabGateError');
      if (!password) {
        err.textContent = 'كلمة المرور غير معرّفة في access-passwords.js';
        err.classList.add('is-visible');
        return;
      }
      if (String(input.value || '').trim() === password) {
        unlock();
      } else {
        err.classList.add('is-visible');
        input.value = '';
        input.focus();
      }
    });

    setTimeout(function () {
      var input = document.getElementById('albabGatePassword');
      if (input) input.focus();
    }, 50);
  }

  function start() {
    if (alreadyUnlocked()) {
      document.documentElement.classList.remove('albab-gate-locked');
      return;
    }
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', start);
      return;
    }
    showGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
