import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingState, ErrorState } from '@/shared/ui/States';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import PositionRanking from '@/features/analysis/PositionRanking';
import { buildMiniRating, computeSimulatedUser } from '@/shared/lib/miniSellerRanking';
import { DEMO_ANALYSIS_DATA } from '@/shared/constants/demo';
import s from './StepAnalysis.module.css';

const EASE_APPLE = [0.22, 1, 0.36, 1];

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASE_APPLE,
      staggerChildren: 0.12,
    },
  },
};

const headerTitleVariant = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE_APPLE },
  },
};

const headerActionsVariant = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.15, ease: EASE_APPLE },
  },
};

const rankingSectionVariant = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.25, ease: EASE_APPLE },
  },
};

const staticVariant = {
  initial: {},
  animate: {},
};

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const safeString = (value, fallback) => String(value ?? fallback);

const normalizeShopKey = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/["«»''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export default function StepAnalysis({
  analysis,
  isLoading,
  error,
  shopName,
  onRetry,
  onNext,
  onBack,
}) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const unknownSeller = t('analysis.unknownSeller');

  const viewState = isLoading ? 'loading' : error ? 'error' : analysis ? 'success' : 'idle';
  const effectiveAnalysis = analysis ?? DEMO_ANALYSIS_DATA;

  const top5Sellers = useMemo(() => {
    const offers = Array.isArray(effectiveAnalysis.offers) ? effectiveAnalysis.offers : [];
    const sorted = offers
      .map((offer) => ({
        name: safeString(offer.name, unknownSeller),
        price: toNumber(offer.price, 0),
        rating: offer.rating ?? null,
        reviewCount: offer.reviewCount ?? null,
      }))
      .filter((offer) => offer.name && offer.price > 0)
      .sort((a, b) => a.price - b.price);

    const seen = new Set();
    const top = [];
    for (const offer of sorted) {
      const key = normalizeShopKey(offer.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      top.push({ rank: top.length + 1, ...offer });
      if (top.length >= 5) break;
    }
    return top;
  }, [effectiveAnalysis.offers, i18n.language, unknownSeller]);

  const userShopBase = useMemo(() => {
    if (!effectiveAnalysis.myShopFound) return null;
    const rank = effectiveAnalysis.myShopPosition;
    const price = effectiveAnalysis.myShopPrice;
    if (!Number.isFinite(Number(rank)) || !Number.isFinite(Number(price))) return null;

    const normalizedTarget = normalizeShopKey(shopName);
    const offers = Array.isArray(effectiveAnalysis.offers) ? effectiveAnalysis.offers : [];
    const matched = normalizedTarget
      ? offers.find(
          (offer) => normalizeShopKey(safeString(offer.name, unknownSeller)) === normalizedTarget,
        )
      : null;

    const matchedName = matched
      ? safeString(matched.name, unknownSeller)
      : safeString(shopName, unknownSeller);
    return {
      rankBase: Number(rank),
      priceBase: Number(price),
      name: matchedName,
      rating: matched?.rating ?? null,
      reviewCount: matched?.reviewCount ?? null,
    };
  }, [
    effectiveAnalysis.myShopFound,
    effectiveAnalysis.myShopPosition,
    effectiveAnalysis.myShopPrice,
    effectiveAnalysis.offers,
    shopName,
    i18n.language,
    unknownSeller,
  ]);

  const baseComputedUser = useMemo(() => computeSimulatedUser(userShopBase, 0), [userShopBase]);

  const rankingRenderList = useMemo(
    () =>
      buildMiniRating(top5Sellers, baseComputedUser, shopName, {
        userTitle: t('analysis.ranking.yourShop'),
      }),
    [top5Sellers, baseComputedUser, shopName, i18n.language, t],
  );

  if (viewState === 'loading') {
    return <LoadingState />;
  }

  if (viewState === 'error') {
    return (
      <div className={s.errorWrap}>
        <button onClick={onBack} className={s.btnBack}>
          <ArrowLeft size={16} />
          {t('input.back')}
        </button>
        <ErrorState message={error ?? t('analysis.error')} onRetry={onRetry} />
      </div>
    );
  }

  const dateLocale = i18n.language === 'kk' ? 'kk-KZ' : i18n.language === 'en' ? 'en-US' : 'ru-RU';
  const formattedDate = new Date().toLocaleDateString(dateLocale);

  const v = reduceMotion ? staticVariant : null;

  return (
    <ErrorBoundary onRetry={onRetry}>
      <motion.div
        variants={v ?? pageVariants}
        initial="initial"
        animate="animate"
        className={s.root}
      >
        <div className={s.headerRow}>
          <motion.h2 variants={v ?? headerTitleVariant} className={s.title}>
            {t('analysis.title')}
            <span className={s.dateLabel}>{t('analysis.date', { date: formattedDate })}</span>
          </motion.h2>
          <motion.div variants={v ?? headerActionsVariant} className={s.headerActions}>
            <button onClick={onBack} className={s.btnBack}>
              <ArrowLeft size={16} />
              {t('input.back')}
            </button>
            <button onClick={onNext} className={s.ctaBtn}>
              {t('analysis.cta')}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        <motion.div variants={v ?? rankingSectionVariant} className={s.rankingCenter}>
          <PositionRanking renderList={rankingRenderList} />
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
}
