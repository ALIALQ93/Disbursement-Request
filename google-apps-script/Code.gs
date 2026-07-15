/**
 * AL ALBAB — Disbursement Request → Google Sheets
 *
 * Setup:
 * 1. Open the sheet: https://docs.google.com/spreadsheets/d/1hewjE24Lhxvis6yJVKWK_ZRsWzajHMzlXQJ9jT9LiBk
 * 2. Extensions → Apps Script → paste this file → Save
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL into GOOGLE_SCRIPT_URL in disbursement-request.html
 * 5. Run ensureHeaders() once from the editor (Run) to create column headers
 */

var SPREADSHEET_ID = '1hewjE24Lhxvis6yJVKWK_ZRsWzajHMzlXQJ9jT9LiBk';
var SHEET_NAME = 'Requests';

/**
 * Must match passwords in access-passwords.js
 * After changing: Save → Deploy → Manage deployments → Edit → New version
 */
var ACCESS_PASSWORDS = [
  { name: 'الإدارة', password: 'AlbabAdmin2026' },
  { name: 'الحسابات', password: 'AlbabAccounts2026' }
];

var HEADERS = [
  'Timestamp',
  'Serial',
  'Date',
  'Recipient',
  'Subject',
  'Intro',
  'Items',
  'Totals',
  'Notes',
  'Submitted By',
  'Accounts',
  'Administration',
  'Payment Authorization',
  'Language'
];

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var body = {};

    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = {};
      }
    }

    var action = String(params.action || body.action || '').trim();
    var password = String(params.password || body.password || '').trim();

    if (action === 'nextSerial') {
      return jsonOut({ ok: true, serial: getNextSerial() });
    }

    if (action === 'checkSerial') {
      var checkSerial = String(params.serial || body.serial || '').trim();
      var exists = serialExists(checkSerial);
      return jsonOut({ ok: true, serial: checkSerial, exists: exists });
    }

    if (action === 'verifyAccess') {
      var access = findAccess_(password);
      if (!access) {
        return jsonOut({ ok: false, error: 'UNAUTHORIZED', message: 'Invalid password' });
      }
      return jsonOut({ ok: true, name: access.name || 'Authorized' });
    }

    if (action === 'list') {
      if (!findAccess_(password)) {
        return jsonOut({ ok: false, error: 'UNAUTHORIZED', message: 'Invalid password' });
      }
      return jsonOut({ ok: true, rows: listRequests(Number(params.limit || body.limit || 50)) });
    }

    if (action === 'register') {
      var payload = body.data || body;
      if (typeof payload === 'string') {
        payload = JSON.parse(payload);
      }
      return jsonOut(registerRequest(payload));
    }

    return jsonOut({ ok: false, error: 'Unknown action. Use nextSerial, checkSerial, verifyAccess, register, or list.' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function findAccess_(password) {
  var value = String(password || '').trim();
  if (!value) return null;
  for (var i = 0; i < ACCESS_PASSWORDS.length; i++) {
    if (String(ACCESS_PASSWORDS[i].password || '') === value) {
      return ACCESS_PASSWORDS[i];
    }
  }
  return null;
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  ensureHeadersOnSheet_(sheet);
  return sheet;
}

function ensureHeaders() {
  getSheet_();
}

function ensureHeadersOnSheet_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return;
  }
  var first = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (!first[0] || String(first[0]).trim() === '') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function getSerialColumnValues_() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 2, lastRow, 2).getValues().map(function (r) {
    return String(r[0] || '').trim();
  }).filter(Boolean);
}

function serialExists(serial) {
  var target = String(serial || '').trim();
  if (!target) return false;
  var values = getSerialColumnValues_();
  for (var i = 0; i < values.length; i++) {
    if (values[i] === target) return true;
  }
  return false;
}

/**
 * Unique daily serial: YY-MM-DD-### (e.g. 26-07-15-001)
 */
function getNextSerial() {
  var now = new Date();
  var tz = Session.getScriptTimeZone() || 'Asia/Baghdad';
  var prefix = Utilities.formatDate(now, tz, 'yy-MM-dd');
  var values = getSerialColumnValues_();
  var maxSeq = 0;
  var re = new RegExp('^' + prefix.replace(/-/g, '\\-') + '-(\\d{3,})$');

  for (var i = 0; i < values.length; i++) {
    var m = String(values[i]).match(re);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n > maxSeq) maxSeq = n;
    }
  }

  var next = maxSeq + 1;
  var serial = prefix + '-' + ('000' + next).slice(-3);
  while (serialExists(serial)) {
    next += 1;
    serial = prefix + '-' + ('000' + next).slice(-3);
  }
  return serial;
}

function registerRequest(data) {
  data = data || {};
  var serial = String(data.serial || '').trim();
  if (!serial) {
    serial = getNextSerial();
  }

  if (serialExists(serial)) {
    return {
      ok: false,
      error: 'DUPLICATE_SERIAL',
      message: 'Serial already exists: ' + serial,
      serial: serial,
      suggestedSerial: getNextSerial()
    };
  }

  var sheet = getSheet_();
  var itemsText = '';
  if (Object.prototype.toString.call(data.items) === '[object Array]') {
    itemsText = data.items.map(function (item, idx) {
      return (idx + 1) + ') ' + (item.desc || '—') + ' | ' + (item.currency || '') + ' | ' + (item.total || '');
    }).join('\n');
  } else {
    itemsText = String(data.items || '');
  }

  var totalsText = '';
  if (data.totals && typeof data.totals === 'object') {
    totalsText = Object.keys(data.totals).map(function (cur) {
      return cur + ': ' + data.totals[cur];
    }).join(' | ');
  } else {
    totalsText = String(data.totals || '');
  }

  sheet.appendRow([
    new Date(),
    serial,
    data.date || '',
    data.recipient || '',
    data.subject || '',
    data.intro || '',
    itemsText,
    totalsText,
    data.notes || '',
    data.sigApplicant || '',
    data.sigAccounts || '',
    data.sigManagement || '',
    data.sigDisbursementOrder || '',
    data.language || ''
  ]);

  return { ok: true, serial: serial, message: 'Registered' };
}

function listRequests(limit) {
  limit = limit || 50;
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var start = Math.max(2, lastRow - limit + 1);
  var values = sheet.getRange(start, 1, lastRow, HEADERS.length).getValues();
  var rows = values.map(function (r) {
    return {
      timestamp: r[0],
      serial: r[1],
      date: r[2],
      recipient: r[3],
      subject: r[4],
      totals: r[7],
      notes: r[8]
    };
  });
  return rows.reverse();
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
