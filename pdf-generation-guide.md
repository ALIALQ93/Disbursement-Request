# إنشاء ملف PDF طلب صرف (نسخة منفصلة)

يتم إنشاء **ملف PDF فعلي** باسم `Disbursement_Request.pdf` في نفس المجلد.

## المتطلبات

- تثبيت **Node.js** من [nodejs.org](https://nodejs.org) إن لم يكن مثبتاً.

## الخطوات

1. افتح **موجه الأوامر** أو **PowerShell**.
2. انتقل إلى مجلد المشروع:
   ```
   cd "C:\path\to\Disbursement-Request"
   ```
3. ثبّت المكتبة (مرة واحدة فقط):
   ```
   npm install
   ```
4. شغّل السكربت لإنشاء ملف PDF:
   ```
   npm run create-pdf
   ```
   أو:
   ```
   node create-pdf-request.js
   ```
5. سيظهر ملف PDF في نفس المجلد.

## الملفات المستخدمة

| الملف | الوظيفة |
|-------|---------|
| `create-pdf-request.js` | السكربت الذي ينشئ ملف PDF |
| `package.json` | تعريف المشروع وحزمة pdf-lib |
| `create-pdf.html` | إنشاء PDF من المتصفح (بدون Node.js) |

## ملاحظة

- الملف PDF الناتج **قابل للتحرير**: يمكن فتحه في Adobe Reader أو أي قارئ PDF وملء الحقول.
- لإعادة إنشاء نسخة جديدة، شغّل الأمر مرة أخرى: `npm run create-pdf`.

## الاستخدام عبر GitHub Pages

للنماذج التفاعلية والطباعة من المتصفح، استخدم:

**https://alialq93.github.io/Disbursement-Request/**
