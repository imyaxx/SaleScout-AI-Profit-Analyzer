import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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

  const pageRootRef = useRef(null);
  const contentRef = useRef(null);

  return (
    <div ref={pageRootRef} className={cn(s.root, step === 'analysis' && s.rootAnalysis)}>
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
