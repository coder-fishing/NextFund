/**
 * Image Upload Service using Cloudinary
 * Free tier: 25GB storage + 25GB bandwidth/month
 */

const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
  "NextFund";
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    "dzivajta9";

type CloudinaryUploadResponse = {
  secure_url: string;
};

type OptimizeOptions = {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
};

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  // Check if Cloudinary is configured
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file');
  }

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'products'); // Organize in products folder

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data: CloudinaryUploadResponse = await response.json();
    
    // Return optimized URL with auto format and quality
    return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getOptimizedImageUrl = (
  url: string,
  options: OptimizeOptions = {}
): string => {
  const {
    width = 800,
    height = 800,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  // Add transformations to Cloudinary URL
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_${crop},f_${format},q_${quality}/`
  );
};

/**
 * Delete image from Cloudinary (requires backend with API key)
 * Note: This requires server-side implementation for security
 */
export const deleteImage = async (publicId: string): Promise<never> => {
  // This should be implemented on your backend
  console.warn('Attempted delete for publicId:', publicId);
  console.warn('Image deletion should be handled by backend');
  throw new Error('Image deletion requires backend implementation');
};