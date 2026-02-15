import { useLayoutEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingState, ErrorState } from '@/shared/ui/States/States';
import ErrorBoundary from '@/shared/ui/ErrorBoundary/ErrorBoundary';
import PositionRanking from '@/features/analysis/PositionRanking/PositionRanking';
import StickyResult from '@/features/analysis/StickyResult/StickyResult';
import { buildMiniRating, computeSimulatedUser } from '@/shared/lib/miniSellerRanking';
import { formatMoney } from '@/shared/lib/utils';
import { DEMO_ANALYSIS_DATA } from '@/shared/constants/demo';
import s from './StepAnalysis.module.css';

const EASE_APPLE = [0.22, 1, 0.36, 1];
const TRIAL_LOGIN_URL = 'https://app.salescout.me/login';

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
  onBack,
  pageRootRef,
}) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const unknownSeller = t('analysis.unknownSeller');
  const handleTrialCta = () => {
    window.location.assign(TRIAL_LOGIN_URL);
  };

  const viewState = isLoading ? 'loading' : error ? 'error' : analysis ? 'success' : 'idle';
  const effectiveAnalysis = analysis ?? DEMO_ANALYSIS_DATA;

  const resultRef = useRef(null);
  const stickyRef = useRef(null);

  /* ── Measure sticky height → set --sticky-h on page root ── */
  useLayoutEffect(() => {
    let ro = null;

    const measure = () => {
      const h = stickyRef.current?.offsetHeight || 0;
      pageRootRef.current?.style.setProperty('--sticky-h', `${h}px`);
    };

    measure();
    requestAnimationFrame(measure);
    if (stickyRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(stickyRef.current);
    }

    return () => {
      ro?.disconnect();
      pageRootRef.current?.style.removeProperty('--sticky-h');
    };
  }, [pageRootRef]);

  /* ── Block zoom (ctrl/cmd + wheel) on analysis ── */
  useLayoutEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    const originalContent = meta?.getAttribute('content') ?? '';
    meta?.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    );

    const blockZoomWheel = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener('wheel', blockZoomWheel, { passive: false });

    return () => {
      meta?.setAttribute('content', originalContent);
      window.removeEventListener('wheel', blockZoomWheel);
    };
  }, []);

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
  }, [effectiveAnalysis.offers, unknownSeller]);

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
    unknownSeller,
  ]);

  const baseComputedUser = useMemo(() => computeSimulatedUser(userShopBase, 0), [userShopBase]);

  const rankingRenderList = useMemo(
    () =>
      buildMiniRating(top5Sellers, baseComputedUser, shopName, {
        userTitle: t('analysis.ranking.yourShop'),
      }),
    [top5Sellers, baseComputedUser, shopName, t],
  );

  /* ── Sticky result data ── */
  const stickyRank = effectiveAnalysis.myShopPosition;
  const stickyPrice = effectiveAnalysis.myShopPrice
    ? formatMoney(toNumber(effectiveAnalysis.myShopPrice))
    : null;
  const leader = top5Sellers[0] ?? null;
  const isLeader = toNumber(stickyRank) === 1;
  const showSticky = viewState === 'success';

  if (viewState === 'loading') {
    return <LoadingState />;
  }

  if (viewState === 'error') {
    return (
      <ErrorState
        message={error ?? t('analysis.error')}
        onRetry={onRetry}
        secondaryAction={{
          onClick: onBack,
          label: t('input.back'),
          icon: <ArrowLeft size={18} />,
        }}
      />
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
        <motion.div
          ref={resultRef}
          variants={v ?? rankingSectionVariant}
          className={s.rankingCenter}
        >
          <PositionRanking renderList={rankingRenderList} onBack={onBack} formattedDate={t('analysis.date', { date: formattedDate })} />
        </motion.div>

        {showSticky && <div className={s.bottomSpacer} />}
      </motion.div>

      <StickyResult
        ref={stickyRef}
        storeName={shopName}
        rank={stickyRank}
        price={stickyPrice}
        rawPrice={toNumber(effectiveAnalysis.myShopPrice)}
        leaderName={leader?.name}
        leaderPrice={leader ? formatMoney(leader.price) : null}
        rawLeaderPrice={leader?.price ?? null}
        isLeader={isLeader}
        visible={showSticky}
        onCta={handleTrialCta}
      />
    </ErrorBoundary>
  );
}
