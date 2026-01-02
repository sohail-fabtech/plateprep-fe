import { useMutation } from '@tanstack/react-query';
import {
  getPresignedUrl,
  uploadFileToS3,
  uploadFileWithPresignedUrl,
  uploadMultipleFiles,
  IPresignedUrlResponse,
} from './presignedUrlService';

// ----------------------------------------------------------------------

/**
 * Query key factory for presigned URLs
 */
export const presignedUrlKeys = {
  all: ['presignedUrl'] as const,
};

/**
 * Hook to get presigned URL
 */
export function useGetPresignedUrl() {
  return useMutation({
    mutationFn: (fileKey: string) => getPresignedUrl(fileKey),
  });
}

/**
 * Hook to upload file to S3 using presigned URL
 */
export function useUploadFileToS3() {
  return useMutation({
    mutationFn: ({
      presignedUrl,
      file,
      contentType,
    }: {
      presignedUrl: string;
      file: File;
      contentType?: string;
    }) => uploadFileToS3(presignedUrl, file, contentType),
  });
}

/**
 * Hook to upload file with presigned URL (complete flow)
 */
export function useUploadFileWithPresignedUrl() {
  return useMutation({
    mutationFn: ({
      file,
      fileKey,
      contentType,
    }: {
      file: File;
      fileKey: string;
      contentType?: string;
    }) => uploadFileWithPresignedUrl(file, fileKey, contentType),
  });
}

/**
 * Hook to upload multiple files
 */
export function useUploadMultipleFiles() {
  return useMutation({
    mutationFn: ({
      files,
      folder,
    }: {
      files: File[];
      folder: string;
    }) => uploadMultipleFiles(files, folder),
  });
}

