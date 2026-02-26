import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { bucket } from '../config/cloudStorage';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const storageService = {
  async uploadToGCS(
    file: Express.Multer.File,
    folder: string
  ): Promise<{ url: string; key: string }> {
    if (!bucket) {
      // Fallback for development without GCS — save to local disk
      const key = `${folder}/${uuidv4()}-${file.originalname}`;
      const filePath = path.join(UPLOADS_DIR, key);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.buffer);
      return { url: `/uploads/${key}`, key };
    }

    const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      // public: true removed — bucket uses Uniform Bucket-Level Access (UBA),
      // per-object ACLs are disabled. Public access is controlled via bucket IAM.
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return { url: publicUrl, key: fileName };
  },

  async deleteFromGCS(fileKey: string): Promise<void> {
    if (!bucket) {
      // Delete local file in development
      const filePath = path.join(UPLOADS_DIR, fileKey);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }
    await bucket.file(fileKey).delete();
  },
};
