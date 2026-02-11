import { Storage } from '@google-cloud/storage';
import { env } from './env';

let storage: Storage | null = null;
let bucket: ReturnType<Storage['bucket']> | null = null;

if (env.gcpProjectId && env.gcpServiceAccountPath) {
  storage = new Storage({
    projectId: env.gcpProjectId,
    keyFilename: env.gcpServiceAccountPath,
  });
  bucket = storage.bucket(env.gcpBucketName!);
}

export { storage, bucket };
