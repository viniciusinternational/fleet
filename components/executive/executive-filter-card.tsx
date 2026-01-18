'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ExecutiveFilterCardProps {
  id: string;
  label: string;
  count: number;
  isActive: boolean;
  onToggle: (id: string) => void;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'teal';
  className?: string;
}

const variantStyles = {
  default: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-700',
  green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-700',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-700',
  yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-700',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-700',
  teal: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border-teal-200 dark:border-teal-700',
};

const variantTextStyles = {
  default: 'text-gray-700 dark:text-gray-300',
  blue: 'text-blue-700 dark:text-blue-300',
  green: 'text-green-700 dark:text-green-300',
  purple: 'text-purple-700 dark:text-purple-300',
  yellow: 'text-yellow-700 dark:text-yellow-300',
  orange: 'text-orange-700 dark:text-orange-300',
  teal: 'text-teal-700 dark:text-teal-300',
};

const variantMutedStyles = {
  default: 'text-gray-500 dark:text-gray-400',
  blue: 'text-blue-600/70 dark:text-blue-400/70',
  green: 'text-green-600/70 dark:text-green-400/70',
  purple: 'text-purple-600/70 dark:text-purple-400/70',
  yellow: 'text-yellow-600/70 dark:text-yellow-400/70',
  orange: 'text-orange-600/70 dark:text-orange-400/70',
  teal: 'text-teal-600/70 dark:text-teal-400/70',
};

export const ExecutiveFilterCard: React.FC<ExecutiveFilterCardProps> = ({
  id,
  label,
  count,
  isActive,
  onToggle,
  variant = 'default',
  className,
}) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02]',
        variantStyles[variant],
        isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        className
      )}
      onClick={() => onToggle(id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn('text-2xl font-bold', variantTextStyles[variant])}>
              {count.toLocaleString()}
            </h3>
            <p className={cn('text-sm font-medium truncate mt-1', variantTextStyles[variant])}>
              {label}
            </p>
            <p className={cn('text-xs mt-0.5', variantMutedStyles[variant])}>
              vehicle{count !== 1 ? 's' : ''}
            </p>
          </div>
          {isActive && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
