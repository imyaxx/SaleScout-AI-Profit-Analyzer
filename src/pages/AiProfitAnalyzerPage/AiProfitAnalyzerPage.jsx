import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StepProgress from '@/features/wizard/StepProgress';
import StepWelcome from '@/features/wizard/StepWelcome';
import StepInput from '@/features/wizard/StepInput';
import StepAnalysis from '@/features/analysis/StepAnalysis';
import StepLeadForm from '@/features/wizard/StepLeadForm';
import { analyzeKaspi, submitLead } from '@/shared/lib/onboardingClient';

import s from './AiProfitAnalyzerPage.module.css';

const stepTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const initialLead = {
  name: '',
  phone: '+7',
  email: '',
  shopName: '',
  description: '',
};

export default function AiProfitAnalyzerPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState('welcome');
  const [productUrl, setProductUrl] = useState('');
  const [shopName, setShopName] = useState('');

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const [leadForm, setLeadForm] = useState(initialLead);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState(null);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const progressStep = step === 'welcome' ? 1 : step === 'analysis' ? 3 : step === 'lead' ? 4 : 2;

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
    setLeadForm((prev) => ({ ...prev, shopName: shop }));
    shouldRunAnalysis.current = true;
    setStep('analysis');
  };

  useEffect(() => {
    if (step === 'analysis' && shouldRunAnalysis.current) {
      shouldRunAnalysis.current = false;
      runAnalysis();
    }
  }, [step, runAnalysis]);

  const handleGoLead = () => setStep('lead');

  const handleLeadSubmit = async (payload) => {
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      await submitLead(payload);
      setLeadSuccess(true);
    } catch (err) {
      setLeadError(err.message || t('errors.leadFailed'));
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleRestart = () => {
    setStep('welcome');
    setProductUrl('');
    setShopName('');
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
    setLeadForm(initialLead);
    setLeadError(null);
    setLeadSuccess(false);
    setLeadSubmitting(false);
  };

  return (
    <div className={s.root}>
      <StepProgress current={progressStep} />
      <div className={s.content}>
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
                onNext={handleGoLead}
                onBack={() => setStep('input')}
              />
            </motion.div>
          )}

          {step === 'lead' && (
            <motion.div key="lead" {...stepTransition}>
              <StepLeadForm
                values={leadForm}
                onChange={(next) => setLeadForm((prev) => ({ ...prev, ...next }))}
                onBack={() => setStep('analysis')}
                onSubmit={handleLeadSubmit}
                isSubmitting={leadSubmitting}
                error={leadError}
                success={leadSuccess}
                onRestart={handleRestart}
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
