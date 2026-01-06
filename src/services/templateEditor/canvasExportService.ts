import { uploadFileWithPresignedUrl, generateFileKey } from '../presignedUrl/presignedUrlService';

/**
 * ENTERPRISE-LEVEL CANVAS EXPORT & S3 UPLOAD SYSTEM
 * Implements Canva-style export with proper CORS handling and automatic S3 upload
 * This ensures reliable exports even with cross-origin images
 */

// ======================================================================
// TYPES & INTERFACES
// ======================================================================

export interface CanvasExportOptions {
  format?: 'png' | 'jpg' | 'svg' | 'json';
  quality?: number;
  multiplier?: number;
}

export interface TemplateExportPayload {
  title: string;
  json: string;
  image: string; // S3 URL or dataUrl
  imageFile?: File; // Optional original image file
  metadata?: {
    width: number;
    height: number;
    createdAt: string;
    exportFormat: string;
  };
}

export interface ExportAndUploadResult {
  success: boolean;
  imageUrl?: string;
  imageFile?: File;
  error?: string;
  timestamp: string;
}

// ======================================================================
// CORE EXPORT FUNCTIONS
// ======================================================================

/**
 * Convert data URL to Blob
 * @param dataUrl - Data URL string
 * @returns Blob object
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Export canvas to blob (for programmatic use - no download)
 * Uses enterprise-level approach similar to Canva
 */
export async function exportCanvasToBlob(
  fabricCanvas: any,
  options: CanvasExportOptions = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 1,
    multiplier = 2, // 2x for high DPI like Canva
  } = options;

  if (!fabricCanvas) {
    throw new Error('Canvas not provided');
  }

  try {
    console.log('🎨 Starting enterprise-level canvas export to blob...');

    // Get all objects and identify images
    const objects = fabricCanvas.getObjects();
    const imageObjects = objects.filter((obj: any) => obj.type === 'image');

    console.log(
      `📊 Canvas has ${objects.length} objects (${imageObjects.length} images)`
    );

    // If no images, direct export works perfectly
    if (imageObjects.length === 0) {
      console.log('✓ No images detected, using direct export');
      const dataUrl = fabricCanvas.toDataURL({
        format: format,
        quality: quality,
        multiplier: multiplier,
        enableRetinaScaling: true,
      });
      const blob = await dataUrlToBlob(dataUrl);
      console.log('✅ Canvas blob export completed successfully!');
      return blob;
    }

    // Process images with CORS handling (Canva's approach)
    console.log('🔄 Processing images with CORS handling...');
    const processedImages = await Promise.allSettled(
      imageObjects.map((imgObj: any, index: number) =>
        processImageObject(imgObj, index)
      )
    );

    const successCount = processedImages.filter(
      (r) => r.status === 'fulfilled'
    ).length;
    console.log(
      `✓ Processed ${successCount}/${imageObjects.length} images successfully`
    );

    // Wait for rendering to stabilize
    await new Promise((res) => setTimeout(res, 200));

    // Try optimized canvas export
    try {
      console.log('📸 Attempting optimized canvas export...');
      const dataUrl = fabricCanvas.toDataURL({
        format: format,
        quality: quality,
        multiplier: multiplier,
        enableRetinaScaling: true,
        withoutTransform: false,
      });

      const blob = await dataUrlToBlob(dataUrl);
      console.log('✅ Canvas export completed successfully!');
      return blob;
    } catch (directError) {
      console.warn('⚠️ Direct export failed:', directError);
    }

    // Fallback: Manual canvas rendering (Canva's backup method)
    console.log('🔄 Using fallback: Manual canvas rendering...');
    const blob = await manualCanvasRender(fabricCanvas, {
      format,
      quality,
      multiplier,
    });
    console.log('✅ Fallback export completed!');
    return blob;
  } catch (error) {
    console.error('❌ Canvas export failed:', error);
    throw error;
  }
}

/**
 * Process individual image object to ensure it's CORS-compliant
 * This is the key to making exports work like Canva
 */
async function processImageObject(imgObj: any, index: number): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const originalSrc = imgObj.getSrc();
      console.log(
        `  Processing image ${index + 1}: ${originalSrc?.substring(0, 60)}...`
      );

      // If image element exists and already loaded, check if it's usable
      if (imgObj._element && imgObj._element.complete) {
        try {
          const testCanvas = document.createElement('canvas');
          const testCtx = testCanvas.getContext('2d');
          if (!testCtx) {
            resolve(false);
            return;
          }
          testCanvas.width = 1;
          testCanvas.height = 1;
          testCtx.drawImage(imgObj._element, 0, 0, 1, 1);
          testCanvas.toDataURL(); // This will throw if tainted

          console.log(`  ✓ Image ${index + 1} is already CORS-compliant`);
          resolve(true);
          return;
        } catch (taintError) {
          console.log(`  ⚠️ Image ${index + 1} is tainted, reloading...`);
        }
      }

      // Reload image with proper CORS headers
      const newImg = new Image();
      newImg.crossOrigin = 'anonymous';

      // Add cache busting to force fresh load with CORS headers
      const separator = originalSrc?.includes('?') ? '&' : '?';
      const corsUrl = `${originalSrc}${separator}_cors=${Date.now()}`;

      newImg.onload = () => {
        try {
          // Test if the new image is CORS-compliant
          const testCanvas = document.createElement('canvas');
          const testCtx = testCanvas.getContext('2d');
          if (!testCtx) {
            resolve(false);
            return;
          }
          testCanvas.width = 1;
          testCanvas.height = 1;
          testCtx.drawImage(newImg, 0, 0, 1, 1);
          testCanvas.toDataURL();

          // Replace the image element in the Fabric object
          imgObj.setElement(newImg);
          imgObj.set('dirty', true);

          console.log(`  ✓ Image ${index + 1} reloaded with CORS`);
          resolve(true);
        } catch (error) {
          console.warn(`  ⚠️ Image ${index + 1} still tainted after reload`);
          resolve(false);
        }
      };

      newImg.onerror = () => {
        console.warn(`  ⚠️ Failed to reload image ${index + 1}`);
        resolve(false);
      };

      newImg.src = corsUrl;

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!newImg.complete) {
          console.warn(`  ⚠️ Image ${index + 1} load timeout`);
          resolve(false);
        }
      }, 5000);
    } catch (error) {
      console.warn(`  ❌ Error processing image ${index + 1}:`, error);
      reject(error);
    }
  });
}

/**
 * Manual canvas rendering - Canva's ultimate fallback
 * Recreates the entire canvas manually with proper image handling
 */
async function manualCanvasRender(
  fabricCanvas: any,
  options: any
): Promise<Blob> {
  const { format, quality, multiplier } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a new HTML5 canvas
      const htmlCanvas = document.createElement('canvas');
      htmlCanvas.width = fabricCanvas.width * multiplier;
      htmlCanvas.height = fabricCanvas.height * multiplier;

      const ctx = htmlCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Scale context for high DPI
      ctx.scale(multiplier, multiplier);

      // Set background
      const bgColor = fabricCanvas.backgroundColor || '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, fabricCanvas.width, fabricCanvas.height);

      // Get all objects
      const objects = fabricCanvas.getObjects();

      // Draw each object
      objects.forEach((obj: any) => {
        ctx.save();

        // Apply transformations
        const center = obj.getCenterPoint();
        ctx.translate(center.x, center.y);
        ctx.rotate((obj.angle * Math.PI) / 180);
        ctx.scale(obj.scaleX || 1, obj.scaleY || 1);

        if (obj.type === 'image' && obj._element) {
          // Draw image
          const width = obj.width || obj._element.width;
          const height = obj.height || obj._element.height;
          ctx.globalAlpha = obj.opacity || 1;

          try {
            ctx.drawImage(obj._element, -width / 2, -height / 2, width, height);
          } catch (drawError) {
            console.warn('Failed to draw image:', drawError);
            // Draw placeholder
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(-width / 2, -height / 2, width, height);
          }
        } else if (
          obj.type === 'textbox' ||
          obj.type === 'text' ||
          obj.type === 'i-text'
        ) {
          // Draw text
          ctx.globalAlpha = obj.opacity || 1;
          ctx.font = `${obj.fontWeight || 'normal'} ${obj.fontSize || 16}px ${
            obj.fontFamily || 'Arial'
          }`;
          ctx.fillStyle = obj.fill || '#000000';
          ctx.textAlign = obj.textAlign || 'left';
          ctx.textBaseline = 'middle';

          const text = obj.text || '';
          const textWidth = obj.width || ctx.measureText(text).width;
          ctx.fillText(text, -textWidth / 2, 0);
        } else if (obj.type === 'rect') {
          // Draw rectangle
          const rectWidth = obj.width || 100;
          const rectHeight = obj.height || 100;
          ctx.globalAlpha = obj.opacity || 1;

          if (obj.fill) {
            ctx.fillStyle = obj.fill;
            ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
          }

          if (obj.stroke) {
            ctx.strokeStyle = obj.stroke;
            ctx.lineWidth = obj.strokeWidth || 1;
            ctx.strokeRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
          }
        } else if (obj.type === 'circle') {
          // Draw circle
          const radius = obj.radius || 50;
          ctx.globalAlpha = obj.opacity || 1;

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);

          if (obj.fill) {
            ctx.fillStyle = obj.fill;
            ctx.fill();
          }

          if (obj.stroke) {
            ctx.strokeStyle = obj.stroke;
            ctx.lineWidth = obj.strokeWidth || 1;
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // Convert to blob
      htmlCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from manual render'));
          }
        },
        `image/${format}`,
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
}

// ======================================================================
// S3 UPLOAD INTEGRATION
// ======================================================================

/**
 * Export canvas and upload to S3
 * This is the main function to call for save/update workflow
 */
export async function exportCanvasAndUploadToS3(
  fabricCanvas: any,
  options: {
    title?: string;
    format?: 'png' | 'jpg';
    quality?: number;
    multiplier?: number;
  } = {}
): Promise<ExportAndUploadResult> {
  const {
    title = 'Untitled Design',
    format = 'png',
    quality = 1,
    multiplier = 2,
  } = options;

  try {
    console.log('🚀 Starting canvas export and S3 upload...');

    // Step 1: Export canvas to blob
    const blob = await exportCanvasToBlob(fabricCanvas, {
      format,
      quality,
      multiplier,
    });

    // Step 2: Create File from Blob
    const fileName = `${title.replace(/\s+/g, '_')}_${Date.now()}.${format}`;
    const imageFile = new File([blob], fileName, { type: `image/${format}` });

    console.log(`📦 Created image file: ${fileName} (${blob.size} bytes)`);

    // Step 3: Upload to S3
    const fileKey = generateFileKey('template_designs', fileName);
    const s3Url = await uploadFileWithPresignedUrl(imageFile, fileKey, imageFile.type);

    console.log(`✅ Image uploaded to S3: ${s3Url}`);

    return {
      success: true,
      imageUrl: s3Url,
      imageFile,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Export and upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Export canvas with complete template payload
 * Includes both image and JSON source
 */
export async function exportCanvasWithPayload(
  fabricCanvas: any,
  canvasJson: string,
  options: {
    title?: string;
    width?: number;
    height?: number;
    uploadToS3?: boolean;
  } = {}
): Promise<TemplateExportPayload & ExportAndUploadResult> {
  const {
    title = 'Untitled Design',
    width = fabricCanvas?.width || 1920,
    height = fabricCanvas?.height || 1080,
    uploadToS3 = true,
  } = options;

  try {
    console.log('🎨 Starting canvas export with full payload...');

    // Export and upload if needed
    const uploadResult = uploadToS3
      ? await exportCanvasAndUploadToS3(fabricCanvas, { title })
      : {
          success: true,
          imageUrl: fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
          }),
          timestamp: new Date().toISOString(),
        };

    if (!uploadResult.success) {
      throw new Error(
        (uploadResult as any).error || 'Upload failed'
      );
    }

    const payload: TemplateExportPayload & ExportAndUploadResult = {
      success: true,
      title,
      json: canvasJson,
      image: uploadResult.imageUrl || '',
      imageFile: (uploadResult as any).imageFile,
      metadata: {
        width,
        height,
        createdAt: new Date().toISOString(),
        exportFormat: 'png',
      },
      timestamp: uploadResult.timestamp,
    };

    console.log('✅ Complete payload export ready:', payload);
    return payload;
  } catch (error) {
    console.error('❌ Payload export failed:', error);
    return {
      success: false,
      title,
      json: canvasJson,
      image: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
