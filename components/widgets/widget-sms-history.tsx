'use client';

import { useState } from 'react';
import { RiHistoryLine } from '@remixicon/react';

import { cnExt } from '@/utils/cn';
import * as Badge from '@/components/ui/badge';
import * as WidgetBox from '@/components/widget-box';

// Mock data for SMS history
const mockSmsHistory = [
  {
    id: 1,
    date: '2023-06-15',
    time: '14:30',
    recipients: 120,
    status: 'Teslim Edildi',
    message:
      "Yaz indirimimize katılın! 30 Haziran'a kadar tüm ürünlerde %20 indirim.",
  },
  {
    id: 2,
    date: '2023-06-10',
    time: '09:15',
    recipients: 85,
    status: 'Teslim Edildi',
    message: 'Siparişiniz gönderildi ve 2-3 iş günü içinde teslim edilecek.',
  },
  {
    id: 3,
    date: '2023-06-05',
    time: '16:45',
    recipients: 200,
    status: 'Kısmi',
    message:
      "Yarın saat 14:00'te dijital pazarlama stratejileri hakkındaki webinarımızı kaçırmayın.",
  },
  {
    id: 4,
    date: '2023-05-28',
    time: '11:20',
    recipients: 50,
    status: 'Başarısız',
    message: 'Randevunuz 5 Haziran Pazartesi saat 10:00 için onaylandı.',
  },
];

export default function WidgetSmsHistory({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <WidgetBox.Root className={className}>
      <WidgetBox.Header>
        <WidgetBox.HeaderIcon as={RiHistoryLine} />
        <span>SMS Geçmişi</span>
      </WidgetBox.Header>

      <div className='flex flex-col gap-3'>
        {mockSmsHistory.map((sms) => (
          <div
            key={sms.id}
            className='border border-stroke-soft-200 rounded-lg p-3 cursor-pointer hover:bg-bg-weak-50 transition-colors'
            onClick={() => toggleExpand(sms.id)}
          >
            <div className='flex justify-between items-center'>
              <div className='flex flex-col'>
                <span className='text-paragraph-sm font-medium'>
                  {sms.date} • {sms.time}
                </span>
                <span className='text-paragraph-xs text-text-sub-600'>
                  {sms.recipients} alıcı
                </span>
              </div>
              <Badge.Root
                variant={
                  sms.status === 'Teslim Edildi'
                    ? 'success'
                    : sms.status === 'Kısmi'
                      ? 'warning'
                      : 'error'
                }
                size='small'
              >
                {sms.status}
              </Badge.Root>
            </div>

            {expandedId === sms.id && (
              <div className='mt-3 pt-3 border-t border-stroke-soft-200'>
                <p className='text-paragraph-xs text-text-sub-600'>
                  {sms.message}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </WidgetBox.Root>
  );
}
