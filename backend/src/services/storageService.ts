import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../config/cloudStorage';

export const storageService = {
  async uploadToGCS(
    file: Express.Multer.File,
    folder: string
  ): Promise<{ url: string; key: string }> {
    if (!bucket) {
      // Fallback for development without GCS
      const key = `${folder}/${uuidv4()}-${file.originalname}`;
      return { url: `/uploads/${key}`, key };
    }

    const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return { url: publicUrl, key: fileName };
  },

  async deleteFromGCS(fileKey: string): Promise<void> {
    if (!bucket) return;
    await bucket.file(fileKey).delete();
  },
};
