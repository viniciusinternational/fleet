import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
  }>;
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-center py-6 relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1 max-w-[200px]">
              {/* Step Circle with Number */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 cursor-pointer relative z-10",
                  {
                    "bg-primary text-primary-foreground": isCompleted || isCurrent,
                    "bg-muted text-muted-foreground": isUpcoming,
                  }
                )}
                onClick={() => onStepClick?.(index)}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step Title */}
              <div className="mt-3 text-center px-2">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors leading-tight",
                    {
                      "text-primary": isCurrent,
                      "text-muted-foreground": isUpcoming,
                      "text-foreground": isCompleted,
                    }
                  )}
                >
                  {step.title}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                  <div
                    className={cn(
                      "h-full transition-all duration-200",
                      {
                        "bg-primary": index < currentStep,
                        "bg-muted": index >= currentStep,
                      }
                    )}
                    style={{ width: 'calc(100% - 2.5rem)', marginLeft: '2.5rem' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
