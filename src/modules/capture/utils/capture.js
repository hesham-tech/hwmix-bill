import { toBlob, toPng, toJpeg } from 'html-to-image';

/**
 * Universal utility to capture a DOM element as an image.
 */
export const captureElement = async (element, options = {}) => {
  const {
    format = 'png',
    fileName = 'capture',
    backgroundColor = '#ffffff',
    quality = 0.95,
    pixelRatio = window.devicePixelRatio > 1 ? 2 : 1,
  } = options;

  const config = {
    cacheBust: true,
    skipFonts: true, // Crucial for Avoiding SecurityError with external fonts
    backgroundColor,
    pixelRatio,
    quality,
    filter: node => {
      // Exclude the diagnostic overlay and any element with data-capture-ignore
      if (node.id === 'global-capture-overlay' || (node.dataset && node.dataset.captureIgnore !== undefined)) {
        return false;
      }
      return true;
    },
    ...options.htmlToImageOptions,
  };

  try {
    if (format === 'blob') {
      return await toBlob(element, config);
    }

    if (format === 'jpeg') {
      return await toJpeg(element, config);
    }

    return await toPng(element, config);
  } catch (error) {
    console.error('Capture Utility Error:', error);
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
