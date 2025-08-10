// app/api/upload/route.js - Upload API Route
import cloudinary from '@/app/lib/cloudinary';
import { NextResponse } from 'next/server';


export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const title = formData.get('title') || 'Untitled';
    const description = formData.get('description') || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large (max 5MB)' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'gallery',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Return image data for client-side Firestore save
    const imageData = {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      title,
      description,
      uploadedAt: new Date().toISOString(),
      size: uploadResponse.bytes,
      width: uploadResponse.width,
      height: uploadResponse.height
    };

    return NextResponse.json(imageData, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}







// import cloudinary from '@/app/lib/cloudinary';
// import { generateTagsFromImage } from '@/app/lib/tagGenerator';
//  // 👈 NEW
// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('image');
//     const title = formData.get('title') || 'Untitled';
//     const description = formData.get('description') || '';

//     if (!file) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     if (!file.type.startsWith('image/')) {
//       return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
//     }

//     if (buffer.length > 5 * 1024 * 1024) {
//       return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 });
//     }

//     const uploadResponse = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'image',
//           folder: 'gallery',
//           transformation: [
//             { width: 800, height: 600, crop: 'limit' },
//             { quality: 'auto' },
//             { fetch_format: 'auto' }
//           ]
//         },
//         (error, result) => {
//           if (error) {
//             console.error('Cloudinary upload error:', error);
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         }
//       ).end(buffer);
//     });

//     // ✅ NEW: Get AI-generated tags
//     const tags = await generateTagsFromImage(uploadResponse.secure_url);

//     // Add tags to image data
//     const imageData = {
//       url: uploadResponse.secure_url,
//       publicId: uploadResponse.public_id,
//       title,
//       description,
//       uploadedAt: new Date().toISOString(),
//       size: uploadResponse.bytes,
//       width: uploadResponse.width,
//       height: uploadResponse.height,
//       tags // 🆕
//     };
// console.log('Generated tags:', tags);
//     return NextResponse.json(imageData, { status: 200 });

//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }
