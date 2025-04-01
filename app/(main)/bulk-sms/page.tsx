'use client';

import { useState } from 'react';

import * as Avatar from '@/components/ui/avatar';
import Header from '@/components/header';
import { MoveMoneyButton } from '@/components/move-money-button';
import WidgetBulkSMS from '@/components/widgets/widget-bulk-sms';
import WidgetImportContacts from '@/components/widgets/widget-import-contacts';
import WidgetSmsHistory from '@/components/widgets/widget-sms-history';

export default function PageBulkSMS() {
  const [recipients, setRecipients] = useState<string[]>([]);

  const handleImportContacts = (contacts: string[]) => {
    setRecipients((prev) => {
      // Filter out duplicates
      const newRecipients = [...prev];
      contacts.forEach((contact) => {
        if (!newRecipients.includes(contact)) {
          newRecipients.push(contact);
        }
      });
      return newRecipients;
    });
  };

  return (
    <>
      <Header
        icon={
          <Avatar.Root size='48' color='blue'>
            <Avatar.Image src='/images/avatar/illustration/arthur.png' alt='' />
          </Avatar.Root>
        }
        title='Toplu SMS'
        description='Birden fazla alıcıya mesaj gönderin'
      >
        <MoveMoneyButton className='hidden lg:flex' />
      </Header>

      <div className='flex flex-col gap-6 overflow-hidden px-4 pb-6 lg:px-8 lg:pt-1'>
        <div className='mx-auto grid w-full max-w-md grid-cols-1 items-start gap-6 lg:max-w-3xl lg:grid-cols-2 lg:justify-center min-[1300px]:max-w-4xl min-[1400px]:max-w-full min-[1400px]:grid-cols-3'>
          <WidgetBulkSMS
            className='lg:row-span-2'
            initialRecipients={recipients}
          />
          <WidgetImportContacts onImport={handleImportContacts} />
          <WidgetSmsHistory className='lg:row-span-2' />
        </div>
      </div>
    </>
  );
}
