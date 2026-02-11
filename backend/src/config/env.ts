import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpBucketName: process.env.GCP_BUCKET_NAME,
  gcpServiceAccountPath: process.env.GCP_SERVICE_ACCOUNT_PATH,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
