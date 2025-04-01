import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabaseClient';

import { processImageWithGemini } from '@/lib/geminiImageProcess';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    // Gemini ile görüntüyü işle
    const processedImage = await processImageWithGemini(image);

    // Base64'ü buffer'a çevir
    const buffer = Buffer.from(processedImage.split(',')[1], 'base64');

    // Dosya adı oluştur
    const fileName = `result_${Date.now()}.jpg`;

    // Supabase'e yükle
    const { data, error } = await supabase.storage
      .from('results')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    // Public URL al
    const {
      data: { publicUrl },
    } = supabase.storage.from('products').getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 },
    );
  }
}
