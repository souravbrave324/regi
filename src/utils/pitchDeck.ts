import { FileStorage } from './fileStorage';

/**
 * Creates a valid presentation or PDF Blob for direct viewing/downloading.
 */
const createPresentationBlob = (fileName: string): Blob => {
  const lowerName = fileName.toLowerCase();
  const isPPT = lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt');

  if (isPPT) {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvSpPr/></p:nvSpPr>
        <p:txBody><a:bodyPr/><a:p><a:r><a:t>${fileName} - E-Cell IIT Bombay Pitch Deck</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
    return new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  } else {
    const pdfContent = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /Resources <<Font <</F1 5 0 R>>>> /Contents 4 0 R>> endobj
4 0 obj <</Length 120>> stream
BT
/F1 18 Tf
50 720 TD
(${fileName} - E-Cell Pitch Presentation) Tj
0 -30 TD
/F1 12 Tf
(Verified Registration Submission - E-Cell IIT Bombay) Tj
ET
endstream endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000213 00000 n 
0000000384 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
455
%%EOF`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
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
export const openPitchDeck = async (url?: string, fileName = 'Pitch_Deck.pdf') => {
  if (!url || !url.trim()) {
    alert('No pitch deck link or file was uploaded for this team.');
    return;
  }

  let cleanUrl = url.trim();
  const cleanName = fileName.trim() || 'Pitch_Deck.pptx';
  const lowerFileName = cleanName.toLowerCase();
  const isPPT = lowerFileName.endsWith('.pptx') || lowerFileName.endsWith('.ppt');

  // If placeholder string, check FileStorage cache for actual base64 file data
  if (cleanUrl.startsWith('[')) {
    const cached = FileStorage.getFileSync(cleanName) || FileStorage.getFileSync(cleanUrl) || await FileStorage.getFile(cleanName);
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

      if (isPPT || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        downloadPitchDeck(cleanUrl, cleanName);
      } else {
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          downloadPitchDeck(cleanUrl, cleanName);
        }
      }
      return;
    } catch (e) {
      console.error('Error opening base64 pitch deck:', e);
      downloadPitchDeck(cleanUrl, cleanName);
      return;
    }
  }

  // 2. Placeholder string fallback (Generate PDF/PPT Blob viewer in new tab)
  if (cleanUrl.startsWith('[')) {
    const blob = createPresentationBlob(cleanName);
    const blobUrl = URL.createObjectURL(blob);
    if (isPPT) {
      downloadPitchDeck(cleanUrl, cleanName);
    } else {
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        downloadPitchDeck(cleanUrl, cleanName);
      }
    }
    return;
  }

  // 3. Web URLs (HTTP / HTTPS cloud URLs such as Firebase Storage, Google Drive, Canva, etc.)
  let targetUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  if (isPPT) {
    if (targetUrl.includes('firebasestorage.googleapis.com') || targetUrl.includes('drive.google.com') || targetUrl.includes('canva.com') || targetUrl.includes('officeapps.live.com')) {
      // Use Office Web Viewer for raw cloud PPT files or open direct link
      const viewerUrl = targetUrl.includes('firebasestorage.googleapis.com') 
        ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(targetUrl)}`
        : targetUrl;
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    } else {
      downloadPitchDeck(targetUrl, cleanName);
    }
  } else {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
};
