import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingState, ErrorState } from '@/shared/ui/States';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import PositionRanking from '@/features/analysis/PositionRanking';
import StickyResult from '@/features/analysis/StickyResult';
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

/* ── Custom smooth scroll (rAF-based, ~320ms, easeOutCubic) ── */
function smoothScrollTo(element, duration = 320) {
  if (!element) return;
  const scrollMargin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const targetY = element.getBoundingClientRect().top + window.scrollY - scrollMargin;
  const startY = window.scrollY;
  const diff = targetY - startY;
  if (Math.abs(diff) < 2) return;

  let start = null;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

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

  const anchorRef = useRef(null);
  const resultRef = useRef(null);
  const stickyRef = useRef(null);
  const shouldAutoScrollRef = useRef(false);

  /* ── Desktop: measure sticky height → set --sticky-h on page root ── */
  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 481px)');
    let ro = null;

    const measure = () => {
      const h = stickyRef.current?.offsetHeight || 0;
      pageRootRef.current?.style.setProperty('--sticky-h', `${h}px`);
    };

    const enable = () => {
      measure();
      requestAnimationFrame(measure);
      if (stickyRef.current) {
        ro = new ResizeObserver(measure);
        ro.observe(stickyRef.current);
      }
    };

    const disable = () => {
      ro?.disconnect();
      ro = null;
      pageRootRef.current?.style.removeProperty('--sticky-h');
    };

    const handleChange = (e) => {
      if (e.matches) enable();
      else disable();
    };

    if (mq.matches) enable();
    mq.addEventListener('change', handleChange);

    return () => {
      mq.removeEventListener('change', handleChange);
      disable();
    };
  }, [pageRootRef]);

  /* ── iOS mobile: fully block zoom (pinch + double-tap) on analysis ── */
  useLayoutEffect(() => {
    if (window.innerWidth > 480) return;

    // 1) Viewport meta lock
    const meta = document.querySelector('meta[name="viewport"]');
    const originalContent = meta?.getAttribute('content') ?? '';
    meta?.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    );

    // 2) Block pinch-zoom via gesture events (Safari-specific)
    const prevent = (e) => e.preventDefault();
    document.addEventListener('gesturestart', prevent, { passive: false });
    document.addEventListener('gesturechange', prevent, { passive: false });
    document.addEventListener('gestureend', prevent, { passive: false });

    // 3) Block double-tap zoom via touchend timing
    let lastTap = 0;
    const blockDoubleTap = (e) => {
      const now = Date.now();
      if (now - lastTap < 300) e.preventDefault();
      lastTap = now;
    };
    document.addEventListener('touchend', blockDoubleTap, { passive: false });

    return () => {
      meta?.setAttribute('content', originalContent);
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('gesturechange', prevent);
      document.removeEventListener('gestureend', prevent);
      document.removeEventListener('touchend', blockDoubleTap);
    };
  }, []);

  /* ── Desktop/tablet: block zoom (pinch + double-tap + ctrl/cmd wheel) on analysis ── */
  useLayoutEffect(() => {
    if (window.innerWidth < 481) return;

    // 1) Viewport meta lock
    const meta = document.querySelector('meta[name="viewport"]');
    const originalContent = meta?.getAttribute('content') ?? '';
    meta?.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    );

    // 2) Block pinch-zoom via gesture events (Safari-specific)
    const prevent = (e) => e.preventDefault();
    document.addEventListener('gesturestart', prevent, { passive: false });
    document.addEventListener('gesturechange', prevent, { passive: false });
    document.addEventListener('gestureend', prevent, { passive: false });

    // 3) Block double-tap zoom via touchend timing
    let lastTap = 0;
    const blockDoubleTap = (e) => {
      const now = Date.now();
      if (now - lastTap < 300) e.preventDefault();
      lastTap = now;
    };
    document.addEventListener('touchend', blockDoubleTap, { passive: false });

    // 4) Block ctrl/cmd + wheel zoom (desktop)
    const blockZoomWheel = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener('wheel', blockZoomWheel, { passive: false });

    return () => {
      meta?.setAttribute('content', originalContent);
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('gesturechange', prevent);
      document.removeEventListener('gestureend', prevent);
      document.removeEventListener('touchend', blockDoubleTap);
      window.removeEventListener('wheel', blockZoomWheel);
    };
  }, []);

  /* ── Auto-scroll to result when success state appears ── */
  useEffect(() => {
    if (viewState === 'loading') {
      shouldAutoScrollRef.current = true;
    }
  }, [viewState]);

  /* ── Auto-scroll to result once after entering from input step ── */
  useEffect(() => {
    if (viewState !== 'success' || !analysis || !shouldAutoScrollRef.current) return;
    shouldAutoScrollRef.current = false;

    let rafA = 0;
    let rafB = 0;
    let settleTimerA = 0;
    let settleTimerB = 0;
    let pendingImages = [];
    let onImageLoad = null;

    const run = () => {
      const target = anchorRef.current ?? resultRef.current;
      if (!target) return;

      smoothScrollTo(target, 320);

      const settle = () => {
        const scrollMargin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const targetY = target.getBoundingClientRect().top + window.scrollY - scrollMargin;
        window.scrollTo(0, targetY);
      };

      settleTimerA = window.setTimeout(settle, 180);
      settleTimerB = window.setTimeout(settle, 420);

      pendingImages = Array.from(resultRef.current?.querySelectorAll('img') ?? []).filter(
        (img) => !img.complete,
      );
      onImageLoad = () => settle();
      pendingImages.forEach((img) => img.addEventListener('load', onImageLoad));
    };

    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(run);
    });

    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
      if (settleTimerA) window.clearTimeout(settleTimerA);
      if (settleTimerB) window.clearTimeout(settleTimerB);
      if (onImageLoad) {
        pendingImages.forEach((img) => img.removeEventListener('load', onImageLoad));
      }
    };
  }, [analysis, pageRootRef, viewState]);

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
        <div ref={anchorRef} />

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
