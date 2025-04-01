'use client';

import { useState } from 'react';
import { RiMagicLine, RiSendPlaneLine } from '@remixicon/react';

import { cnExt } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as Textarea from '@/components/ui/textarea';
import * as WidgetBox from '@/components/widget-box';

export default function WidgetJewelryPrompt({
  className,
  onGenerate,
  isImageUploaded = false,
}: React.HTMLAttributes<HTMLDivElement> & {
  onGenerate?: (prompt: string) => void;
  isImageUploaded?: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim()) {
      setError(null);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError('Lütfen bir yönerge girin');
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);

      if (onGenerate) {
        onGenerate(prompt);
      }
    }, 1000);
  };

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiMagicLine} />
        <span>Rötuş Yönergesi</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <div>
          <label className='block mb-2 text-label-sm text-text-sub-600'>
            Yönerge
          </label>
          <Textarea.Root
            placeholder='Örn: Takının parlaklığını artır, arka planı beyaza çevir, gölgeleri yumuşat...'
            value={prompt}
            onChange={handlePromptChange}
            className='min-h-[100px]'
          />
          {error && (
            <p className='mt-2 text-paragraph-xs text-error-base'>{error}</p>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <Button.Root
            variant='primary'
            mode='filled'
            size='medium'
            onClick={handleGenerate}
            disabled={!isImageUploaded || isGenerating}
          >
            <Button.Icon as={RiSendPlaneLine} />
            {isGenerating ? 'İşleniyor...' : 'Rötuşla'}
          </Button.Root>

          {!isImageUploaded && (
            <p className='text-paragraph-xs text-warning-base text-center'>
              Önce bir fotoğraf yüklemelisiniz
            </p>
          )}
        </div>

        <div className='border-t border-stroke-soft-200 pt-4 mt-2'>
          <div className='text-label-xs text-text-sub-600 mb-2'>
            Örnek Yönergeler:
          </div>
          <div className='space-y-2'>
            <div
              className='text-paragraph-xs text-text-sub-600 cursor-pointer hover:text-primary-base'
              onClick={() =>
                setPrompt(
                  'Takının parlaklığını ve kontrastını artır, arka planı beyaz yap.',
                )
              }
            >
              • Takının parlaklığını ve kontrastını artır, arka planı beyaz yap.
            </div>
            <div
              className='text-paragraph-xs text-text-sub-600 cursor-pointer hover:text-primary-base'
              onClick={() =>
                setPrompt(
                  'Takıdaki çizik ve lekeleri temizle, metalik parlaklığı güçlendir.',
                )
              }
            >
              • Takıdaki çizik ve lekeleri temizle, metalik parlaklığı
              güçlendir.
            </div>
            <div
              className='text-paragraph-xs text-text-sub-600 cursor-pointer hover:text-primary-base'
              onClick={() =>
                setPrompt(
                  'Taşların parlaklığını artır, yansımaları güçlendir, arka planı profesyonel gör yap.',
                )
              }
            >
              • Taşların parlaklığını artır, yansımaları güçlendir, arka planı
              profesyonel gör yap.
            </div>
          </div>
        </div>
      </div>
    </WidgetBox.Root>
  );
}
