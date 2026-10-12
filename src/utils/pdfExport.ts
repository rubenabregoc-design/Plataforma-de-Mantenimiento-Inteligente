import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { toast } from 'react-hot-toast';

/**
 * Convierte un elemento HTML o un string HTML en un archivo PDF descargable.
 * Renderiza dentro de un iframe aislado para evitar conflictos con colores oklch() de Tailwind v4
 * y garantizar letras negras nítidas sobre fondo blanco tanto en Android como en Web.
 */
export async function downloadHtmlAsPdf(htmlString: string, fileName: string = 'documento.pdf'): Promise<void> {
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const toastId = toast.loading('Generando documento PDF oficial...');

  let iframe: HTMLIFrameElement | null = null;

  try {
    // 1. Crear un iframe oculto aislado de las hojas de estilo globales (evita error oklch en html2canvas)
    iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '794px'; // Ancho A4 exacto a 96 DPI
    iframe.style.height = '100px';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('No se pudo inicializar el contenedor de impresión');
    }

    // Inyectar reglas base de alto contraste (letras negras sobre blanco) + el HTML del reporte
    const highContrastOverride = `
      <style>
        html, body {
          background-color: #ffffff !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 794px !important;
          height: auto !important;
          min-height: 0 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>
    `;

    iframeDoc.open();
    if (htmlString.includes('</head>')) {
      iframeDoc.write(htmlString.replace('</head>', `${highContrastOverride}</head>`));
    } else {
      iframeDoc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">${highContrastOverride}</head><body>${htmlString}</body></html>`);
    }
    iframeDoc.close();

    // Esperar a que las imágenes y SVG del reporte carguen
    await new Promise((resolve) => setTimeout(resolve, 350));

    const targetBody = iframeDoc.body;
    const contentHeight = Math.max(targetBody.scrollHeight, targetBody.offsetHeight, 400);
    iframe.style.height = `${contentHeight}px`;

    // 2. Renderizar a Canvas con html2canvas dentro del documento aislado del iframe
    const canvas = await html2canvas(targetBody, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: contentHeight,
      windowWidth: 794,
      windowHeight: contentHeight,
    });

    document.body.removeChild(iframe);
    iframe = null;

    // 3. Crear el documento PDF con jsPDF (evitando páginas en blanco)
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

    // Si cabe en 1 página (o se pasa por un pequeño margen inferior), ajustarlo a 1 sola página sin crear hoja vacía
    if (imgHeightMm <= pdfPageHeight * 1.15) {
      const renderHeight = Math.min(imgHeightMm, pdfPageHeight);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, renderHeight);
    } else {
      let heightLeft = imgHeightMm;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightMm);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 25) {
        position = heightLeft - imgHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightMm);
        heightLeft -= pdfPageHeight;
      }
    }

    // 4. Manejo según plataforma (Android Nativo vs Móvil Web vs Web Desktop)
    if (Capacitor.isNativePlatform()) {
      const pdfDataUri = pdf.output('datauristring');
      const pdfBase64 = pdfDataUri.includes(',') ? pdfDataUri.split(',')[1] : pdfDataUri;

      // Guardar en Directory.Cache (no requiere permisos de almacenamiento en Android 10-14 y es compatible con FileProvider)
      const savedFile = await Filesystem.writeFile({
        path: safeName,
        data: pdfBase64,
        directory: Directory.Cache,
        recursive: true
      });

      // Intentar guardar también en Documentos si el dispositivo lo permite
      try {
        await Filesystem.writeFile({
          path: safeName,
          data: pdfBase64,
          directory: Directory.Documents,
          recursive: true
        });
      } catch (_) {
        // Ignorar si Android Scoped Storage restringe Documents
      }

      toast.success('Informe PDF listo', { id: toastId });

      // Abrir diálogo nativo de Android para guardar/ver/compartir el PDF
      await Share.share({
        title: safeName,
        text: `Informe oficial MantechPro: ${safeName}`,
        url: savedFile.uri,
        dialogTitle: 'Guardar o abrir informe PDF'
      });
    } else {
      // Navegador Web (PC o Móvil): descarga directa del archivo .pdf
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      toast.success('Informe PDF descargado con éxito', { id: toastId });
    }
  } catch (error) {
    console.error('Error generando PDF:', error);
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    toast.error('No se pudo generar el PDF. Intente nuevamente.', { id: toastId });
  }
}

/**
 * Descarga o comparte un libro de Excel (XLSX) tanto en Web como en Android Nativo (Capacitor).
 */
export async function downloadWorkbookAsExcel(wb: XLSX.WorkBook, fileName: string = 'reporte.xlsx'): Promise<void> {
  const safeName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  const toastId = toast.loading('Generando archivo Excel...');

  try {
    if (Capacitor.isNativePlatform()) {
      const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

      const savedFile = await Filesystem.writeFile({
        path: safeName,
        data: excelBase64,
        directory: Directory.Cache,
        recursive: true
      });

      try {
        await Filesystem.writeFile({
          path: safeName,
          data: excelBase64,
          directory: Directory.Documents,
          recursive: true
        });
      } catch (_) {}

      toast.success('Archivo Excel listo', { id: toastId });

      await Share.share({
        title: safeName,
        text: `Reporte Excel MantechPro: ${safeName}`,
        url: savedFile.uri,
        dialogTitle: 'Guardar o compartir Excel'
      });
    } else {
      XLSX.writeFile(wb, safeName);
      toast.success('Archivo Excel descargado', { id: toastId });
    }
  } catch (error) {
    console.error('Error exportando Excel:', error);
    toast.error('Error al exportar el archivo Excel', { id: toastId });
  }
}
