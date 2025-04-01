'use client';

import { useState } from 'react';
import { RiContactsBookLine, RiFileUploadLine } from '@remixicon/react';

import { cnExt } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as WidgetBox from '@/components/widget-box';

export default function WidgetImportContacts({
  className,
  onImport,
}: React.HTMLAttributes<HTMLDivElement> & {
  onImport?: (contacts: string[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Lütfen bir CSV dosyası seçin');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    // Simulate file processing
    setTimeout(() => {
      // In a real app, you would parse the CSV file here
      const mockContacts = [
        '+1234567890',
        '+2345678901',
        '+3456789012',
        '+4567890123',
        '+5678901234',
      ];

      setIsUploading(false);
      setFile(null);

      if (onImport) {
        onImport(mockContacts);
      }

      // Reset the file input
      const fileInput = document.getElementById(
        'contact-file',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 1500);
  };

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiContactsBookLine} />
        <span>Kişileri İçe Aktar</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <div>
          <label className='block mb-2 text-label-sm text-text-sub-600'>
            CSV Dosyası Yükle
          </label>
          <div className='border-2 border-dashed border-stroke-soft-200 rounded-lg p-4 text-center'>
            <input
              type='file'
              id='contact-file'
              accept='.csv'
              onChange={handleFileChange}
              className='hidden'
            />
            <label
              htmlFor='contact-file'
              className='cursor-pointer flex flex-col items-center justify-center gap-2'
            >
              <RiFileUploadLine className='size-8 text-text-sub-600' />
              <span className='text-paragraph-sm text-text-sub-600'>
                {file ? file.name : 'CSV dosyası seçmek için tıklayın'}
              </span>
              <span className='text-paragraph-xs text-text-soft-400'>
                Format: her satırda bir telefon numarası
              </span>
            </label>
          </div>
          {error && (
            <p className='mt-2 text-paragraph-xs text-error-base'>{error}</p>
          )}
        </div>

        <Button.Root
          variant='primary'
          mode='filled'
          size='medium'
          onClick={handleImport}
          disabled={!file || isUploading}
        >
          {isUploading ? 'İçe Aktarılıyor...' : 'Kişileri İçe Aktar'}
        </Button.Root>
      </div>
    </WidgetBox.Root>
  );
}
