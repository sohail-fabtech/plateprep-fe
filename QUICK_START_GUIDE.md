# Canvas Export & S3 Upload - Quick Start Guide

## Installation & Setup

No additional dependencies needed! Uses existing:

- ✅ `fabric.js` - Already in project
- ✅ `presignedUrlService` - Already configured
- ✅ `useSnackbar` - Already available
- ✅ `lodash/debounce` - Already installed

---

## Quick Examples

### Example 1: Export Canvas to PNG

```typescript
import { exportCanvasToBlob } from '@/services';

// Simple export
const blob = await exportCanvasToBlob(fabricCanvas);

// With options
const blob = await exportCanvasToBlob(fabricCanvas, {
  format: 'png',
  quality: 1,
  multiplier: 2,
});

// Use the blob
const url = URL.createObjectURL(blob);
console.log('Blob size:', blob.size, 'bytes');
```

---

### Example 2: Export and Upload to S3 (First Save)

```typescript
import { exportCanvasAndUploadToS3 } from '@/services';
import { useSnackbar } from '@/components/snackbar';

export function MyEditor() {
  const { enqueueSnackbar } = useSnackbar();
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    setIsUploading(true);

    try {
      const result = await exportCanvasAndUploadToS3(canvas, {
        title: 'My Design',
        format: 'png',
      });

      if (result.success) {
        enqueueSnackbar('Saved to S3!', { variant: 'success' });
        console.log('S3 URL:', result.imageUrl);

        // Save S3 URL to database
        await saveTemplateToDatabase({
          imageUrl: result.imageUrl,
          timestamp: result.timestamp,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      enqueueSnackbar('Upload failed: ' + error.message, {
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <button onClick={handleSave} disabled={isUploading}>
      {isUploading ? 'Saving...' : 'Save to S3'}
    </button>
  );
}
```

---

### Example 3: Complete Payload Export (Recommended)

```typescript
import { exportCanvasWithPayload } from '@/services';

// Get canvas JSON
const canvasJson = JSON.stringify(canvas.toJSON(['id', 'filters']));

// Export with S3 upload
const payload = await exportCanvasWithPayload(canvas, canvasJson, {
  title: 'Restaurant Menu',
  uploadToS3: true, // Automatic S3 upload
});

// Use payload for API
if (payload.success) {
  // Send to backend API
  const response = await api.post('/templates/', {
    title: payload.title,
    image: payload.image, // S3 URL
    source: payload.source, // Canvas JSON
    metadata: payload.metadata, // Width, height, timestamp
  });

  console.log('Template saved:', response.id);
} else {
  console.error('Export failed:', payload.error);
}
```

---

### Example 4: Auto-Save on Every Change (Already Implemented)

The Editor component already does this via `useHistory`:

```typescript
// In Editor.tsx - already integrated!
const saveCallback = useCallback(
  async (values: { json: string; height: number; width: number; dataUrl?: string }) => {
    // First save: Export and upload to S3
    if (isFirstSave) {
      const result = await exportCanvasAndUploadToS3(canvas);
      // ... handle S3 URL
    }
    // Subsequent saves: Log payload (debounced)
    else {
      const payload = {
        image: values.dataUrl,
        source: JSON.parse(values.json),
      };
      console.log('Autosave:', payload);
    }
  },
  [isFirstSave]
);
```

---

### Example 5: Custom Export with Options

```typescript
import { exportCanvasToBlob } from '@/services';

// Export with different formats
const pngBlob = await exportCanvasToBlob(canvas, {
  format: 'png',
  quality: 1,
  multiplier: 2, // 2x for Retina
});

const jpgBlob = await exportCanvasToBlob(canvas, {
  format: 'jpg',
  quality: 0.85,
  multiplier: 1, // 1x for web
});

// Compare sizes
console.log('PNG size:', pngBlob.size); // Larger, lossless
console.log('JPG size:', jpgBlob.size); // Smaller, lossy
```

---

### Example 6: Error Handling & Fallbacks

```typescript
import { exportCanvasAndUploadToS3 } from '@/services';

const result = await exportCanvasAndUploadToS3(canvas);

if (result.success) {
  // Use S3 URL
  console.log('Image uploaded:', result.imageUrl);

  // Metadata
  console.log('Uploaded at:', result.timestamp);
  console.log('File:', result.imageFile.name);
} else {
  // Automatic fallback: Editor uses dataUrl instead
  console.log('Upload failed:', result.error);
  console.log('Fallback to dataUrl');

  // Options:
  // 1. Retry upload later
  // 2. Show offline indicator
  // 3. Save with dataUrl (less ideal but works)
}
```

---

### Example 7: Multiple Formats Export

```typescript
import { exportCanvasToBlob } from '@/services';

// Create a download menu
async function downloadDesign(format) {
  const blob = await exportCanvasToBlob(canvas, {
    format: format as 'png' | 'jpg' | 'svg' | 'json',
    quality: 1,
    multiplier: 2,
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `design_${Date.now()}.${format}`;
  link.click();

  URL.revokeObjectURL(url);
}

// Usage
downloadDesign('png'); // Download as PNG
downloadDesign('jpg'); // Download as JPG
```

---

## Common Patterns

### Pattern 1: Save on Any Change

```typescript
// Already done in Editor via useHistory!
// Automatically saves every 500ms (debounced)
canvas.on('object:modified', () => {
  // Triggers save callback
});
```

### Pattern 2: Show Progress

```typescript
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaving(true);
  try {
    const result = await exportCanvasAndUploadToS3(canvas);
    // ...
  } finally {
    setSaving(false);
  }
};

// Show spinner while saving
{
  saving && <CircularProgress />;
}
```

### Pattern 3: Retry Failed Uploads

```typescript
async function uploadWithRetry(canvas, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await exportCanvasAndUploadToS3(canvas);

    if (result.success) return result;

    // Wait before retry
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
  }

  throw new Error('Upload failed after retries');
}
```

### Pattern 4: Cache Management

```typescript
// Store export blob for later use
const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);

const getCachedExport = async () => {
  if (cachedBlob) return cachedBlob;

  const blob = await exportCanvasToBlob(canvas);
  setCachedBlob(blob);
  return blob;
};

// Use cached version
const blob = await getCachedExport();
```

---

## Debugging

### Check Console Logs

The service logs everything with emoji prefixes:

```
🎨 Starting enterprise-level canvas export...
📊 Canvas has 15 objects (3 images)
🔄 Processing images with CORS handling...
✓ Processed 3/3 images successfully
📸 Attempting optimized canvas export...
✅ Canvas export completed successfully!

🚀 Starting canvas export and S3 upload...
📦 Created image file: Design_1735975200000.png (245KB)
✅ Image uploaded to S3: https://bucket.s3.amazonaws.com/...
```

### Monitor Network

1. Open DevTools → Network tab
2. Look for S3 upload request (PUT)
3. Check response status (200 = success)
4. Verify S3 URL in response

### Check S3 Bucket

```
AWS S3 Console:
├─ Bucket: your-bucket
├─ Objects:
│  ├─ 1735975200000_abc123.png ✅
│  └─ 1735975200001_def456.png ✅
```

---

## Performance Tips

### Tip 1: Reduce Export Size

```typescript
// Fast export (smaller file)
const blob = await exportCanvasToBlob(canvas, {
  quality: 0.7, // Reduce quality
  multiplier: 1, // 1x instead of 2x
});

// Result: 50-70% smaller, faster upload
```

### Tip 2: Defer Upload

```typescript
// Export immediately (fast)
const blob = await exportCanvasToBlob(canvas);

// Upload later (background)
setTimeout(() => {
  uploadFileWithPresignedUrl(new File([blob], 'design.png'));
}, 5000);
```

### Tip 3: Monitor Memory

```typescript
// Clean up blob URLs
const url = URL.createObjectURL(blob);
// ... use url
URL.revokeObjectURL(url); // Important!
```

---

## API Integration Example

```typescript
// types.ts
export interface TemplatePayload {
  title: string;
  image: string; // S3 URL
  source: any; // Canvas JSON
  metadata?: {
    width: number;
    height: number;
    createdAt: string;
  };
}

// api.ts
export function saveTemplate(payload: TemplatePayload) {
  return axiosInstance.post('/templates/', payload);
}

export function updateTemplate(id: string, payload: Partial<TemplatePayload>) {
  return axiosInstance.patch(`/templates/${id}/`, payload);
}

// Usage in Editor
const payload = await exportCanvasWithPayload(canvas, canvasJson);

if (payload.success) {
  const template = await saveTemplate({
    title: payload.title,
    image: payload.image,
    source: payload.source,
    metadata: payload.metadata,
  });

  console.log('Saved template:', template.id);
}
```

---

## Troubleshooting

### Problem: "Canvas not initialized"

```typescript
// Make sure canvas is passed correctly
const canvas = (window as any).__FABRIC_CANVAS__;
if (!canvas) {
  console.error('Canvas not found');
  return;
}
```

### Problem: CORS Error

```typescript
// Service handles this automatically
// But if you see CORS errors in console:
// 1. Check image sources in canvas
// 2. Ensure they support CORS
// 3. Check S3 CORS configuration
```

### Problem: S3 Upload Fails

```typescript
// Check:
// 1. AWS credentials valid
// 2. S3 bucket accessible
// 3. Network connection
// 4. File size limits

// Result: Falls back to dataUrl automatically
console.log('Fallback image:', result.image); // dataUrl
```

### Problem: Large Files

```typescript
// Reduce quality/resolution:
const blob = await exportCanvasToBlob(canvas, {
  quality: 0.6,
  multiplier: 1,
});

// Or compress before upload:
// import { compress } from 'image-conversion';
// const compressed = await compress(file, 0.6);
```

---

## Next Steps

1. **Test the export**

   ```bash
   npm run dev
   # Open editor and make changes
   # Check console for 🎨 export logs
   ```

2. **Verify S3 upload**

   - Check AWS S3 console
   - Confirm files appear in bucket
   - Test S3 URLs work

3. **Integrate API save**

   - Create backend `/templates/` endpoint
   - Update Editor to send payload
   - Store S3 URLs in database

4. **Add UI feedback**

   - Save status indicator
   - Upload progress bar
   - Success/error notifications

5. **Enhance further**
   - Template versioning
   - Multiple export formats
   - Batch operations
   - Real-time sync

---

## Support & Documentation

- 📖 [Full Documentation](./CANVAS_EXPORT_S3_UPLOAD_DOCUMENTATION.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 💻 [Source Code](./src/services/templateEditor/canvasExportService.ts)
- 🔧 [Editor Integration](./src/sections/@dashboard/templateEditor/components/Editor.tsx)

---

Happy exporting! 🎨
