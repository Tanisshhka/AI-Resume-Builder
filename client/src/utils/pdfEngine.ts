import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (
  elementId: string,
  filename: string = 'resume.pdf',
  onProgress?: (status: 'loading' | 'capturing' | 'generating' | 'done' | 'error') => void
): Promise<void> => {
  onProgress?.('loading');

  const element = document.getElementById(elementId);
  if (!element) {
    alert('Resume preview not found.');
    onProgress?.('error');
    return;
  }

  // Collect all stylesheets from the page
  let cssText = '';
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        cssText += rule.cssText + '\n';
      }
    } catch (e) { /* skip cross-origin */ }
  }

  // Clone and strip transforms
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('*').forEach((el) => {
    const s = (el as HTMLElement).style;
    s.transform = 'none';
    s.animation = 'none';
    s.transition = 'none';
  });
  clone.style.cssText = 'transform:none!important;width:794px;min-height:auto;margin:0;padding:40px 36px;box-shadow:none;border-radius:0;background:#fff;box-sizing:border-box;';

  const htmlContent = clone.outerHTML;
  const className = clone.className;

  const fullHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Fira+Code:wght@300;400;500;600;700&family=Lora:wght@400;500;600;700&family=Source+Code+Pro:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
<style>
${cssText}
@page { margin: 0; size: A4; }
html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  onProgress?.('capturing');

  // Open a hidden iframe for clean rendering
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  let iframeRemoved = false;

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    iframeRemoved = true;
    alert('PDF export failed. Please try again.');
    onProgress?.('error');
    return;
  }

  iframeDoc.open();
  iframeDoc.write(fullHTML);
  iframeDoc.close();

  // Wait for fonts and rendering
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    onProgress?.('capturing');

    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });

    document.body.removeChild(iframe);
    iframeRemoved = true;

    onProgress?.('generating');

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfPageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfPageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfPageHeight;
    }

    const safeName = (filename.endsWith('.pdf') ? filename : `${filename}.pdf`).replace(/[^\w\-_. ]/g, '_');
    pdf.save(safeName);
    onProgress?.('done');

  } catch (error) {
    console.error('PDF capture failed:', error);
    if (!iframeRemoved && document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }

    // Final fallback: browser print dialog
    onProgress?.('error');
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(fullHTML);
      printWin.document.close();
      setTimeout(() => { printWin.print(); }, 1000);
    }
  }
};
