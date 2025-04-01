import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabaseClient';

import { processImageWithGemini } from '@/lib/geminiImageProcess';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    // Gemini ile görüntüyü işle
    const result = await processImageWithGemini(image);

    // Sonuç string veya URL olabilir
    let imageUrl: string;

    // Result'ın tipine göre işlem yap
    if (typeof result === 'string') {
      // String sonuç, muhtemelen base64 veya URL
      imageUrl = result;
    } else if (result && typeof result === 'object') {
      // Object ise, imageUrl veya url alanı aramaya çalış
      if ('imageUrl' in result && typeof result.imageUrl === 'string') {
        imageUrl = result.imageUrl;
      } else if ('url' in result && typeof result.url === 'string') {
        imageUrl = result.url;
      } else {
        // Object'i string'e çevirmeyi dene
        imageUrl = String(result);
      }
    } else {
      throw new Error('Invalid result from image processing');
    }

    // Base64 verisi mi kontrol et
    if (imageUrl.startsWith('data:')) {
      // Base64'ü buffer'a çevir
      const parts = imageUrl.split(',');
      if (parts.length !== 2) {
        throw new Error('Invalid base64 image data');
      }

      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, 'base64');

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
    } else {
      // Zaten URL ise doğrudan döndür
      return NextResponse.json({ imageUrl });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 },
    );
  }
}
