import html2canvas from 'html2canvas';

/**
 * Universal utility to capture a DOM element as an image.
 * Using html2canvas for better CSS fidelity and Icon support.
 */
export const captureElement = async (element, options = {}) => {
  const {
    backgroundColor = '#f8f9fa',
    pixelRatio = 2, // 2 is usually enough for clarity without massive file size
  } = options;

  console.log('[CaptureUtility] Starting high-fidelity capture with html2canvas...');

  try {
    // Ensure all fonts are loaded before capture
    if (document.fonts) {
      console.log('[CaptureUtility] Waiting for fonts...');
      await document.fonts.ready;
    }

    const config = {
      backgroundColor,
      scale: pixelRatio,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      x: window.scrollX,
      y: window.scrollY,
      ignoreElements: node => {
        // Exclude UI elements that shouldn't be in the report
        if (
          node.id === 'global-capture-overlay' ||
          (node.classList && node.classList.contains('global-fab-feedback')) ||
          (node.dataset && node.dataset.captureIgnore !== undefined)
        ) {
          return true;
        }
        return false;
      },
    };

    // Use html2canvas to capture
    const canvas = await html2canvas(element, config);

    // Convert canvas to blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png', 0.9);
    });

    if (!blob || blob.size < 100) {
      throw new Error('Captured image is empty or too small');
    }

    console.log('[CaptureUtility] Capture successful. Blob size:', (blob.size / 1024).toFixed(1), 'KB');
    return blob;
  } catch (error) {
    console.error('[CaptureUtility] High-fidelity capture failed:', error);
    throw error;
  }
};

/**
 * Downloads a data URL or Blob as a file
 */
export const downloadImage = (dataUrl, fileName) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
};

/**
 * Copies a Blob to the system clipboard as an image
 */
export const copyImageToClipboard = async blob => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported');
    }

    const data = [new ClipboardItem({ [blob.type]: blob })];
    await navigator.clipboard.write(data);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Shares an image using the native Web Share API
 */
export const shareImage = async (blob, fileName) => {
  try {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    const file = new File([blob], fileName, { type: blob.type });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Share Image',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to share image:', error);
    return false;
  }
};
