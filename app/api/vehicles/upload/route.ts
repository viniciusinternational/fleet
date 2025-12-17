import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No images provided',
        },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} is too large. Maximum size is 5MB`,
          },
          { status: 400 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'vehicles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Process and save files
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop();
      const filename = `vehicle-${timestamp}-${randomString}.${extension}`;
      
      // Save file
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      
      // Store file info
      uploadedFiles.push({
        id: `img-${timestamp}-${i}`,
        url: `/uploads/vehicles/${filename}`,
        alt: `Vehicle image ${i + 1}`,
        caption: file.name,
        isPrimary: i === 0,
        originalName: file.name,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        images: uploadedFiles,
        count: uploadedFiles.length,
      },
      message: 'Images uploaded successfully',
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload images',
      },
      { status: 500 }
    );
  }
}
