import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

export const uploadMultiple = upload.array('images', 10);

// Chat file upload — images, videos + documents
const chatAllowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const chatFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (chatAllowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed: JPEG, PNG, WebP, HEIC, MP4, MOV, AVI, WebM, PDF, DOCX, XLSX'));
  }
};

const chatUpload = multer({
  storage,
  fileFilter: chatFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (videos can be large)
  },
});

export const chatUploadSingle = chatUpload.single('file');
