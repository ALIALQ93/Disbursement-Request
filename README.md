# AL ALBAB COMPANY — Disbursement & Authorization Forms

نماذج صرف وتخويل قابلة للتحرير، جاهزة للطباعة وحفظ PDF من المتصفح.

## الموقع المباشر (GitHub Pages)

بعد تفعيل GitHub Pages، افتح:

**https://alialq93.github.io/Disbursement-Request/**

## الملفات الرئيسية

| الملف | الوصف |
|-------|--------|
| [`index.html`](index.html) | الصفحة الرئيسية |
| [`authorization.html`](authorization.html) | نموذج التخويل |
| [`disbursement-request.html`](disbursement-request.html) | طلب صرف |
| [`create-pdf.html`](create-pdf.html) | إنشاء PDF طلب صرف من المتصفح |
| [`organize-logos.html`](organize-logos.html) | تنزيل وتنظيم شعارات الشهادات |

## طريقة الاستخدام

1. افتح [`authorization.html`](authorization.html) أو [`disbursement-request.html`](disbursement-request.html)
2. املأ الحقول القابلة للتحرير
3. اضغط **Ctrl+P** أو زر الطباعة
4. اختر **حفظ كـ PDF** كطابعة
5. احفظ الملف

## الشعارات

الشعارات في مجلد [`logos/`](logos/). إذا لم تظهر:

- افتح [`organize-logos.html`](organize-logos.html)
- أو أضف الشعارات يدوياً في مجلد `logos`

## إنشاء PDF عبر Node.js (محلي)

راجع [`pdf-generation-guide.md`](pdf-generation-guide.md).

```bash
npm install
npm run create-pdf
```

## تفعيل GitHub Pages

1. ادخل إلى **Settings → Pages** في المستودع
2. ضمن **Build and deployment**، اختر **Source: GitHub Actions**
3. عند كل `push` إلى `main`، يُنشر الموقع تلقائياً عبر workflow `.github/workflows/pages.yml`

## المميزات

- يطابق التصميم الأصلي
- حقول قابلة للتحرير مباشرة
- حفظ تلقائي للبيانات في المتصفح
- جاهز للطباعة وحفظ PDF
- متوافق مع جميع المتصفحات

---

**Repository:** https://github.com/ALIALQ93/Disbursement-Request
