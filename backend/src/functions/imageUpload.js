const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.IMAGES_BUCKET;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body);
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return createResponse(400, { error: 'fileName and fileType are required' });
    }

    // Validate file type (only allow images)
    if (!fileType.startsWith('image/')) {
      return createResponse(400, { error: 'Only image files are allowed' });
    }

    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `recipe-images/${timestamp}-${sanitizedFileName}`;

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // Construct the public URL for the uploaded file
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-west-2'}.amazonaws.com/${key}`;

    return createResponse(200, {
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return createResponse(500, { error: 'Failed to generate upload URL' });
  }
};
