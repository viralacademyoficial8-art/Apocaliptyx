import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  duration?: number;
  width?: number;
  height?: number;
  bytes: number;
  thumbnail_url?: string;
  playback_url?: string;
}

export interface UploadOptions {
  folder?: string;
  resource_type?: 'video' | 'image' | 'raw' | 'auto';
  transformation?: object[];
  eager?: object[];
  eager_async?: boolean;
  public_id?: string;
}

class CloudinaryService {
  /**
   * Upload a video file to Cloudinary
   * Optimized for Reels with automatic compression and thumbnail generation
   */
  async uploadVideo(
    file: Buffer | string,
    options: UploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    const defaultOptions = {
      folder: 'apocaliptyx/reels',
      resource_type: 'video' as const,
      // Eager transformations run in background for faster response
      eager_async: true,
    };

    const uploadOptions = { ...defaultOptions, ...options };

    try {
      // Use upload_stream for Buffer (more efficient for large files)
      if (Buffer.isBuffer(file)) {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload stream error:', error);
                reject(new Error(`Failed to upload video: ${error.message}`));
                return;
              }
              if (!result) {
                reject(new Error('No result from Cloudinary'));
                return;
              }
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                url: result.url,
                format: result.format,
                resource_type: result.resource_type,
                duration: result.duration,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                thumbnail_url: this.generateThumbnailUrl(result.public_id),
                playback_url: this.generatePlaybackUrl(result.public_id),
              });
            }
          );
          uploadStream.end(file);
        });
      }

      // For URL strings, use regular upload
      const result = await cloudinary.uploader.upload(file, uploadOptions);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        duration: result.duration,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        thumbnail_url: this.generateThumbnailUrl(result.public_id),
        playback_url: this.generatePlaybackUrl(result.public_id),
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload video to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload a video from a URL
   */
  async uploadVideoFromUrl(
    url: string,
    options: UploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    return this.uploadVideo(url, options);
  }

  /**
   * Generate an optimized thumbnail URL for a video
   */
  generateThumbnailUrl(publicId: string, options: {
    width?: number;
    height?: number;
    startOffset?: string;
  } = {}): string {
    const { width = 720, height = 1280, startOffset = '0' } = options;

    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width, height, crop: 'fill', gravity: 'auto' },
        { start_offset: startOffset },
      ],
    });
  }

  /**
   * Generate an optimized playback URL for a video
   * Uses adaptive streaming for better performance
   */
  generatePlaybackUrl(publicId: string, options: {
    quality?: string;
    format?: string;
  } = {}): string {
    const { quality = 'auto', format = 'mp4' } = options;

    return cloudinary.url(publicId, {
      resource_type: 'video',
      format,
      transformation: [
        { quality },
        { fetch_format: 'auto' },
      ],
    });
  }

  /**
   * Generate a URL with specific transformations
   */
  generateTransformedUrl(publicId: string, transformations: object[]): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: transformations,
    });
  }

  /**
   * Delete a video from Cloudinary
   */
  async deleteVideo(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  /**
   * Get video details from Cloudinary
   */
  async getVideoDetails(publicId: string): Promise<CloudinaryUploadResult | null> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'video',
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        duration: result.duration,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        thumbnail_url: this.generateThumbnailUrl(result.public_id),
        playback_url: this.generatePlaybackUrl(result.public_id),
      };
    } catch (error) {
      console.error('Cloudinary get details error:', error);
      return null;
    }
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }
}

export const cloudinaryService = new CloudinaryService();
