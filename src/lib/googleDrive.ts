import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

async function getDriveService() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google Service Account credentials');
  }

  privateKey = privateKey.replace(/^"|"$/g, ''); 
  privateKey = privateKey.replace(/\\n/g, '\n'); 

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: SCOPES,
    });

    return google.drive({ version: 'v3', auth });
  } catch (err: any) {
    console.error('Failed to initialize Google Auth:', err.message);
    throw err;
  }
}

export async function uploadToDrive(base64Image: string, fileName: string, folderId: string) {
  try {
    const drive = await getDriveService();

    const content = base64Image.split(',')[1];
    const buffer = Buffer.from(content, 'base64');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'image/png',
      body: stream,
    };

    // เพิ่ม supportsAllDrives และข้ามการเช็ค Quota ของตัวบอทเอง
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true, 
    } as any);

    return response.data;
  } catch (error: any) {
    console.error('Google Drive Upload Error Detail:', error.response?.data || error.message);
    throw error;
  }
}

export async function getOrCreateFolder(parentFolderId: string, folderName: string) {
  try {
    const drive = await getDriveService();

    const response = await drive.files.list({
      q: `name = '${folderName}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    } as any);

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
      supportsAllDrives: true,
    } as any);

    return folder.data.id;
  } catch (error: any) {
    console.error('Google Drive Folder Error Detail:', error.response?.data || error.message);
    throw error;
  }
}
