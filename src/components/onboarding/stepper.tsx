'use client';

import { clsx } from 'clsx';
import { createContext, useContext, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/primitives';

const StepContext = createContext<{ step: number } | null>(null);

export function useOnboardingStep() {
  const ctx = useContext(StepContext);
  if (!ctx) throw new Error('useOnboardingStep must be used inside <Stepper>');
  return ctx.step;
}

/**
 * Wraps a multi-section <form>. Every section stays mounted (just hidden
 * via CSS) so all of its inputs are part of the same FormData on final
 * submit — only the currently-visible <Step> is shown to the user.
 */
export function Stepper({
  labels,
  children,
  submitLabel = 'Terminar'
}: {
  labels: string[];
  children: React.ReactNode;
  submitLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const last = step === labels.length - 1;
  // Stepper is rendered as a child of the <form>, so useFormStatus here
  // correctly reflects that form's own pending state (it would NOT if
  // called in the component that renders the <form> element itself).
  const { pending } = useFormStatus();

  return (
    <StepContext.Provider value={{ step }}>
      <div className="mb-8 flex items-center gap-2">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={clsx(
                'flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold',
                i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400' : 'bg-ink-100 text-ink-300'
              )}
            >
              {i + 1}
            </div>
            <span className={clsx('hidden text-sm font-medium sm:block', i === step ? 'text-ink-900' : 'text-ink-300')}>{label}</span>
            {i < labels.length - 1 && <div className={clsx('h-px flex-1', i < step ? 'bg-brand-400' : 'bg-ink-100')} />}
          </div>
        ))}
      </div>

      {children}

      <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
        <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Atrás
        </Button>
        {!last ? (
          // key="continue" (distinct from the submit button's key below) is
          // load-bearing: without it React patches the *same* <button> DOM
          // node in place when swapping to the submit button on the click
          // that makes this the last step, flipping its type attribute from
          // "button" to "submit" *during* that very click's dispatch — which
          // makes the browser submit the form right then. Distinct keys
          // force React to mount a fresh node for the submit button instead.
          <Button key="continue" type="button" onClick={() => setStep((s) => Math.min(labels.length - 1, s + 1))}>
            Continuar
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={pending}>
            {pending ? 'Guardando…' : submitLabel}
          </Button>
        )}
      </div>
    </StepContext.Provider>
  );
}

export function Step({ index, children }: { index: number; children: React.ReactNode }) {
  const step = useOnboardingStep();
  const isHidden = step !== index;
  return (
    // Both `hidden` (attribute, for accessibility/semantics) and the
    // conditional `hidden` Tailwind class (for the actual visual effect):
    // the attribute alone isn't enough here because the browser's default
    // `[hidden]{display:none}` UA rule loses to the `.flex` utility class
    // below at equal specificity, since Tailwind's stylesheet loads after
    // the UA stylesheet — the explicit class makes hiding actually happen.
    <div hidden={isHidden} className={clsx('flex-col gap-5', isHidden ? 'hidden' : 'flex')}>
      {children}
    </div>
  );
}
