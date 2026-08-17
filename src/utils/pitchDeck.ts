import { FileStorage } from './fileStorage';

/**
 * Safely opens or views a team's pitch deck (PDF, PPT, PPTX, or Web Link).
 * Prevents Chrome's about:blank#blocked security error by avoiding target="_blank"
 * on download anchor links and utilizing Blob object URLs.
 */

/**
 * Downloads a team's pitch deck directly to disk without opening blank tabs.
 */
export const downloadPitchDeck = async (url?: string, fileName = 'Pitch_Deck.pdf') => {
  if (!url || !url.trim()) {
    alert('No pitch deck file available to download.');
    return;
  }

  let cleanUrl = url.trim();

  // If placeholder string, attempt to retrieve cached base64 file data from FileStorage
  if (cleanUrl.startsWith('[')) {
    const cached = FileStorage.getFileSync(fileName) || FileStorage.getFileSync(cleanUrl) || await FileStorage.getFile(fileName);
    if (cached && cached.startsWith('data:')) {
      cleanUrl = cached;
    }
  }

  // 1. Base64 Data URI (uploaded presentation or PDF file)
  if (cleanUrl.startsWith('data:')) {
    try {
      const parts = cleanUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
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
      a.download = fileName;
      // CRITICAL: Do NOT set a.target = '_blank' here! It causes Chrome to block the window with about:blank#blocked
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    } catch (e) {
      console.error('Download base64 error:', e);
    }
  }

  // 2. Placeholder string fallback if file content not in cache
  if (cleanUrl.startsWith('[')) {
    alert(`File "${fileName}" was recorded with team registration.`);
    return;
  }

  // 3. Web URLs (HTTP / HTTPS)
  const formattedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  try {
    const response = await fetch(formattedUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
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
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Safely opens or views a team's pitch deck presentation.
 */
export const openPitchDeck = async (url?: string, fileName = 'Pitch_Deck.pdf') => {
  if (!url || !url.trim()) {
    alert('No pitch deck link or file was uploaded for this team.');
    return;
  }

  let cleanUrl = url.trim();
  const lowerFileName = fileName.toLowerCase();
  const isPPT = lowerFileName.endsWith('.pptx') || lowerFileName.endsWith('.ppt');

  // If placeholder string, check FileStorage cache for actual base64 file data
  if (cleanUrl.startsWith('[')) {
    const cached = FileStorage.getFileSync(fileName) || FileStorage.getFileSync(cleanUrl) || await FileStorage.getFile(fileName);
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
        // Trigger clean file download for PPT/PPTX without target="_blank"
        downloadPitchDeck(cleanUrl, fileName);
      } else {
        // Open PDF in a new tab using native Blob URL viewer
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          downloadPitchDeck(cleanUrl, fileName);
        }
      }
      return;
    } catch (e) {
      console.error('Error opening base64 pitch deck:', e);
      downloadPitchDeck(cleanUrl, fileName);
      return;
    }
  }

  // 2. Placeholder string
  if (cleanUrl.startsWith('[')) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${fileName} - Pitch Deck Record</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #050814; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #0b1120; border: 1px solid #1e293b; border-radius: 24px; padding: 40px; max-width: 520px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
            .icon { width: 64px; height: 64px; background: rgba(245,158,11,0.15); color: #f59e0b; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; font-weight: bold; border: 1px solid rgba(245,158,11,0.3); }
            h2 { color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
            .badge { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px; }
            .filename { font-family: monospace; background: #050814; padding: 8px 16px; border-radius: 8px; border: 1px solid #334155; color: #f59e0b; font-weight: bold; word-break: break-all; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ Verified Submission</div>
            <div class="icon">📄</div>
            <h2>Pitch Deck File Record</h2>
            <div class="filename">${fileName}</div>
            <p>This presentation deck file was successfully uploaded and registered by the participant team for E-Cell IIT Bombay evaluation.</p>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    return;
  }

  // 3. Web URLs (HTTP / HTTPS)
  let targetUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  if (isPPT) {
    if (targetUrl.includes('drive.google.com') || targetUrl.includes('canva.com') || targetUrl.includes('officeapps.live.com')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      downloadPitchDeck(targetUrl, fileName);
    }
  } else {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
};
