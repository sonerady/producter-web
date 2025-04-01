'use client';

import { useState } from 'react';
import { RiImageLine, RiUpload2Line } from '@remixicon/react';

import { cnExt } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as WidgetBox from '@/components/widget-box';

export default function WidgetPhotoUpload({
  className,
  onUpload,
}: React.HTMLAttributes<HTMLDivElement> & {
  onUpload?: (image: File) => void;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Lütfen bir görsel dosyası seçin (JPEG, PNG)');
        setImage(null);
        setPreviewUrl(null);
        return;
      }
      setImage(selectedFile);
      setError(null);

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!image) return;

    setIsUploading(true);
    setError(null);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);

      if (onUpload) {
        onUpload(image);
      }

      // Reset file input if needed
      // Keeping the preview to show the uploaded image
    }, 1500);
  };

  const resetUpload = () => {
    setImage(null);
    setPreviewUrl(null);
    setError(null);

    // Reset the file input
    const fileInput = document.getElementById(
      'jewelry-image',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiImageLine} />
        <span>Fotoğraf Yükle</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <div>
          <label className='block mb-2 text-label-sm text-text-sub-600'>
            Takı Fotoğrafı
          </label>
          <div
            className={`border-2 border-dashed border-stroke-soft-200 rounded-lg p-4 text-center ${
              previewUrl ? 'relative overflow-hidden' : ''
            }`}
            style={{ minHeight: '200px' }}
          >
            <input
              type='file'
              id='jewelry-image'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
            />

            {previewUrl ? (
              <div className='flex flex-col items-center'>
                <div className='relative w-full h-52 mb-4'>
                  <img
                    src={previewUrl}
                    alt='Takı önizleme'
                    className='h-full mx-auto object-contain'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button.Root
                    variant='neutral'
                    mode='stroke'
                    size='xsmall'
                    onClick={resetUpload}
                  >
                    Değiştir
                  </Button.Root>
                </div>
              </div>
            ) : (
              <label
                htmlFor='jewelry-image'
                className='cursor-pointer flex flex-col items-center justify-center gap-2 h-40'
              >
                <RiUpload2Line className='size-8 text-text-sub-600' />
                <span className='text-paragraph-sm text-text-sub-600'>
                  Fotoğraf yüklemek için tıklayın
                </span>
                <span className='text-paragraph-xs text-text-soft-400'>
                  Önerilen: JPEG veya PNG, min. 800x800px
                </span>
              </label>
            )}
          </div>
          {error && (
            <p className='mt-2 text-paragraph-xs text-error-base'>{error}</p>
          )}
        </div>

        <Button.Root
          variant='primary'
          mode='filled'
          size='medium'
          onClick={handleUpload}
          disabled={!image || isUploading}
        >
          {isUploading ? 'Yükleniyor...' : 'Fotoğrafı Yükle'}
        </Button.Root>
      </div>
    </WidgetBox.Root>
  );
}
