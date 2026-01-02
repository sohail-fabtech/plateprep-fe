import axiosInstance from '../../utils/axios';

// ----------------------------------------------------------------------

/**
 * Presigned URL request payload
 */
export interface IPresignedUrlRequest {
  file: string; // S3 key/path for the file (e.g., "recipe_images/image_1234567890.jpg")
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
 * @param fileKey - S3 key/path for the file (e.g., "recipe_images/image_1234567890.jpg")
 * @returns Presigned URL response
 */
export async function getPresignedUrl(fileKey: string): Promise<IPresignedUrlResponse> {
  const response = await axiosInstance.post<IPresignedUrlResponse>('/presigned_url/request_upload/', {
    file: fileKey,
  });
  return response.data;
}

/**
 * Upload file to S3 using presigned URL
 * @param presignedUrl - Presigned URL from getPresignedUrl
 * @param file - File to upload
 * @param contentType - Content type of the file (e.g., "image/jpeg", "video/mp4")
 * @returns S3 URL (without query parameters)
 */
export async function uploadFileToS3(
  presignedUrl: string,
  file: File,
  contentType?: string
): Promise<string> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType || file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to S3: ${response.status} ${response.statusText}`);
  }

  // Extract the S3 URL (remove query parameters)
  const s3Url = presignedUrl.split('?')[0];
  return s3Url;
}

/**
 * Complete flow: Get presigned URL and upload file to S3
 * @param file - File to upload
 * @param fileKey - S3 key/path for the file (e.g., "recipe_images/image_1234567890.jpg")
 * @param contentType - Optional content type (defaults to file.type)
 * @returns S3 URL of the uploaded file
 */
export async function uploadFileWithPresignedUrl(
  file: File,
  fileKey: string,
  contentType?: string
): Promise<string> {
  // Step 1: Get presigned URL
  const { presigned_url } = await getPresignedUrl(fileKey);

  // Step 2: Upload file to S3
  const s3Url = await uploadFileToS3(presigned_url, file, contentType);

  return s3Url;
}

/**
 * Generate a unique file key for S3
 * @param folder - Folder path (e.g., "recipe_images", "recipe_videos")
 * @param fileName - Original file name
 * @returns Unique S3 key
 */
export function generateFileKey(folder: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const fileExtension = fileName.split('.').pop() || '';
  return `${folder}/${folder}_${timestamp}_${random}.${fileExtension}`;
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

