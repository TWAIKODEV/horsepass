import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Tipos para los documentos
export interface DocumentData {
  title: string;
  content: any;
  type: 'caballo' | 'explotacion' | 'pasaporte' | 'certificado' | 'guia';
}

// Función para generar vista preliminar
export const generatePreview = (data: DocumentData) => {
  return new Promise((resolve) => {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!previewWindow) {
      alert('Por favor, permite las ventanas emergentes para ver la vista preliminar');
      resolve(null);
      return;
    }

    const htmlContent = generateHTMLContent(data);
    
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vista Preliminar - ${data.title}</title>
          <style>
            ${getPreviewStyles()}
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
            <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Imprimir</button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
          </div>
        </body>
      </html>
    `);
    
    previewWindow.document.close();
    resolve(previewWindow);
  });
};

// Función para descargar PDF
export const downloadPDF = async (data: DocumentData) => {
  try {
    // Crear elemento temporal para renderizar
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateHTMLContent(data);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.background = 'white';
    tempDiv.style.padding = '20px';
    
    // Agregar estilos
    const styleSheet = document.createElement('style');
    styleSheet.textContent = getPreviewStyles();
    tempDiv.appendChild(styleSheet);
    
    document.body.appendChild(tempDiv);

    // Generar canvas del contenido
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Crear PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = 190; // A4 width minus margins
    const pageHeight = 295; // A4 height minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;

    // Agregar imagen al PDF
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Agregar páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Limpiar elemento temporal
    document.body.removeChild(tempDiv);

    // Descargar PDF
    const fileName = `${data.type}_${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};

// Función para imprimir directamente
export const printDocument = (data: DocumentData) => {
  // Crear elemento temporal para generar contenido de impresión
  const printContent = document.createElement('div');
  printContent.innerHTML = generateHTMLContent(data);
  
  // Crear ventana de impresión
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para imprimir');
    return;
  }

  // Escribir contenido específico para impresión
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Imprimir - ${data.title}</title>
        <meta charset="utf-8">
        <style>
          ${getPrintOnlyStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          ${generateHTMLContent(data)}
        </div>
        <script>
          window.onload = function() {
            // Esperar a que se carguen todos los estilos
            setTimeout(function() {
              window.print();
              // Cerrar ventana después de imprimir o cancelar
              window.onafterprint = function() {
                window.close();
              };
              // Fallback para cerrar si el usuario cancela
              setTimeout(function() {
                if (!window.closed) {
                  window.close();
                }
              }, 1000);
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Generar contenido HTML según el tipo de documento
const generateHTMLContent = (data: DocumentData): string => {
  const { type, content, title } = data;
  
  switch (type) {
    case 'caballo':
      return generateHorseHTML(content, title);
    case 'explotacion':
      return generateFarmHTML(content, title);
    case 'pasaporte':
      return generatePassportHTML(content, title);
    case 'certificado':
      return generateCertificateHTML(content, title);
    case 'guia':
      return generateGuideHTML(content, title);
    default:
      return generateGenericHTML(content, title);
  }
};

// Template para caballos
const generateHorseHTML = (horse: any, title: string): string => {
  return `
    <div class="document">
      <div class="header">
        <div class="logo">
          <h1>🐎 HorsePass</h1>
          <p>Sistema de Gestión Equina</p>
        </div>
        <div class="doc-info">
          <h2>${title}</h2>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>Información General</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre:</label>
              <span>${horse.nombre || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>UELN:</label>
              <span>${horse.ueln || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Microchip:</label>
              <span>${horse.microchip || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Raza:</label>
              <span>${horse.raza || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Sexo:</label>
              <span>${horse.sexo || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Fecha de Nacimiento:</label>
              <span>${horse.fechaNacimiento || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Capa:</label>
              <span>${horse.capa || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>País de Origen:</label>
              <span>${horse.paisOrigen || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Estado:</label>
              <span class="${horse.activo ? 'status-active' : 'status-inactive'}">
                ${horse.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Documento generado por HorsePass - Sistema de Gestión Equina</p>
        <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  `;
};

// Template para explotaciones
const generateFarmHTML = (farm: any, title: string): string => {
  return `
    <div class="document">
      <div class="header">
        <div class="logo">
          <h1>🐎 HorsePass</h1>
          <p>Sistema de Gestión Equina</p>
        </div>
        <div class="doc-info">
          <h2>${title}</h2>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>Información de la Explotación</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre:</label>
              <span>${farm.nombre || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Código REGA:</label>
              <span>${farm.codigoRega || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Dirección:</label>
              <span>${farm.direccion || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Municipio:</label>
              <span>${farm.municipio || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Provincia:</label>
              <span>${farm.provincia || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Código Postal:</label>
              <span>${farm.codigoPostal || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Teléfono:</label>
              <span>${farm.telefono || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>${farm.email || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Tipo de Explotación:</label>
              <span>${farm.tipoExplotacion || 'N/A'}</span>
            </div>
            <div class="info-item">
              <label>Capacidad Máxima:</label>
              <span>${farm.capacidadMaxima || 'N/A'} caballos</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Documento generado por HorsePass - Sistema de Gestión Equina</p>
        <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  `;
};

// Template genérico para otros documentos
const generatePassportHTML = (document: any, title: string): string => {
  return generateGenericHTML(document, title);
};

const generateCertificateHTML = (document: any, title: string): string => {
  return generateGenericHTML(document, title);
};

const generateGuideHTML = (document: any, title: string): string => {
  return generateGenericHTML(document, title);
};

const generateGenericHTML = (content: any, title: string): string => {
  const fields = Object.entries(content).map(([key, value]) => `
    <div class="info-item">
      <label>${formatFieldName(key)}:</label>
      <span>${value || 'N/A'}</span>
    </div>
  `).join('');

  return `
    <div class="document">
      <div class="header">
        <div class="logo">
          <h1>🐎 HorsePass</h1>
          <p>Sistema de Gestión Equina</p>
        </div>
        <div class="doc-info">
          <h2>${title}</h2>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>Información del Documento</h3>
          <div class="info-grid">
            ${fields}
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Documento generado por HorsePass - Sistema de Gestión Equina</p>
        <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  `;
};

// Formatear nombres de campos
const formatFieldName = (fieldName: string): string => {
  const fieldMappings: Record<string, string> = {
    'id': 'ID',
    'nombre': 'Nombre',
    'ueln': 'UELN',
    'microchip': 'Microchip',
    'raza': 'Raza',
    'sexo': 'Sexo',
    'fechaNacimiento': 'Fecha de Nacimiento',
    'capa': 'Capa',
    'paisOrigen': 'País de Origen',
    'activo': 'Estado',
    'codigoRega': 'Código REGA',
    'direccion': 'Dirección',
    'municipio': 'Municipio',
    'provincia': 'Provincia',
    'codigoPostal': 'Código Postal',
    'telefono': 'Teléfono',
    'email': 'Email',
    'tipoExplotacion': 'Tipo de Explotación',
    'capacidadMaxima': 'Capacidad Máxima'
  };

  return fieldMappings[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

// Estilos CSS específicos para impresión
const getPrintOnlyStyles = (): string => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: white;
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #000;
    }
    
    .print-container {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 15mm;
      background: white;
    }
    
    .document {
      width: 100%;
      background: white;
      padding: 0;
      margin: 0;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #000;
      padding-bottom: 10pt;
      margin-bottom: 15pt;
    }
    
    .logo h1 {
      color: #000;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 3pt;
    }
    
    .logo p {
      color: #666;
      font-size: 10pt;
    }
    
    .doc-info {
      text-align: right;
    }
    
    .doc-info h2 {
      color: #000;
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 3pt;
    }
    
    .doc-info p {
      color: #666;
      font-size: 10pt;
    }
    
    .section {
      margin-bottom: 20pt;
      break-inside: avoid;
    }
    
    .section h3 {
      color: #000;
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 8pt;
      border-bottom: 1px solid #ccc;
      padding-bottom: 4pt;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10pt;
      width: 100%;
    }
    
    .info-item {
      display: block;
      padding: 8pt;
      background: #f8f8f8;
      border-left: 3pt solid #000;
      break-inside: avoid;
    }
    
    .info-item label {
      font-weight: bold;
      color: #000;
      font-size: 10pt;
      display: block;
      margin-bottom: 2pt;
    }
    
    .info-item span {
      color: #000;
      font-size: 11pt;
      display: block;
    }
    
    .status-active {
      color: #000 !important;
      font-weight: bold;
    }
    
    .status-inactive {
      color: #000 !important;
      font-weight: bold;
    }
    
    .footer {
      margin-top: 20pt;
      padding-top: 10pt;
      border-top: 1px solid #ccc;
      text-align: center;
      color: #666;
      font-size: 8pt;
    }
    
    .footer p {
      margin-bottom: 2pt;
    }
    
    @page {
      margin: 15mm;
      size: A4 portrait;
    }
    
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .print-container {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: none !important;
      }
      
      .no-print {
        display: none !important;
      }
    }
  `;
};

// Estilos CSS para los documentos
const getPreviewStyles = (): string => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    
    .document {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo h1 {
      color: #3b82f6;
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .logo p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .doc-info {
      text-align: right;
    }
    
    .doc-info h2 {
      color: #1f2937;
      font-size: 22px;
      margin-bottom: 5px;
    }
    
    .doc-info p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section h3 {
      color: #1f2937;
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    
    .info-item label {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .info-item span {
      color: #1f2937;
      font-size: 16px;
    }
    
    .status-active {
      color: #059669 !important;
      font-weight: 600;
    }
    
    .status-inactive {
      color: #dc2626 !important;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    
    .footer p {
      margin-bottom: 5px;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .document {
        box-shadow: none;
        margin: 0;
        padding: 15mm;
      }
      
      .no-print {
        display: none !important;
      }
    }
    
    @page {
      margin: 15mm;
      size: A4;
    }
  `;
};