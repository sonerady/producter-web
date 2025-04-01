'use client';

import { useState } from 'react';
import { RiMessage2Line, RiSendPlaneLine } from '@remixicon/react';

import { cnExt } from '@/utils/cn';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Textarea from '@/components/ui/textarea';
import { PhoneNumberInput } from '@/components/phone-number-input';
import * as WidgetBox from '@/components/widget-box';

export default function WidgetBulkSMS({
  className,
  initialRecipients = [],
}: React.HTMLAttributes<HTMLDivElement> & {
  initialRecipients?: string[];
}) {
  const [recipients, setRecipients] = useState<string[]>(initialRecipients);
  const [newRecipient, setNewRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleSendSMS = () => {
    if (recipients.length === 0 || !message) return;

    setIsSending(true);

    // Simulate sending SMS
    setTimeout(() => {
      setIsSending(false);
      setRecipients([]);
      setMessage('');
      // In a real app, you would call an API here
      alert(`${recipients.length} alıcıya SMS gönderildi!`);
    }, 1500);
  };

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiMessage2Line} />
        <span>Toplu SMS</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-4'>
        <div>
          <label className='block mb-2 text-label-sm text-text-sub-600'>
            Alıcı Ekle
          </label>
          <div className='flex gap-2'>
            <div className='flex-grow'>
              <PhoneNumberInput
                value={newRecipient}
                onChange={setNewRecipient}
              />
            </div>
            <Button.Root
              variant='primary'
              mode='filled'
              size='medium'
              onClick={handleAddRecipient}
              disabled={!newRecipient}
            >
              Ekle
            </Button.Root>
          </div>
        </div>

        {recipients.length > 0 && (
          <div>
            <label className='block mb-2 text-label-sm text-text-sub-600'>
              Alıcılar ({recipients.length})
            </label>
            <div className='flex flex-wrap gap-2 p-2 border border-stroke-soft-200 rounded-lg max-h-24 overflow-y-auto'>
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className='flex items-center gap-1 px-2 py-1 bg-bg-weak-50 rounded-md'
                >
                  <span className='text-paragraph-xs'>{recipient}</span>
                  <button
                    onClick={() => handleRemoveRecipient(index)}
                    className='text-text-sub-600 hover:text-error-base'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className='block mb-2 text-label-sm text-text-sub-600'>
            Mesaj
          </label>
          <div className='relative'>
            <Textarea.Root>
              <Textarea.Textarea
                placeholder='Mesajınızı buraya yazın...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='min-h-[120px]'
                simple
              />
            </Textarea.Root>
            <div className='absolute bottom-2 right-3 text-xs text-text-soft-400'>
              {message.length}/160
            </div>
          </div>
        </div>

        <Button.Root
          variant='primary'
          mode='filled'
          size='medium'
          className='mt-2'
          onClick={handleSendSMS}
          disabled={recipients.length === 0 || !message || isSending}
        >
          <Button.Icon as={RiSendPlaneLine} />
          {isSending ? 'Gönderiliyor...' : 'SMS Gönder'}
        </Button.Root>
      </div>
    </WidgetBox.Root>
  );
}
