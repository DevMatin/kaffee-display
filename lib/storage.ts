import { supabase } from './supabase';
import { logger } from './logger';

const STORAGE_BUCKET = 'images';

export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex((part) => part === STORAGE_BUCKET);
    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      return null;
    }
    return pathParts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}

export async function uploadImage(file: File, folder: string, fileName?: string): Promise<string> {
  const startTime = performance.now();
  try {
    if (!file || file.size === 0) {
      throw new Error('Datei ist leer');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`Datei ist zu groß (max. ${maxSize / 1024 / 1024}MB)`);
    }

    const fileExt = file.name.split('.').pop();
    if (!fileExt) {
      throw new Error('Dateiendung konnte nicht ermittelt werden');
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const finalFileName = fileName || `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${folder}/${finalFileName}`;

    logger.debug('Uploading image', { filePath, size: file.size, type: file.type });

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      logger.error('Error uploading image', error);
      
      if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist')) {
        throw new Error(`Storage-Bucket "${STORAGE_BUCKET}" existiert nicht. Bitte erstelle den Bucket in Supabase.`);
      }
      
      if (error.message?.includes('new row violates row-level security')) {
        throw new Error('Fehlende Berechtigungen. Bitte prüfe die Storage-Policies in Supabase.');
      }
      
      throw new Error(error.message || 'Fehler beim Hochladen');
    }

    if (!data) {
      throw new Error('Upload erfolgreich, aber keine Daten zurückgegeben');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Konnte öffentliche URL nicht generieren');
    }

    logger.debug('Image uploaded successfully', { filePath, publicUrl });

    const duration = Math.round(performance.now() - startTime);
    logger.query('storage', 'upload', duration, { filePath });

    return publicUrl;
  } catch (error: any) {
    logger.error('Failed to upload image', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || 'Unbekannter Fehler beim Hochladen');
  }
}

export async function deleteImage(url: string): Promise<void> {
  const startTime = performance.now();
  try {
    const filePath = extractPathFromUrl(url);
    if (!filePath) {
      logger.debug('Could not extract path from URL, skipping delete', { url });
      return;
    }

    logger.debug('Deleting image', { filePath });

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

    if (error) {
      logger.error('Error deleting image', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('storage', 'delete', duration, { filePath });
  } catch (error) {
    logger.error('Failed to delete image', error);
    throw error;
  }
}

