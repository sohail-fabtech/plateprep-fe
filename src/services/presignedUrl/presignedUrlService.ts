import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

/**
 * Presigned URL request payload
 */
export interface IPresignedUrlRequest {
  file: string; // Filename only (e.g., "1767382810316.mov") - backend expects no folder path
}

/**
 * Presigned URL response
 */
export interface IPresignedUrlResponse {
  presigned_url: string; // URL to upload the file to S3 (expires in 60 minutes)
  expires_in: string; // Expiration time (e.g., "60 minutes")
  key: string; // The S3 key/path you provided
}

/**
 * Get presigned URL for file upload
 * @param fileKey - Filename only (e.g., "1767382810316.mov") - backend expects no folder path
 * @returns Presigned URL response
 */
export async function getPresignedUrl(fileKey: string): Promise<IPresignedUrlResponse> {
  const response = await axiosInstance.post<IPresignedUrlResponse>('/presigned_url/request_upload/', {
    file: fileKey,
  });
  return response.data;
}

/**
 * Construct S3 URL from presigned URL and key
 * Backend expects only the filename (no folder path) in the URL
 * Format: https://bucket.s3.amazonaws.com/filename.ext (not https://bucket.s3.amazonaws.com/folder/filename.ext)
 * @param presignedUrl - Presigned URL from getPresignedUrl
 * @param s3Key - The filename (e.g., "1767382810316.mov") - already just filename, no folder path
 * @returns S3 URL with only filename (e.g., "https://bucket.s3.amazonaws.com/1767382810316.mov")
 */
export function constructS3Url(presignedUrl: string, s3Key: string): string {
  // Remove query parameters from presigned URL
  const baseUrl = presignedUrl.split('?')[0];
  
  // s3Key is already just the filename (no folder path)
  // But handle case where it might have a path (backward compatibility)
  const filename = s3Key.split('/').pop() || s3Key;
  
  // Find where .amazonaws.com is in the URL
  const amazonawsIndex = baseUrl.indexOf('.amazonaws.com');
  
  if (amazonawsIndex > 0) {
    // Get everything up to and including .amazonaws.com
    const bucketDomain = baseUrl.substring(0, amazonawsIndex + '.amazonaws.com'.length);
    // Construct the URL with only the filename (no folder path)
    // Format: https://bucket.s3.amazonaws.com/filename.ext
    return `${bucketDomain}/${filename}`;
  }
  
  // Fallback: try to extract bucket domain from URL structure
  const urlParts = baseUrl.split('/');
  for (let i = 0; i < urlParts.length; i++) {
    if (urlParts[i].includes('.amazonaws.com')) {
      const bucketDomain = urlParts.slice(0, i + 1).join('/');
      return `${bucketDomain}/${filename}`;
    }
  }
  
  // Last resort: return the base URL (shouldn't happen with valid S3 URLs)
  return baseUrl;
}

/**
 * Upload file to S3 using presigned URL with progress tracking
 * @param presignedUrl - Presigned URL from getPresignedUrl
 * @param file - File to upload
 * @param contentType - Content type of the file (e.g., "image/jpeg", "video/mp4")
 * @param s3Key - The filename (e.g., "1767382810316.mov") - used to construct correct URL
 * @param onProgress - Optional progress callback (0-100)
 * @returns S3 URL (without query parameters, with only filename)
 */
export async function uploadFileToS3(
  presignedUrl: string,
  file: File,
  contentType?: string,
  s3Key?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        // Construct the correct S3 URL using the key
        if (s3Key) {
          resolve(constructS3Url(presignedUrl, s3Key));
        } else {
          resolve(presignedUrl.split('?')[0]);
        }
      } else {
        reject(new Error(`Failed to upload file to S3: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Failed to upload file to S3: Network error'));
    });

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

/**
 * Complete flow: Get presigned URL and upload file to S3
 * @param file - File to upload
 * @param fileKey - Filename only (e.g., "1767382810316.mov") - backend expects no folder path
 * @param contentType - Optional content type (defaults to file.type)
 * @param onProgress - Optional progress callback (0-100)
 * @returns S3 URL of the uploaded file (with only filename, no folder path)
 */
export async function uploadFileWithPresignedUrl(
  file: File,
  fileKey: string,
  contentType?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Get presigned URL (response includes the key)
  const { presigned_url, key } = await getPresignedUrl(fileKey);

  // Step 2: Upload file to S3 (pass the key to ensure correct URL construction)
  const s3Url = await uploadFileToS3(presigned_url, file, contentType, key || fileKey, onProgress);

  return s3Url;
}

/**
 * Generate a unique file key for S3
 * Backend expects only the filename (no folder path) when requesting presigned URL
 * @param folder - Folder path (e.g., "recipe_images", "recipe_videos") - used for organization but not in the key
 * @param fileName - Original file name
 * @returns Unique filename (e.g., "1767382810316.mov")
 */
export function generateFileKey(folder: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const fileExtension = fileName.split('.').pop() || '';
  // Return only filename (no folder path) as backend expects
  return `${timestamp}_${random}.${fileExtension}`;
}

/**
 * Upload multiple files to S3
 * @param files - Array of files to upload
 * @param folder - Folder path (e.g., "recipe_images")
 * @returns Array of S3 URLs
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => {
    const fileKey = generateFileKey(folder, file.name);
    return uploadFileWithPresignedUrl(file, fileKey);
  });

  return Promise.all(uploadPromises);
}

