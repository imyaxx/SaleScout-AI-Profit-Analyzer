import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import s from './StepProgress.module.css';

export default function StepProgress({ current }) {
  const { t } = useTranslation();
  const steps = [
    { id: 1, label: t('steps.welcome') },
    { id: 2, label: t('steps.data') },
    { id: 3, label: t('steps.analysis') },
  ];

  return (
    <div className={s.root}>
      <div className={s.inner}>
        <div className={s.row}>
          {steps.map((step, idx) => {
            const isCompleted = current > step.id;
            const isActive = current === step.id;
            return (
              <Fragment key={step.id}>
                <div className={s.stepGroup}>
                  <div
                    data-step-id={step.id}
                    className={cn(
                      s.circle,
                      isCompleted && s.circleCompleted,
                      isActive && s.circleActive,
                    )}
                  >
                    {step.id}
                  </div>
                  <span
                    className={cn(
                      s.label,
                      isCompleted && s.labelCompleted,
                      isActive && s.labelActive,
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={s.connectorWrap}>
                    <div className={cn(s.connector, isCompleted && s.connectorCompleted)} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
