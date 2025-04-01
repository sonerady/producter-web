'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiArrowLeftRightLine,
  RiArrowRightSLine,
  RiBankCardLine,
  RiBillLine,
  RiExchangeLine,
  RiHeadphoneLine,
  RiHistoryLine,
  RiLayoutGridLine,
  RiMessage2Line,
  RiSettings2Line,
  RiSparklingLine,
} from '@remixicon/react';
import { useHotkeys } from 'react-hotkeys-hook';

import { cn } from '@/utils/cn';
import * as Divider from '@/components/ui/divider';
import { CompanySwitch } from '@/components/company-switch';
import { UserButton } from '@/components/user-button';

import IconCmd from '~/icons/icon-cmd.svg';

type NavigationLink = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  disabled?: boolean;
};

export const navigationLinks: NavigationLink[] = [
  { icon: RiLayoutGridLine, label: 'Dashboard', href: '/' },
  { icon: RiBankCardLine, label: 'My Cards', href: '/my-cards' },
  { icon: RiArrowLeftRightLine, label: 'Transfer', href: '/send-money' },
  { icon: RiHistoryLine, label: 'Transactions', href: '/transactions' },
  { icon: RiSparklingLine, label: 'Takı Rötuşlama', href: '/retouch-jewelry' },
  { icon: RiBillLine, label: 'Payments', href: '#', disabled: true },
  { icon: RiExchangeLine, label: 'Exchange', href: '#', disabled: true },
];

export const favoriteLinks = [
  {
    href: '#',
    color: 'purple',
    projectName: 'Loom Mobile App',
    shortcut: (
      <>
        <IconCmd className='size-2.5' />1
      </>
    ),
  },
  {
    href: '#',
    color: 'red',
    projectName: 'Monday Redesign',
    shortcut: (
      <>
        <IconCmd className='size-2.5' />2
      </>
    ),
  },
  {
    href: '#',
    color: 'pink',
    projectName: 'Udemy Courses',
    shortcut: (
      <>
        <IconCmd className='size-2.5' />3
      </>
    ),
  },
];

function useCollapsedState({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}): {
  collapsed: boolean;
  sidebarRef: React.RefObject<HTMLDivElement>;
} {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useHotkeys(
    ['ctrl+b', 'meta+b'],
    () => setCollapsed((prev) => !prev),
    { preventDefault: true },
    [collapsed],
  );

  React.useEffect(() => {
    if (!sidebarRef.current) return;

    const elementsToHide = sidebarRef.current.querySelectorAll(
      '[data-hide-collapsed]',
    );

    const listeners: { el: Element; listener: EventListener }[] = [];

    elementsToHide.forEach((el) => {
      const hideListener = () => {
        el.classList.add('hidden');
        el.classList.remove('transition', 'duration-300');
      };

      const showListener = () => {
        el.classList.remove('transition', 'duration-300');
      };

      if (collapsed) {
        el.classList.add('opacity-0', 'transition', 'duration-300');
        el.addEventListener('transitionend', hideListener, { once: true });
        listeners.push({ el, listener: hideListener });
      } else {
        el.classList.add('transition', 'duration-300');
        el.classList.remove('hidden');
        setTimeout(() => {
          el.classList.remove('opacity-0');
        }, 1);
        el.addEventListener('transitionend', showListener, { once: true });
        listeners.push({ el, listener: showListener });
      }
    });

    return () => {
      listeners.forEach(({ el, listener }) => {
        el.removeEventListener('transitionend', listener);
      });
    };
  }, [collapsed]);

  return { collapsed, sidebarRef };
}

export function SidebarHeader({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn('lg:p-3', {
        'lg:px-2': collapsed,
      })}
    >
      <CompanySwitch
        className={cn('transition-all-default', {
          'w-16': collapsed,
        })}
      />
    </div>
  );
}

function NavigationMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <div className='space-y-2'>
      <div
        className={cn('p-1 text-subheading-xs uppercase text-text-soft-400', {
          '-mx-2.5 w-14 px-0 text-center': collapsed,
        })}
      >
        Main
      </div>
      <div className='space-y-1'>
        {navigationLinks.map(({ icon: Icon, label, href, disabled }, i) => (
          <Link
            key={i}
            href={href}
            aria-current={pathname === href ? 'page' : undefined}
            aria-disabled={disabled}
            className={cn(
              'group relative flex items-center gap-2 whitespace-nowrap rounded-lg py-2 text-text-sub-600 hover:bg-bg-weak-50',
              'transition-default',
              'aria-[current=page]:bg-bg-weak-50',
              'aria-disabled:pointer-events-none aria-disabled:opacity-50',
              {
                'w-9 px-2': collapsed,
                'w-full px-3': !collapsed,
              },
            )}
          >
            <div
              className={cn(
                'transition-default absolute top-1/2 h-5 w-1 origin-left -translate-y-1/2 rounded-r-full bg-primary-base',
                {
                  '-left-[22px]': collapsed,
                  '-left-5': !collapsed,
                  'scale-100': pathname === href,
                  'scale-0': pathname !== href,
                },
              )}
            />
            <Icon
              className={cn(
                'transition-default size-5 shrink-0 text-text-sub-600',
                'group-aria-[current=page]:text-primary-base',
              )}
            />

            <div
              className='flex w-[180px] shrink-0 items-center gap-2'
              data-hide-collapsed
            >
              <div className='flex-1 text-label-sm'>{label}</div>
              {pathname === href && (
                <RiArrowRightSLine className='size-5 text-text-sub-600' />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SettingsAndSupport({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const links = [
    {
      href: '/settings/profile-settings',
      icon: RiSettings2Line,
      label: 'Settings',
    },
    {
      href: '#',
      icon: RiHeadphoneLine,
      label: 'Support',
      disabled: true,
    },
  ];

  return (
    <div className='space-y-2'>
      <div
        className={cn('p-1 text-subheading-xs uppercase text-text-soft-400', {
          '-mx-2.5 w-14 px-0 text-center': collapsed,
        })}
      >
        Others
      </div>
      <div className='space-y-1'>
        {links.map(({ icon: Icon, label, href, disabled }, i) => {
          const isActivePage = pathname.startsWith(href);

          return (
            <Link
              key={i}
              href={href}
              aria-current={isActivePage ? 'page' : undefined}
              aria-disabled={disabled}
              className={cn(
                'group relative flex items-center gap-2 whitespace-nowrap rounded-lg py-2 text-text-sub-600 hover:bg-bg-weak-50',
                'transition-default',
                'aria-[current=page]:bg-bg-weak-50',
                'aria-disabled:pointer-events-none aria-disabled:opacity-50',
                {
                  'w-9 px-2': collapsed,
                  'w-full px-3': !collapsed,
                },
              )}
            >
              <div
                className={cn(
                  'transition-default absolute top-1/2 h-5 w-1 origin-left -translate-y-1/2 rounded-r-full bg-primary-base',
                  {
                    '-left-[22px]': collapsed,
                    '-left-5': !collapsed,
                    'scale-100': isActivePage,
                    'scale-0': !isActivePage,
                  },
                )}
              />
              <Icon
                className={cn(
                  'transition-default size-5 shrink-0 text-text-sub-600',
                  'group-aria-[current=page]:text-primary-base',
                )}
              />

              <div
                className='flex w-[180px] shrink-0 items-center gap-2'
                data-hide-collapsed
              >
                <div className='flex-1 text-label-sm'>{label}</div>
                {isActivePage && (
                  <RiArrowRightSLine className='size-5 text-text-sub-600' />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function UserProfile({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn('p-3', {
        'px-2': collapsed,
      })}
    >
      <UserButton
        className={cn('transition-all-default', {
          'w-auto': collapsed,
        })}
      />
    </div>
  );
}

function SidebarDivider({ collapsed }: { collapsed: boolean }) {
  return (
    <div className='px-5'>
      <Divider.Root
        className={cn('transition-all-default', {
          'w-10': collapsed,
        })}
      />
    </div>
  );
}

export default function Sidebar({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}) {
  const { collapsed, sidebarRef } = useCollapsedState({ defaultCollapsed });

  return (
    <>
      <div
        className={cn(
          'transition-all-default fixed left-0 top-0 z-40 hidden h-full overflow-hidden border-r border-stroke-soft-200 bg-bg-white-0 duration-300 lg:block',
          {
            'w-20': collapsed,
            'w-[272px]': !collapsed,
            '[&_[data-hide-collapsed]]:hidden': !collapsed
              ? false
              : defaultCollapsed,
          },
        )}
      >
        <div
          ref={sidebarRef}
          className='flex h-full w-[272px] min-w-[272px] flex-col overflow-auto'
        >
          <SidebarHeader collapsed={collapsed} />

          <SidebarDivider collapsed={collapsed} />

          <div
            className={cn('flex flex-1 flex-col gap-5 pb-4 pt-5', {
              'px-[22px]': collapsed,
              'px-5': !collapsed,
            })}
          >
            <NavigationMenu collapsed={collapsed} />
            <SettingsAndSupport collapsed={collapsed} />
          </div>

          <SidebarDivider collapsed={collapsed} />

          <UserProfile collapsed={collapsed} />
        </div>
      </div>

      {/* a necessary placeholder because of sidebar is fixed */}
      <div
        className={cn('shrink-0', {
          'w-[272px]': !collapsed,
          'w-20': collapsed,
        })}
      />
    </>
  );
}
