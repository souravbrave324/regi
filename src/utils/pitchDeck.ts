/**
 * Safely opens or views a team's pitch deck.
 * Handles web URLs (https://), Data URIs (data:pdf), and placeholder file names cleanly
 * without causing 404 errors on Vercel or external routing issues.
 */
export const openPitchDeck = (url?: string, fileName = 'Pitch_Deck.pdf') => {
  if (!url || !url.trim()) {
    alert('No pitch deck link or file was uploaded for this team.');
    return;
  }

  const cleanUrl = url.trim();

  // 1. Direct Web URLs (Google Drive, Canva, Dropbox, PDF links, etc.)
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // 2. Base64 Data URI (uploaded PDF or presentation file)
  if (cleanUrl.startsWith('data:')) {
    try {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>${fileName}</title>
              <style>
                body { margin: 0; background: #0b1120; height: 100vh; display: flex; flex-direction: column; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${cleanUrl}"></iframe>
            </body>
          </html>`
        );
        newTab.document.close();
      } else {
        const link = document.createElement('a');
        link.href = cleanUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error('Error opening base64 pitch deck:', e);
      const link = document.createElement('a');
      link.href = cleanUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return;
  }

  // 3. Placeholder string (e.g. stored in database without full base64)
  if (cleanUrl.startsWith('[')) {
    alert(`Pitch deck file "${fileName}" was successfully submitted with registration.`);
    return;
  }

  // 4. Fallback for URLs missing http/https protocol
  const formattedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
  window.open(formattedUrl, '_blank', 'noopener,noreferrer');
};
