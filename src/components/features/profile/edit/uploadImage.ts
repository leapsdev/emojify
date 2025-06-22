'use server';

import { type UploadApiResponse, v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 環境に応じたフォルダ名を設定
const CLOUDINARY_FOLDER = process.env.NODE_ENV === 'production' 
  ? 'emoji-chat/profiles' 
  : 'emoji-chat-dev/profiles';

export type UploadResult = {
  status: 'success' | 'error';
  message: string;
  url?: string;
};

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return {
        status: 'error',
        message: 'No file selected.',
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: CLOUDINARY_FOLDER,
            transformation: [
              { width: 256, height: 256, crop: 'fill' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error || new Error('Upload result is empty'));
              return;
            }
            resolve(uploadResult);
          },
        )
        .end(buffer);
    });

    if (!result || typeof result !== 'object' || !('secure_url' in result)) {
      return {
        status: 'error',
        message: 'An error occurred during upload.',
      };
    }

    return {
      status: 'success',
      message: 'Upload completed successfully.',
      url: result.secure_url,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'An error occurred during upload.',
    };
  }
}
