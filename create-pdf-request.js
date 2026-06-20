/**
 * إنشاء ملف PDF طلب صرف قابل للتحرير
 * التشغيل: node create-pdf-request.js
 * أو: npm run create-pdf
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts } = require('pdf-lib');

async function createFillablePDF() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const form = pdfDoc.getForm();

    const margin = 45;
    const lineH = 24;
    let y = 841.89 - margin;

    function drawLabel(text, x, size) {
        page.drawText(text, { x: x, y: y - 14, size: size || 11, font: font });
    }
    function nextLine() { y -= lineH; }

    // Header
    page.drawText('AL ALBAB COMPANY', { x: margin, y: y, size: 16, font: fontBold });
    nextLine();
    page.drawText('FOR GENERAL CONTRACTING LTD, IRAQ', { x: margin, y: y, size: 9, font: font });
    nextLine();
    page.drawText('Disbursement Request / طلب صرف', { x: margin, y: y, size: 12, font: font });
    nextLine(); nextLine();

    // Serial Number
    drawLabel('Serial Number / الرقم التسلسلي:', margin);
    const fSerial = form.createTextField('serialNumber');
    fSerial.addToPage(page, { x: 320, y: y - 18, width: 220, height: 18, font: font });
    nextLine();

    // Date
    drawLabel('Date / التاريخ:', margin);
    const fDate = form.createTextField('date');
    fDate.addToPage(page, { x: 320, y: y - 18, width: 220, height: 18, font: font });
    nextLine();

    // To
    drawLabel('To / الى:', margin);
    const fTo = form.createTextField('bankName');
    fTo.setText('Accounts Department');
    fTo.addToPage(page, { x: 320, y: y - 18, width: 220, height: 18, font: font });
    nextLine();

    // Subject
    drawLabel('Subject / الموضوع:', margin);
    const fSubject = form.createTextField('subjectType');
    fSubject.setText('Disbursement Request');
    fSubject.addToPage(page, { x: 320, y: y - 18, width: 220, height: 18, font: font });
    nextLine(); nextLine();

    // Body
    page.drawText('We request disbursement of an amount of (', { x: margin, y: y, size: 10, font: font });
    nextLine();

    drawLabel('Amount / المبلغ:', margin);
    const fAmount = form.createTextField('amount');
    fAmount.addToPage(page, { x: 320, y: y - 18, width: 120, height: 18, font: font });

    const dropCurrency = form.createDropdown('currency');
    dropCurrency.addOptions(['$', 'IQD']);
    dropCurrency.select(0);
    dropCurrency.addToPage(page, { x: 448, y: y - 18, width: 55, height: 18, font: font });
    nextLine();

    drawLabel('Amount in words / المبلغ بالحروف:', margin);
    const fAmountWords = form.createTextField('amountWords');
    fAmountWords.addToPage(page, { x: margin, y: y - 18, width: 515, height: 18, font: font });
    nextLine();

    drawLabel('Beneficiary / المستفيد:', margin);
    const fBeneficiary = form.createTextField('beneficiaryName');
    fBeneficiary.addToPage(page, { x: 320, y: y - 18, width: 220, height: 18, font: font });
    nextLine();

    drawLabel('Reason / سبب الصرف:', margin);
    const fReason = form.createTextField('reason');
    fReason.enableMultiline();
    fReason.addToPage(page, { x: margin, y: y - 42, width: 515, height: 40, font: font });
    y -= 50;
    nextLine();

    page.drawText('Best Regards,', { x: margin, y: y, size: 11, font: font });
    nextLine(); nextLine();

    const sigY = y;
    const sigW = 140;
    const sigGap = 30;

    page.drawText('Accounts', { x: margin, y: sigY, size: 10, font: fontBold });
    const fSig1 = form.createTextField('sigAccounts');
    fSig1.addToPage(page, { x: margin, y: sigY - 22, width: sigW, height: 18, font: font });

    page.drawText('Supervising Engineer', { x: margin + sigW + sigGap, y: sigY, size: 10, font: fontBold });
    const fSig2 = form.createTextField('sigEngineer');
    fSig2.addToPage(page, { x: margin + sigW + sigGap, y: sigY - 22, width: sigW, height: 18, font: font });

    page.drawText('Project Manager', { x: margin + (sigW + sigGap) * 2, y: sigY, size: 10, font: fontBold });
    const fSig3 = form.createTextField('sigProjectManager');
    fSig3.addToPage(page, { x: margin + (sigW + sigGap) * 2, y: sigY - 22, width: sigW, height: 18, font: font });

    // Footer
    y = 60;
    page.drawLine({
        start: { x: margin, y: y },
        end: { x: 550, y: y },
        thickness: 0.5,
        color: { r: 0, g: 0, b: 0 }
    });
    y -= 15;
    page.drawText('AL-Karada Dakhel, Baghdad, Iraq.', { x: margin, y: y, size: 8, font: font });
    y -= 10;
    page.drawText('Email: info@albab.com.iq / Website: www.albab.com.iq', { x: margin, y: y, size: 8, font: font });
    y -= 10;
    page.drawText('Tel: +964 7816 896 331 / +964 7834 978 803', { x: margin, y: y, size: 8, font: font });

    form.updateFieldAppearances(font);

    const pdfBytes = await pdfDoc.save();
    const outPath = path.join(__dirname, 'Disbursement_Request.pdf');
    fs.writeFileSync(outPath, pdfBytes);
    return outPath;
}

createFillablePDF()
    .then((outPath) => {
        console.log('تم إنشاء الملف بنجاح:', outPath);
    })
    .catch((err) => {
        console.error('خطأ:', err);
        process.exit(1);
    });
