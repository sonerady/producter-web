'use client';

import * as React from 'react';
import LibMotionNumber from 'motion-number';

export function MotionNumber({
  ...rest
}: React.ComponentPropsWithoutRef<typeof LibMotionNumber>) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Sunucu tarafında veya istemci tarafında hydration öncesinde
    // statik bir değer göster
    const value = typeof rest.value === 'number' ? rest.value : 0;
    const format = (rest.format as Intl.NumberFormatOptions) || {};

    try {
      const formatter = new Intl.NumberFormat('en-US', format);
      return <span>{formatter.format(value)}</span>;
    } catch (e) {
      return <span>{value}</span>;
    }
  }

  return (
    <LibMotionNumber
      transition={{
        layout: { type: 'spring', duration: 1, stiffness: 150, damping: 20 },
        y: {
          type: 'spring',
          duration: 1,
          stiffness: 120,
          damping: 20,
          bounce: 0.15,
        },
      }}
      {...rest}
    />
  );
}
