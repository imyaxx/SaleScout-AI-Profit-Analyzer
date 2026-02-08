import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KaspiAnalysis } from '../../types';
import { LoadingState, ErrorState } from '../ui/States';
import ProfitChart from './ProfitChart';
import FomoBlock from './FomoBlock';
import PositionRanking from './PositionRanking';
import PriceSimulator from './PriceSimulator';
import ErrorBoundary from '../ui/ErrorBoundary';
import { buildMiniRating, computeSimulatedUser, UserShopBase } from '../../lib/miniSellerRanking';
import { useThrottledValue } from '../../hooks/useThrottledValue';

interface StepAnalysisProps {
  analysis: KaspiAnalysis | null;
  isLoading: boolean;
  error: string | null;
  shopName: string;
  onRetry: () => void;
  onNext: () => void;
}

const demoAnalysisData: KaspiAnalysis = {
  productId: 'demo',
  leaderShop: 'Gadget One',
  leaderPrice: 739474,
  myShopFound: true,
  myShopPrice: 742883,
  myShopPosition: 7,
  priceToTop1: 3409,
  offers: [
    { name: 'Gadget One', price: 739474, rating: 4.9, reviewCount: 512 },
    { name: 'Kaspi Pro', price: 741120, rating: 4.7, reviewCount: 273 },
    { name: 'Smart Devices', price: 742200, rating: 4.5, reviewCount: 189 },
    { name: 'Top Seller', price: 742500, rating: 4.8, reviewCount: 341 },
    { name: 'Fresh Market', price: 742700, rating: 4.3, reviewCount: 97 },
    { name: 'Mega Store', price: 742800, rating: 4.6, reviewCount: 156 },
    { name: 'ALEM', price: 742883, rating: 4.4, reviewCount: 128 }
  ]
};

const toNumber = (value: number | null | undefined, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const safeString = (value: string | undefined | null, fallback: string) => String(value ?? fallback);

const normalizeShopKey = (value: string | undefined | null) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/["«»''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function placeholderRating(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.round((4.0 + (Math.abs(hash) % 10) / 10) * 10) / 10;
}

function placeholderReviewCount(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 7) - hash + name.charCodeAt(i)) | 0;
  }
  return 50 + (Math.abs(hash) % 450);
}

const StepAnalysis: React.FC<StepAnalysisProps> = ({ analysis, isLoading, error, shopName, onRetry, onNext }) => {
  const { t, i18n } = useTranslation();
  const [rawPriceDropPercent, setRawPriceDropPercent] = useState(0);
  const smoothPriceDropPercent = useThrottledValue(rawPriceDropPercent, 60);
  const unknownSeller = t('analysis.unknownSeller');

  const viewState = isLoading ? 'loading' : error ? 'error' : analysis ? 'success' : 'idle';
  const effectiveAnalysis = analysis ?? demoAnalysisData;

  const leaderPrice = toNumber(effectiveAnalysis.leaderPrice, 0);
  const basePrice = toNumber(effectiveAnalysis.myShopPrice ?? leaderPrice, leaderPrice);
  const basePosition = toNumber(effectiveAnalysis.myShopPosition ?? 1, 1);

  const simulationBase: UserShopBase = useMemo(
    () => ({
      priceBase: basePrice,
      rankBase: basePosition
    }),
    [basePrice, basePosition]
  );

  const simulatedMetrics = useMemo(
    () => computeSimulatedUser(simulationBase, smoothPriceDropPercent),
    [simulationBase, smoothPriceDropPercent]
  );

  const simulatedPrice = simulatedMetrics?.price ?? basePrice;
  const rawPosition = simulatedMetrics?.rank ?? basePosition;
  const simulatedPosition = (leaderPrice > 0 && simulatedPrice <= leaderPrice) ? 1 : rawPosition;
  const priceToTop1 = simulatedPrice - leaderPrice;

  const chartData = useMemo(() => {
    const days = 31;
    const base = Math.max(basePrice, leaderPrice);
    const baseline = Math.round(base * 0.26);
    const salescoutBoost = 1.15 + (smoothPriceDropPercent / 5) * 0.18;

    const currentSeries = Array.from({ length: days }, (_, day) => {
      const growth = 1 + day * 0.014;
      return Math.round(baseline * growth);
    });

    const optimizedSeries = Array.from({ length: days }, (_, day) => {
      const growth = 1 + day * 0.022;
      return Math.round(baseline * salescoutBoost * growth);
    });

    return { currentSeries, optimizedSeries };
  }, [basePrice, leaderPrice, smoothPriceDropPercent]);

  const profitLow = useMemo(() => Math.round(chartData.optimizedSeries[30] * 0.92), [chartData]);
  const profitHigh = useMemo(() => Math.round(chartData.optimizedSeries[30] * 1.12), [chartData]);
  const fomoValue = Math.max(0, chartData.optimizedSeries[7] - chartData.currentSeries[7]);

  const top5Sellers = useMemo(() => {
    const offers = Array.isArray(effectiveAnalysis.offers) ? effectiveAnalysis.offers : [];
    const sorted = offers
      .map((offer) => ({
        name: safeString(offer.name, unknownSeller),
        price: toNumber(offer.price, 0),
        rating: offer.rating ?? null,
        reviewCount: offer.reviewCount ?? null
      }))
      .filter((offer) => offer.name && offer.price > 0)
      .sort((a, b) => a.price - b.price);

    const seen = new Set<string>();
    const top: { rank: number; name: string; price: number; rating: number | null; reviewCount: number | null }[] = [];
    for (const offer of sorted) {
      const key = normalizeShopKey(offer.name);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      top.push({
        rank: top.length + 1,
        name: offer.name,
        price: offer.price,
        rating: offer.rating ?? placeholderRating(offer.name),
        reviewCount: offer.reviewCount ?? placeholderReviewCount(offer.name)
      });
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
          (offer) => normalizeShopKey(safeString(offer.name, unknownSeller)) === normalizedTarget
        )
      : null;

    const matchedName = matched ? safeString(matched.name, unknownSeller) : safeString(shopName, unknownSeller);
    return {
      rankBase: Number(rank),
      priceBase: Number(price),
      name: matchedName,
      rating: matched?.rating ?? placeholderRating(matchedName),
      reviewCount: matched?.reviewCount ?? placeholderReviewCount(matchedName)
    };
  }, [
    effectiveAnalysis.myShopFound,
    effectiveAnalysis.myShopPosition,
    effectiveAnalysis.myShopPrice,
    effectiveAnalysis.offers,
    shopName,
    i18n.language,
    unknownSeller
  ]);

  const computedUser = useMemo(
    () => computeSimulatedUser(userShopBase, smoothPriceDropPercent),
    [userShopBase, smoothPriceDropPercent]
  );

  // Base user without price simulation (for mini ranking animation only)
  const baseComputedUser = useMemo(
    () => computeSimulatedUser(userShopBase, 0),
    [userShopBase]
  );

  const rankingRenderList = useMemo(
    () =>
      buildMiniRating(top5Sellers, baseComputedUser, shopName, {
        userTitle: t('analysis.ranking.yourShop')
      }),
    [top5Sellers, baseComputedUser, shopName, i18n.language, t]
  );

  if (viewState === 'loading') {
    return <LoadingState />;
  }

  if (viewState === 'error') {
    return <ErrorState message={error ?? t('analysis.error')} onRetry={onRetry} />;
  }

  const dateLocale =
    i18n.language === 'kk' ? 'kk-KZ' : i18n.language === 'en' ? 'en-US' : 'ru-RU';
  const formattedDate = new Date().toLocaleDateString(dateLocale);

  return (
    <ErrorBoundary onRetry={onRetry}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 sm:space-y-10"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2 sm:gap-3 gap-y-1">
            {t('analysis.title')}
            <span className="text-xs sm:text-sm font-normal text-gray-400">{t('analysis.date', { date: formattedDate })}</span>
          </h2>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg shadow-blue-200 w-full sm:w-auto justify-center"
          >
            {t('analysis.cta')}
            <ArrowRight size={16} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ProfitChart currentSeries={chartData.currentSeries} optimizedSeries={chartData.optimizedSeries} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FomoBlock value={fomoValue} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="h-full"
          >
            <PriceSimulator
              percent={rawPriceDropPercent}
              onChange={setRawPriceDropPercent}
              basePrice={basePrice}
              simulatedPrice={simulatedPrice}
              leaderPrice={leaderPrice}
              leaderShop={safeString(effectiveAnalysis.leaderShop, t('analysis.unknownSeller'))}
              position={simulatedPosition}
              priceToTop1={priceToTop1}
              profitLow={profitLow}
              profitHigh={profitHigh}
            />
          </motion.div>

          <div className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-full"
            >
              <PositionRanking renderList={rankingRenderList} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default StepAnalysis;
