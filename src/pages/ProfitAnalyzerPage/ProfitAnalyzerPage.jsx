import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StepProgress from '@/features/wizard/StepProgress/StepProgress';
import StepWelcome from '@/features/wizard/StepWelcome/StepWelcome';
import StepInput from '@/features/wizard/StepInput/StepInput';
import StepAnalysis from '@/features/analysis/StepAnalysis/StepAnalysis';
import { analyzeKaspi } from '@/shared/lib/onboardingClient';
import { cn } from '@/shared/lib/utils';

import s from './ProfitAnalyzerPage.module.css';

const stepTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function ProfitAnalyzerPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState('welcome');
  const [productUrl, setProductUrl] = useState('');
  const [shopName, setShopName] = useState('');

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [progressSlot, setProgressSlot] = useState(null);

  const progressStep = step === 'welcome' ? 1 : step === 'analysis' ? 3 : 2;

  const runAnalysis = useCallback(async () => {
    if (!productUrl || !shopName) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const result = await analyzeKaspi({ productUrl, shopName });
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(err.message || t('errors.analyzeFailed'));
    } finally {
      setAnalysisLoading(false);
    }
  }, [productUrl, shopName, t]);

  const shouldRunAnalysis = useRef(false);

  const handleInputNext = (url, shop) => {
    setProductUrl(url);
    setShopName(shop);
    shouldRunAnalysis.current = true;

    // iOS: blur input → close keyboard → reset scroll/zoom → navigate
    document.activeElement?.blur();
    window.scrollTo(0, 0);
    setTimeout(() => setStep('analysis'), 60);
  };

  useEffect(() => {
    if (step === 'analysis' && shouldRunAnalysis.current) {
      shouldRunAnalysis.current = false;
      runAnalysis();
    }
  }, [step, runAnalysis]);

  useEffect(() => {
    setProgressSlot(document.getElementById('nav-progress-slot'));
  }, []);

  useEffect(() => {
    if (!progressSlot) return;

    let rafId1 = 0;
    let rafId2 = 0;

    const alignProgressToKaspiLogo = () => {
      const stepTwoCircle = progressSlot.querySelector('[data-step-id="2"]');
      const kaspiLogo = document.getElementById('analysis-kaspi-logo');

      if (!stepTwoCircle || !kaspiLogo) {
        progressSlot.style.setProperty('--progress-shift-x', '0px');
        return;
      }

      const circleRect = stepTwoCircle.getBoundingClientRect();
      const logoRect = kaspiLogo.getBoundingClientRect();
      const circleCenterX = circleRect.left + circleRect.width / 2;
      const logoCenterX = logoRect.left + logoRect.width / 2;
      const shiftX = Math.round(logoCenterX - circleCenterX);

      progressSlot.style.setProperty('--progress-shift-x', `${shiftX}px`);
    };

    const scheduleAlignment = () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(alignProgressToKaspiLogo);
      });
    };

    scheduleAlignment();
    window.addEventListener('resize', scheduleAlignment);

    return () => {
      window.removeEventListener('resize', scheduleAlignment);
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
    };
  }, [progressSlot, step, analysis, analysisLoading, analysisError]);

  const pageRootRef = useRef(null);
  const contentRef = useRef(null);

  return (
    <div ref={pageRootRef} className={cn(s.root, step === 'analysis' && s.rootAnalysis)}>
      {progressSlot && createPortal(<StepProgress current={progressStep} />, progressSlot)}
      <div className={s.content} ref={contentRef}>
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" {...stepTransition}>
              <StepWelcome onNext={() => setStep('input')} />
            </motion.div>
          )}

          {step === 'input' && (
            <motion.div key="input" {...stepTransition}>
              <StepInput
                initialUrl={productUrl}
                initialShop={shopName}
                onBack={() => setStep('welcome')}
                onNext={handleInputNext}
              />
            </motion.div>
          )}

          {step === 'analysis' && (
            <motion.div key="analysis" {...stepTransition}>
              <StepAnalysis
                analysis={analysis}
                isLoading={analysisLoading}
                error={analysisError}
                shopName={shopName}
                onRetry={runAnalysis}
                onBack={() => setStep('input')}
                contentRef={contentRef}
                pageRootRef={pageRootRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className={s.footer}>
        <p className={s.footerText}>{t('footer.text')}</p>
      </footer>
    </div>
  );
}
