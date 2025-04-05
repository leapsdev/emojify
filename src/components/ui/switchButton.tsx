import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as React from 'react';

export interface SwitchButtonProps {
  isActive: boolean;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  activeColor?: string;
  inactiveColor?: string;
  onClick?: () => void;
  className?: string;
}

export const SwitchButton = React.forwardRef<
  HTMLButtonElement,
  SwitchButtonProps
>(
  (
    {
      isActive,
      activeIcon,
      inactiveIcon,
      activeColor = 'bg-gray-400 hover:bg-gray-500',
      inactiveColor = 'bg-blue-500 hover:bg-blue-600',
      onClick,
      className,
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'h-9 rounded-2xl px-7 w-24 flex items-center justify-center mt-3 text-white',
          isActive ? activeColor : inactiveColor,
          className,
        )}
        onClick={onClick}
      >
        {isActive ? activeIcon : inactiveIcon}
      </Button>
    );
  },
);

SwitchButton.displayName = 'SwitchButton';
