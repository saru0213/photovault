// app/api/delete-cloudinary/route.js - Delete from Cloudinary API Route

import cloudinary from '@/app/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID required' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json(
      { message: 'Image deleted from Cloudinary' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete from Cloudinary' },
      { status: 500 }
    );
  }
}
