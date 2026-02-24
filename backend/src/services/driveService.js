import { env } from '../config/env.js';
import { driveClient } from './googleClient.js';

export async function uploadReceipt(file) {
  const response = await driveClient.files.create({
    requestBody: {
      name: file.originalname,
      parents: env.googleDriveFolderId ? [env.googleDriveFolderId] : undefined
    },
    media: {
      mimeType: file.mimetype,
      body: Buffer.from(file.buffer)
    },
    fields: 'id,webViewLink'
  });

  await driveClient.permissions.create({
    fileId: response.data.id,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  return response.data.webViewLink;
}
