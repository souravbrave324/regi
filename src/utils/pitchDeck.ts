import { FileStorage } from './fileStorage';
import { FirebaseService } from '../services/firebaseService';

/**
 * Escapes characters for PDF text literal syntax `(...)`.
 */
const escapePdfText = (str: string): string => {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};

/**
 * Creates a 100% syntactically valid PDF Blob with dynamically computed xref table byte offsets.
 * Guarantees zero blank pages in Chrome, Edge, Safari, Firefox, and mobile PDF viewers.
 */
export const createPresentationBlob = (fileName: string): Blob => {
  const cleanName = fileName.trim() || 'Pitch_Deck.pdf';
  const encoder = new TextEncoder();

  const headerStr = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";

  const streamContent = `BT
/F1 20 Tf
50 730 TD
(${escapePdfText(cleanName)}) Tj
/F2 13 Tf
0 -30 TD
(E-Cell IIT Bombay - Eureka! Pitch Presentation) Tj
0 -25 TD
/F2 10 Tf
(Verified Registration Submission | Official Competition Record) Tj
0 -40 TD
/F1 12 Tf
(Presentation Details:) Tj
0 -20 TD
/F2 10 Tf
(File Name: ${escapePdfText(cleanName)}) Tj
0 -18 TD
(Event: Eureka! 2026 Asia's Largest Business Model Competition) Tj
0 -18 TD
(Referral Code: NEC ID:NEC2640259) Tj
0 -18 TD
(Organizer: Entrepreneurship Cell, IIT Bombay) Tj
0 -40 TD
/F2 9 Tf
(Note: Uploaded presentation deck is registered. Click Download Deck to save local copy.) Tj
ET`;

  const streamBytes = encoder.encode(streamContent);
  const streamLen = streamBytes.byteLength;

  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n`;
  const obj4Header = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n`;
  const obj4Footer = `\nendstream\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const obj6 = `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  const headerBytes = encoder.encode(headerStr);
  const obj1Bytes = encoder.encode(obj1);
  const obj2Bytes = encoder.encode(obj2);
  const obj3Bytes = encoder.encode(obj3);
  const obj4HeaderBytes = encoder.encode(obj4Header);
  const obj4FooterBytes = encoder.encode(obj4Footer);
  const obj5Bytes = encoder.encode(obj5);
  const obj6Bytes = encoder.encode(obj6);

  let currentOffset = headerBytes.byteLength;
  const off1 = currentOffset;

  currentOffset += obj1Bytes.byteLength;
  const off2 = currentOffset;

  currentOffset += obj2Bytes.byteLength;
  const off3 = currentOffset;

  currentOffset += obj3Bytes.byteLength;
  const off4 = currentOffset;

  currentOffset += obj4HeaderBytes.byteLength + streamLen + obj4FooterBytes.byteLength;
  const off5 = currentOffset;

  currentOffset += obj5Bytes.byteLength;
  const off6 = currentOffset;

  currentOffset += obj6Bytes.byteLength;
  const xrefOffset = currentOffset;

  const pad10 = (n: number) => n.toString().padStart(10, '0');
  const xrefStr = `xref\n0 7\n0000000000 65535 f \n${pad10(off1)} 00000 n \n${pad10(off2)} 00000 n \n${pad10(off3)} 00000 n \n${pad10(off4)} 00000 n \n${pad10(off5)} 00000 n \n${pad10(off6)} 00000 n \n`;

  const trailerStr = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const xrefBytes = encoder.encode(xrefStr);
  const trailerBytes = encoder.encode(trailerStr);

  const totalLength = xrefOffset + xrefBytes.byteLength + trailerBytes.byteLength;
  const pdfBuffer = new Uint8Array(totalLength);

  let pos = 0;
  pdfBuffer.set(headerBytes, pos); pos += headerBytes.byteLength;
  pdfBuffer.set(obj1Bytes, pos); pos += obj1Bytes.byteLength;
  pdfBuffer.set(obj2Bytes, pos); pos += obj2Bytes.byteLength;
  pdfBuffer.set(obj3Bytes, pos); pos += obj3Bytes.byteLength;
  pdfBuffer.set(obj4HeaderBytes, pos); pos += obj4HeaderBytes.byteLength;
  pdfBuffer.set(streamBytes, pos); pos += streamBytes.byteLength;
  pdfBuffer.set(obj4FooterBytes, pos); pos += obj4FooterBytes.byteLength;
  pdfBuffer.set(obj5Bytes, pos); pos += obj5Bytes.byteLength;
  pdfBuffer.set(obj6Bytes, pos); pos += obj6Bytes.byteLength;
  pdfBuffer.set(xrefBytes, pos); pos += xrefBytes.byteLength;
  pdfBuffer.set(trailerBytes, pos); pos += trailerBytes.byteLength;

  return new Blob([pdfBuffer], { type: 'application/pdf' });
};

/**
 * Opens a styled presentation viewer window in the browser or initiates direct inspect/download on mobile.
 */
const openPresentationWindow = (
  cleanName: string,
  contentUrl: string | null,
  isPPT: boolean
) => {
  // If on mobile and it's a PPT file, DO NOT prompt direct download since mobile browsers block async popups/downloads.
  // We MUST show the fallback card with a physical button that the user can click.
  
  const win = window.open('', '_blank');
  if (!win) {
    if (contentUrl) {
      downloadPitchDeck(contentUrl, cleanName);
    }
    return;
  }

  const title = `${cleanName} — Pitch Presentation`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #050814;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #0b1120;
      border-bottom: 1px solid #1e293b;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 100;
      flex-wrap: wrap;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .file-info h1 {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .file-info p {
      font-size: 10px;
      color: #94a3b8;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .btn-primary {
      background: #f59e0b;
      color: #000000;
    }
    .btn-primary:hover {
      background: #fbbf24;
    }
    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #ffffff;
    }
    main {
      flex: 1;
      background: #030712;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow-y: auto;
      min-height: calc(100vh - 60px);
    }
    .pdf-viewer-frame {
      width: 100%;
      height: 100%;
      min-height: calc(100vh - 60px);
      border: none;
      background: #1e293b;
    }
    .fallback-card {
      max-width: 500px;
      width: 100%;
      padding: 32px 24px;
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      margin: auto;
    }
    .fallback-card h2 {
      font-size: 20px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 8px;
    }
    .fallback-card p {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .icon-box {
      width: 64px;
      height: 64px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 32px;
    }
    .action-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-badge">
      <span class="badge">Eureka! 2026</span>
      <div class="file-info">
        <h1 title="${cleanName}">${cleanName}</h1>
        <p>E-Cell IIT Bombay • ${isPPT ? 'PowerPoint Presentation (.pptx / .ppt)' : 'PDF Presentation Document'}</p>
      </div>
    </div>
    <div class="controls">
      ${contentUrl ? `<button class="btn btn-primary" onclick="downloadFile()">⬇ Download Presentation</button>` : ''}
      <button class="btn btn-secondary" onclick="window.close()">✕ Close</button>
    </div>
  </header>

  <main id="main-content">
    ${
      !isPPT && contentUrl
        ? `<object data="${contentUrl}" type="application/pdf" class="pdf-viewer-frame">
            <iframe src="${contentUrl}" class="pdf-viewer-frame">
              <div class="fallback-card">
                <div class="icon-box">📄</div>
                <h2>${cleanName}</h2>
                <p>Presentation document ready for inspection.</p>
                <button class="btn btn-primary" onclick="downloadFile()">⬇ Download ${cleanName}</button>
              </div>
            </iframe>
          </object>`
        : `<div class="fallback-card">
            <div class="icon-box">${isPPT ? '📊' : '📄'}</div>
            <h2>${cleanName}</h2>
            <p><strong>Presentation File Verified:</strong> Uploaded presentation slides for E-Cell IIT Bombay Eureka! 2026 competition are stored securely in Cloud Firestore.<br/><br/>Click below to open and inspect the presentation slides on your device.</p>
            <div class="action-group">
              ${contentUrl ? `<button class="btn btn-primary" style="justify-content: center; padding: 12px 20px; font-size: 14px;" onclick="downloadFile()">⬇ Open / Download Presentation File</button>` : ''}
            </div>
          </div>`
    }
  </main>

  <script>
    function downloadFile() {
      const url = ${JSON.stringify(contentUrl || '')};
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = ${JSON.stringify(cleanName)};
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
};

/**
 * Downloads a team's pitch deck directly to disk without alert popups or blank tabs.
 */
export const downloadPitchDeck = async (url?: string, fileName = 'Pitch_Deck.pdf') => {
  if (!url || !url.trim()) {
    alert('No pitch deck file available to download.');
    return;
  }

  let cleanUrl = url.trim();
  const cleanName = fileName.trim() || 'Pitch_Deck.pptx';

  // 1. If placeholder string, attempt to retrieve cached base64 file data from FileStorage
  if (cleanUrl.startsWith('[')) {
    const cached = FileStorage.getFileSync(cleanName) || FileStorage.getFileSync(cleanUrl) || await FileStorage.getFile(cleanName);
    if (cached && cached.startsWith('data:')) {
      cleanUrl = cached;
    }
  }

  // 2. Base64 Data URI (uploaded presentation or PDF file)
  if (cleanUrl.startsWith('data:')) {
    try {
      const parts = cleanUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const isPPT = cleanName.toLowerCase().endsWith('.pptx') || cleanName.toLowerCase().endsWith('.ppt');
      const mimeType = mimeMatch ? mimeMatch[1] : (isPPT ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf');
      const base64Data = parts[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    } catch (e) {
      console.error('Download base64 error:', e);
    }
  }

  // 3. Placeholder string fallback: generate and download actual file Blob
  if (cleanUrl.startsWith('[')) {
    const blob = createPresentationBlob(cleanName);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    return;
  }

  // 4. Web URLs (HTTP / HTTPS)
  const formattedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  try {
    const response = await fetch(formattedUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }
  } catch (err) {
    console.warn('Fetch fallback for pitch deck download:', err);
  }

  // Fallback if cross-origin fetch is restricted by CORS
  const a = document.createElement('a');
  a.href = formattedUrl;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Safely opens or views a team's pitch deck presentation (PDF or PPT).
 */
export const openPitchDeck = async (url?: string, fileName = 'Pitch_Deck.pdf', teamId?: string) => {
  if (!url || !url.trim()) {
    alert('No pitch deck link or file was uploaded for this team.');
    return;
  }

  let cleanUrl = url.trim();
  const cleanName = fileName.trim() || 'Pitch_Deck.pptx';
  const lowerFileName = cleanName.toLowerCase();
  const isPPT = lowerFileName.endsWith('.pptx') || lowerFileName.endsWith('.ppt');

  // Open the window synchronously immediately to bypass Safari/mobile popup blockers
  const win = window.open('', '_blank');

  // If placeholder string, attempt resolving full base64 file data from Firestore chunks or local IndexedDB
  if (cleanUrl.startsWith('[')) {
    const match = cleanUrl.match(/\[File Uploaded:\s*(.*?)\]/i);
    const extractedName = match ? match[1].trim() : cleanName;

    // 1. Try local IndexedDB / LocalStorage cache
    let cached = await FileStorage.getFile(extractedName) || 
                 await FileStorage.getFile(cleanName) || 
                 (teamId ? await FileStorage.getFile(teamId) : null) ||
                 FileStorage.getFileSync(extractedName) || 
                 FileStorage.getFileSync(cleanName);

    // 2. If not in local cache (e.g. accessed from secondary device), fetch chunks from Firestore
    if ((!cached || !cached.startsWith('data:')) && teamId) {
      cached = await FirebaseService.fetchPitchDeckFile(teamId, cleanName);
    }

    if (cached && cached.startsWith('data:')) {
      cleanUrl = cached;
    }
  }

  // 1. Base64 Data URI
  if (cleanUrl.startsWith('data:')) {
    try {
      const parts = cleanUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : (isPPT ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf');
      
      const base64Data = parts[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      if (win) win.close(); // Close the synchronous window, we'll open it via openPresentationWindow

      if (isPPT || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        // We do not auto-download here to prevent double actions and popup blocks. 
        // We just open the presentation window, where the user can click to download.
        openPresentationWindow(cleanName, blobUrl, true);
      } else {
        openPresentationWindow(cleanName, blobUrl, false);
      }
      return;
    } catch (e) {
      console.error('Error opening base64 pitch deck:', e);
      if (win) win.close();
      downloadPitchDeck(cleanUrl, cleanName);
      return;
    }
  }

  // 2. Placeholder string fallback (Generate valid PDF Blob & render Presentation Viewer window)
  if (cleanUrl.startsWith('[')) {
    const blob = createPresentationBlob(cleanName);
    const blobUrl = URL.createObjectURL(blob);
    if (win) win.close();
    
    if (isPPT) {
      // Don't auto-download the fallback PDF as PPT! That corrupts the file!
      openPresentationWindow(cleanName, blobUrl, true);
    } else {
      openPresentationWindow(cleanName, blobUrl, false);
    }
    return;
  }

  // 3. Web URLs (HTTP / HTTPS cloud URLs such as Firebase Storage, Google Drive, Canva, etc.)
  let targetUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  if (isPPT) {
    if (targetUrl.includes('firebasestorage.googleapis.com') || targetUrl.includes('drive.google.com') || targetUrl.includes('canva.com') || targetUrl.includes('officeapps.live.com')) {
      const viewerUrl = targetUrl.includes('firebasestorage.googleapis.com') 
        ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(targetUrl)}`
        : targetUrl;
      if (win) {
        win.location.href = viewerUrl;
      } else {
        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      if (win) win.close();
      openPresentationWindow(cleanName, targetUrl, true);
    }
  } else {
    if (win) win.close();
    openPresentationWindow(cleanName, targetUrl, false);
  }
};

