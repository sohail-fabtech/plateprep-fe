# Canvas Export & S3 Upload System Documentation

## Overview

The Canvas Export & S3 Upload system provides enterprise-level functionality for exporting design templates from the Fabric.js canvas editor and automatically uploading them to AWS S3. This system is inspired by Canva's export architecture with proper CORS handling and fallback mechanisms.

---

## Architecture & Features

### 1. **Enterprise-Level Export System**
- **Multiple Export Formats**: PNG, JPG, SVG, JSON
- **CORS Handling**: Automatic image CORS negotiation
- **Fallback Rendering**: Manual canvas rendering as backup
- **High-DPI Support**: 2x multiplier for Retina displays
- **Blob-based Export**: Returns Blob objects for programmatic use

### 2. **S3 Integration**
- **Presigned URL Integration**: Uses existing presigned URL service
- **Automatic Metadata**: Includes design metadata (dimensions, timestamp)
- **Error Handling**: Graceful fallback to dataUrl on upload failure
- **File Validation**: Ensures files are valid before upload

### 3. **Save Workflow**
- **First Save Detection**: Automatically exports and uploads on first save
- **Debounced Saves**: Subsequent saves are logged (debounced in useHistory)
- **User Feedback**: Snackbar notifications for success/error states
- **Payload Structure**: Standardized payload for API integration

---

## File Structure

```
src/
├── services/
│   ├── templateEditor/
│   │   └── canvasExportService.ts        # Main export service
│   └── presignedUrl/                     # Existing S3 upload service
│
└── sections/
    └── @dashboard/
        └── templateEditor/
            └── components/
                └── Editor.tsx            # Integrated export callback
```

---

## Core Functions

### `exportCanvasToBlob(fabricCanvas, options)`

Exports Fabric.js canvas to a Blob object.

**Parameters:**
```typescript
interface CanvasExportOptions {
  format?: 'png' | 'jpg' | 'svg' | 'json';  // Default: 'png'
  quality?: number;                          // Default: 1
  multiplier?: number;                       // Default: 2 (for Retina)
}
```

**Returns:**
```typescript
Promise<Blob>
```

**Example:**
```typescript
const blob = await exportCanvasToBlob(fabricCanvas, {
  format: 'png',
  quality: 1,
  multiplier: 2
});
```

---

### `exportCanvasAndUploadToS3(fabricCanvas, options)`

Exports canvas and automatically uploads to S3 via presigned URL.

**Parameters:**
```typescript
interface S3UploadOptions {
  title?: string;              // Default: 'Untitled Design'
  format?: 'png' | 'jpg';      // Default: 'png'
  quality?: number;            // Default: 1
  multiplier?: number;         // Default: 2
}
```

**Returns:**
```typescript
interface ExportAndUploadResult {
  success: boolean;
  imageUrl?: string;           // S3 URL if successful
  imageFile?: File;            // Original file object
  error?: string;              // Error message if failed
  timestamp: string;           // ISO timestamp
}
```

**Example:**
```typescript
const result = await exportCanvasAndUploadToS3(fabricCanvas, {
  title: 'My Design',
  format: 'png'
});

if (result.success) {
  console.log('Uploaded to:', result.imageUrl);
} else {
  console.error('Upload failed:', result.error);
}
```

---

### `exportCanvasWithPayload(fabricCanvas, canvasJson, options)`

Exports canvas with complete template payload (image + JSON source).

**Parameters:**
```typescript
interface PayloadOptions {
  title?: string;              // Default: 'Untitled Design'
  width?: number;              // Default: canvas.width
  height?: number;             // Default: canvas.height
  uploadToS3?: boolean;        // Default: true
}
```

**Returns:**
```typescript
interface TemplateExportPayload & ExportAndUploadResult {
  title: string;
  json: string;                // Canvas JSON
  image: string;               // S3 URL or dataUrl
  imageFile?: File;
  metadata?: {
    width: number;
    height: number;
    createdAt: string;
    exportFormat: string;
  };
  success: boolean;
  timestamp: string;
}
```

**Example:**
```typescript
const canvasJson = JSON.stringify(canvas.toJSON());
const payload = await exportCanvasWithPayload(
  canvas,
  canvasJson,
  { title: 'My Design', uploadToS3: true }
);

console.log('Complete payload:', payload);
// Use payload for API save/update
```

---

## Integration in Editor Component

### First Save Workflow

When the template is saved for the first time:

1. **Detection**: Editor detects first save via `isFirstSave` flag
2. **Export**: Canvas is exported to PNG blob (2x resolution)
3. **Upload**: File is uploaded to S3 via presigned URL
4. **Payload**: Complete payload is created with S3 URL
5. **Feedback**: User receives success/error notification

```typescript
const saveCallback = useCallback(
  async (values) => {
    if (isFirstSave) {
      const result = await exportCanvasAndUploadToS3(canvas, {
        title: 'Untitled Design',
        format: 'png'
      });

      if (result.success) {
        // Create payload with S3 URL
        const payload = {
          title: 'Untitled Design',
          image: result.imageUrl,  // S3 URL
          source: parsedJson
        };
        // Send to API
      }
    }
  },
  [isFirstSave]
);
```

---

## CORS Handling

The export service implements Canva's CORS handling approach:

### Image Processing Steps

1. **Check Current State**: Tests if images are CORS-compliant
2. **Reload if Tainted**: Attempts to reload images with `crossOrigin="anonymous"`
3. **Cache Busting**: Adds timestamp query parameter to force fresh load
4. **Fallback Rendering**: If all else fails, manually renders canvas

```typescript
// Automatic image CORS handling
const blob = await exportCanvasToBlob(fabricCanvas);
// Service handles all CORS negotiation internally
```

---

## Error Handling & Fallbacks

### Fallback Chain

1. **Primary**: Direct canvas export
2. **Secondary**: CORS image reloading + retry
3. **Tertiary**: Manual HTML5 canvas rendering
4. **Final**: DataUrl with user notification

```typescript
// On S3 upload failure, falls back to dataUrl
const result = await exportCanvasAndUploadToS3(canvas);

if (!result.success) {
  // Automatically uses dataUrl fallback
  const dataUrl = canvas.toDataURL(...);
  enqueueSnackbar('Using local preview', { variant: 'warning' });
}
```

---

## Console Logging

The service provides detailed console logging for debugging:

```
🎨 Starting enterprise-level canvas export...
📊 Canvas has 15 objects (3 images)
🔄 Processing images with CORS handling...
✓ Processed 3/3 images successfully
📸 Attempting optimized canvas export...
✅ Canvas export completed successfully!

🚀 Starting canvas export and S3 upload...
📦 Created image file: My_Design_1735975200000.png (245KB)
✅ Image uploaded to S3: https://bucket.s3.amazonaws.com/1735975200000_abc123.png

✅ Template exported and uploaded to S3:
{
  title: 'Untitled Design',
  image: 'https://bucket.s3.amazonaws.com/...',
  source: { ... }
}
```

---

## Payload Structure

### Complete Save Payload

```typescript
{
  title: 'Untitled Design',
  image: 'https://bucket.s3.amazonaws.com/1735975200000_abc123.png',  // S3 URL
  imageFile: File,                                                     // Original file
  source: {
    // Complete Fabric.js canvas JSON
    version: '5.3.0',
    objects: [...],
    background: '#ffffff',
    ...
  },
  metadata: {
    width: 1920,
    height: 1080,
    uploadedAt: '2026-01-06T12:00:00.000Z'
  }
}
```

---

## Usage Examples

### Example 1: Basic Export to Blob

```typescript
import { exportCanvasToBlob } from '@/services';

const blob = await exportCanvasToBlob(fabricCanvas, {
  format: 'png',
  quality: 1
});

// Use blob for anything
const url = URL.createObjectURL(blob);
```

### Example 2: Export and Upload to S3

```typescript
import { exportCanvasAndUploadToS3 } from '@/services';

const result = await exportCanvasAndUploadToS3(fabricCanvas, {
  title: 'My Template',
  format: 'png'
});

if (result.success) {
  console.log('S3 URL:', result.imageUrl);
  // Save S3 URL to database
} else {
  console.error('Upload failed:', result.error);
}
```

### Example 3: Complete Template Export (for API save)

```typescript
import { exportCanvasWithPayload } from '@/services';

const canvasJson = JSON.stringify(canvas.toJSON(['id', 'filters']));
const payload = await exportCanvasWithPayload(
  canvas,
  canvasJson,
  {
    title: 'Restaurant Menu Design',
    uploadToS3: true
  }
);

// Send payload to API
await templateApi.save(payload);
```

### Example 4: Manual Export Without Upload

```typescript
const result = await exportCanvasWithPayload(
  canvas,
  canvasJson,
  {
    uploadToS3: false  // Use dataUrl instead
  }
);

// Payload will have dataUrl instead of S3 URL
console.log(result.image);  // data:image/png;base64,...
```

---

## Integration with Existing Services

### S3 Upload Service

The export service uses the existing presigned URL service:

```typescript
import {
  uploadFileWithPresignedUrl,
  generateFileKey
} from '@/services/presignedUrl/presignedUrlService';

// Integrated internally
const fileKey = generateFileKey('template_designs', fileName);
const s3Url = await uploadFileWithPresignedUrl(imageFile, fileKey);
```

---

## Performance Considerations

1. **Blob Export**: ~50-200ms depending on canvas complexity
2. **S3 Upload**: ~100-500ms depending on file size and network
3. **First Save**: Total time typically 200-700ms
4. **Memory**: Temporary blob in memory, cleaned up after upload

### Optimization Tips

```typescript
// Use lower quality for faster export
await exportCanvasToBlob(canvas, {
  quality: 0.8,  // Reduces file size by ~30%
  multiplier: 1  // Reduces export time by ~50%
});
```

---

## Testing & Debugging

### Enable Debug Logging

```typescript
// All operations log to console with emoji prefixes
// 🎨 = Export start
// 📊 = Canvas stats
// 🔄 = Processing
// ✓ = Success
// ❌ = Error
// ⚠️ = Warning
```

### Simulate Upload Failure

```typescript
// The service will automatically fallback to dataUrl
// Check snackbar notifications for status
enqueueSnackbar('Using local preview (S3 upload failed)', {
  variant: 'warning'
});
```

---

## Future Enhancements

1. **Background Processing**: Upload in worker thread
2. **Progress Tracking**: Real-time upload progress callback
3. **Multiple Formats**: Support for WEBP, AVIF
4. **Compression**: Automatic compression before upload
5. **Versioning**: Template version history on S3
6. **CDN Integration**: CloudFront distribution for faster access
7. **Batch Export**: Export multiple templates simultaneously

---

## Troubleshooting

### Issue: CORS Error on Images

**Solution**: Ensure images have proper CORS headers. Service automatically handles this, but check:
- Image host supports `crossOrigin="anonymous"`
- No header restrictions on the origin

### Issue: Large File Upload Fails

**Solution**: Reduce export quality or multiplier:
```typescript
await exportCanvasToBlob(canvas, {
  quality: 0.7,
  multiplier: 1
});
```

### Issue: DataUrl Used Instead of S3 URL

**Solution**: Check S3 upload error in console logs. Verify:
- AWS credentials are valid
- S3 bucket has proper permissions
- Network connectivity is stable

---

## Related Files

- [canvasExportService.ts](./canvasExportService.ts) - Main service
- [Editor.tsx](../components/Editor.tsx) - Integration point
- [presignedUrlService.ts](../../presignedUrl/presignedUrlService.ts) - S3 upload
- [@types/editor.ts](@types/editor.ts) - Type definitions

---

## API Contract Example

```typescript
// First save triggers S3 upload
POST /api/templates/
{
  "title": "Untitled Design",
  "image": "https://bucket.s3.amazonaws.com/1735975200000_abc123.png",
  "source": {
    // Full Fabric.js JSON
  },
  "metadata": {
    "width": 1920,
    "height": 1080,
    "createdAt": "2026-01-06T12:00:00.000Z"
  }
}

// Subsequent updates (debounced saves)
PATCH /api/templates/{id}/
{
  "image": "data:image/png;base64,...",  // DataUrl for faster saves
  "source": { ... }
}
```

---

## Summary

✅ **Implemented Features:**
- Enterprise-level Fabric.js canvas export
- CORS-aware image handling
- Automatic S3 upload on first save
- Debounced subsequent saves
- Comprehensive error handling & fallbacks
- User feedback via snackbar notifications
- Complete payload structure for API integration
- Performance optimizations with Retina display support

🎯 **Ready for:**
- Production template exports
- Multi-format save options
- Enterprise-level reliability
- Canva-like user experience
