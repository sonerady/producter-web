'use client';

import { useState } from 'react';
import { RiCheckLine, RiDownloadLine, RiImageLine } from '@remixicon/react';

import { cnExt } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as WidgetBox from '@/components/widget-box';

export default function WidgetJewelryResult({
  className,
  resultImageUrl,
  isLoading = false,
}: React.HTMLAttributes<HTMLDivElement> & {
  resultImageUrl?: string | null;
  isLoading?: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = () => {
    if (!resultImageUrl) return;

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = resultImageUrl;
    link.download = `retouched-jewelry-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    if (!resultImageUrl) return;

    try {
      // Fetch the image and convert to blob
      const response = await fetch(resultImageUrl);
      const blob = await response.blob();

      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image: ', err);
    }
  };

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiImageLine} />
        <span>Rötuşlanmış Görsel</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <div className='min-h-[200px] border rounded-lg flex items-center justify-center'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center h-52 text-text-soft-400'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base mb-2'></div>
              <span className='text-paragraph-sm'>Rötuşlanıyor...</span>
            </div>
          ) : resultImageUrl ? (
            <div className='p-4 w-full'>
              <img
                src={resultImageUrl}
                alt='Rötuşlanmış takı'
                className='h-52 mx-auto object-contain'
              />
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-52 text-text-soft-400'>
              <RiImageLine className='size-8 mb-2' />
              <span className='text-paragraph-sm'>Henüz sonuç yok</span>
              <span className='text-paragraph-xs'>
                Fotoğraf yükleyip rötuşlamayı deneyin
              </span>
            </div>
          )}
        </div>

        {resultImageUrl && !isLoading && (
          <div className='flex gap-2 flex-wrap'>
            <Button.Root
              variant='primary'
              mode='filled'
              size='small'
              onClick={handleDownload}
            >
              <Button.Icon as={RiDownloadLine} />
              İndir
            </Button.Root>
            <Button.Root
              variant={isCopied ? 'primary' : 'neutral'}
              mode='stroke'
              size='small'
              onClick={handleCopyToClipboard}
              className={
                isCopied
                  ? 'bg-success-alpha-10 text-success-base ring-success-base hover:bg-success-alpha-10 hover:ring-success-base'
                  : ''
              }
            >
              <Button.Icon as={isCopied ? RiCheckLine : RiDownloadLine} />
              {isCopied ? 'Kopyalandı!' : 'Panoya Kopyala'}
            </Button.Root>
          </div>
        )}
      </div>
    </WidgetBox.Root>
  );
}
