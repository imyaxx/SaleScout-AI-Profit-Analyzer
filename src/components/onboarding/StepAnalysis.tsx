import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { KaspiAnalysis } from '../../types';
import { LoadingState, ErrorState } from '../ai-profit/States';
import ProfitChart from './analysis/ProfitChart';
import FomoBlock from './analysis/FomoBlock';
import PositionRanking from './analysis/PositionRanking';
import PriceSimulator from './analysis/PriceSimulator';
import ConfidenceMeter from './analysis/ConfidenceMeter';
import AnalysisTimer from './analysis/AnalysisTimer';
import ErrorBoundary from './analysis/ErrorBoundary';
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
    { name: 'Gadget One', price: 739474 },
    { name: 'Kaspi Pro', price: 741120 },
    { name: 'Smart Devices', price: 742200 },
    { name: 'Top Seller', price: 742500 },
    { name: 'Fresh Market', price: 742700 },
    { name: 'Mega Store', price: 742800 },
    { name: 'ALEM', price: 742883 }
  ]
};

const toNumber = (value: number | null | undefined, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const safeString = (value: string | undefined | null, fallback = 'Неизвестный продавец') =>
  String(value ?? fallback);

const normalizeShopKey = (value: string | undefined | null) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/["«»'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const StepAnalysis: React.FC<StepAnalysisProps> = ({ analysis, isLoading, error, shopName, onRetry, onNext }) => {
  const [rawPriceDropPercent, setRawPriceDropPercent] = useState(0);
  const smoothPriceDropPercent = useThrottledValue(rawPriceDropPercent, 60);

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
  const simulatedPosition = simulatedMetrics?.rank ?? basePosition;
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
        name: safeString(offer.name),
        price: toNumber(offer.price, 0)
      }))
      .filter((offer) => offer.name && offer.price > 0)
      .sort((a, b) => a.price - b.price);

    const seen = new Set<string>();
    const top: { rank: number; name: string; price: number }[] = [];
    for (const offer of sorted) {
      const key = normalizeShopKey(offer.name);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      top.push({ rank: top.length + 1, name: offer.name, price: offer.price });
      if (top.length >= 5) break;
    }
    return top;
  }, [effectiveAnalysis.offers]);

  const userShopBase = useMemo(() => {
    if (!effectiveAnalysis.myShopFound) return null;
    const rank = effectiveAnalysis.myShopPosition;
    const price = effectiveAnalysis.myShopPrice;
    if (!Number.isFinite(Number(rank)) || !Number.isFinite(Number(price))) return null;

    const normalizedTarget = normalizeShopKey(shopName);
    const offers = Array.isArray(effectiveAnalysis.offers) ? effectiveAnalysis.offers : [];
    const matched = normalizedTarget
      ? offers.find((offer) => normalizeShopKey(safeString(offer.name)) === normalizedTarget)
      : null;

    return {
      rankBase: Number(rank),
      priceBase: Number(price),
      name: matched ? safeString(matched.name) : safeString(shopName)
    };
  }, [
    effectiveAnalysis.myShopFound,
    effectiveAnalysis.myShopPosition,
    effectiveAnalysis.myShopPrice,
    effectiveAnalysis.offers,
    shopName
  ]);

  const computedUser = useMemo(
    () => computeSimulatedUser(userShopBase, smoothPriceDropPercent),
    [userShopBase, smoothPriceDropPercent]
  );

  const rankingRenderList = useMemo(
    () => buildMiniRating(top5Sellers, computedUser, shopName),
    [top5Sellers, computedUser, shopName]
  );

  if (viewState === 'loading') {
    return <LoadingState />;
  }

  if (viewState === 'error') {
    return <ErrorState message={error ?? 'Ошибка анализа'} onRetry={onRetry} />;
  }

  return (
    <ErrorBoundary onRetry={onRetry}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Результат анализа по товару
            <span className="text-sm font-normal text-gray-400">
              / {new Date().toLocaleDateString('ru-RU')}
            </span>
          </h2>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Перейти к заявке
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <PriceSimulator
              percent={rawPriceDropPercent}
              onChange={setRawPriceDropPercent}
              basePrice={basePrice}
              simulatedPrice={simulatedPrice}
              leaderPrice={leaderPrice}
              position={simulatedPosition}
              priceToTop1={priceToTop1}
              profitLow={profitLow}
              profitHigh={profitHigh}
            />
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PositionRanking renderList={rankingRenderList} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ConfidenceMeter value={87} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AnalysisTimer />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default StepAnalysis;
