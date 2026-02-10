import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useSpring } from 'framer-motion';
import { Star } from 'lucide-react';
import kaspiLogo from '@/assets/Logo_of_Kaspi_bank.png';
import { useTranslation } from 'react-i18next';
import { formatMoney, cn } from '@/shared/lib/utils';
import sellersBg from '@/assets/sellers-bg.png';
import s from './PositionRanking.module.css';

/* ── Animation config ── */
const EASE_STANDARD = [0.4, 0, 0.2, 1];

const layoutTransition = {
  layout: { type: 'tween', duration: 0.8, ease: EASE_STANDARD },
};

/* ── Timing ── */
const JUMP_DELAY_MS = 600; // pause before user jumps to #1
const SHUFFLE_STEP_MS = 4500; // how often a competitor changes price
const SHUFFLE_START_DELAY_MS = 1500; // pause before shuffle begins after jump
const PRICE_VARIATION_PCT = 0.02; // ±2% price swing for competitors

function pluralizeReviews(count, lang) {
  if (lang === 'en') return count === 1 ? 'review' : 'reviews';
  if (lang === 'kk') return 'пікір';
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'отзыва';
  return 'отзывов';
}

/* ── Animated price counter ── */
function AnimatedPrice({ value, className }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return <p className={className}>{formatMoney(display)}</p>;
}

/**
 * Core hook: orchestrates the "climb to #1" animation.
 *
 * User starts at the bottom with their real price, then every CLIMB_STEP_MS
 * beats one opponent above by setting price = opponent.price - 1, climbing
 * one position at a time until reaching #1. Animation stops after that.
 */
function useRankingAnimation(renderList, reduceMotion) {
  const userItem = useMemo(() => renderList.find((i) => i.type === 'user'), [renderList]);
  const baseOthers = useMemo(() => {
    return renderList.filter((i) => i.type !== 'user');
  }, [renderList]);

  // Always start user at the bottom — even if already #1 on Kaspi.
  // User's real price is bumped above the most expensive seller so they visually start last.
  const initialList = useMemo(() => {
    const sorted = [...baseOthers].sort((a, b) => a.price - b.price);
    if (!userItem) return sorted;
    const maxPrice = sorted.length > 0 ? sorted[sorted.length - 1].price : 0;
    const startPrice = Math.max(userItem.price, maxPrice + 1);
    return [...sorted, { ...userItem, price: startPrice }];
  }, [userItem, baseOthers]);

  const [list, setList] = useState(initialList);
  const timerRef = useRef(null);
  const basePricesRef = useRef(new Map());

  // Reset when renderList changes
  useEffect(() => {
    setList(initialList);
    // Remember original prices for competitors so shuffle varies around them
    const map = new Map();
    for (const item of initialList) {
      if (item.type !== 'user') map.set(item.uniqueId, item.price);
    }
    basePricesRef.current = map;
    return () => clearTimeout(timerRef.current);
  }, [initialList]);

  // ── Sort helper (user always wins ties) ──
  const sortWithUserFirst = (arr) => {
    arr.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      if (a.type === 'user') return -1;
      if (b.type === 'user') return 1;
      return 0;
    });
    return arr;
  };

  // ── Jump to #1: user immediately gets leader price - 1 ──
  const jumpToFirst = useCallback(() => {
    setList((prev) => {
      if (!userItem) return prev;
      const minCompetitorPrice = Math.min(
        ...prev.filter((i) => i.type !== 'user').map((i) => i.price),
      );
      const next = prev.map((item) =>
        item.type === 'user' ? { ...item, price: minCompetitorPrice - 1 } : item,
      );
      return sortWithUserFirst(next);
    });
  }, [userItem]);

  // ── Shuffle logic: randomly change one competitor's price, keep user at #1 ──
  const shuffleStep = useCallback(() => {
    setList((prev) => {
      const competitors = prev.filter((i) => i.type !== 'user');
      if (competitors.length === 0) return prev;

      // Pick a random competitor
      const idx = Math.floor(Math.random() * competitors.length);
      const target = competitors[idx];
      const basePrice = basePricesRef.current.get(target.uniqueId) ?? target.price;

      // Vary price ±PRICE_VARIATION_PCT around the original price
      const variation = 1 + (Math.random() * 2 - 1) * PRICE_VARIATION_PCT;
      const newPrice = Math.round(basePrice * variation);

      const next = prev.map((item) => {
        if (item.uniqueId === target.uniqueId) return { ...item, price: newPrice };
        return item;
      });

      // Recalculate user price: always min(competitors) - 1
      const minCompetitorPrice = Math.min(
        ...next.filter((i) => i.type !== 'user').map((i) => i.price),
      );
      const adjusted = next.map((item) =>
        item.type === 'user' ? { ...item, price: minCompetitorPrice - 1 } : item,
      );
      return sortWithUserFirst(adjusted);
    });
  }, []);

  // Static fallback for reduced motion — show final state (user at #1)
  const staticList = useMemo(() => {
    const others = [...baseOthers].sort((a, b) => a.price - b.price);
    if (!userItem) return others;
    const leaderPrice = others.length > 0 ? others[0].price : userItem.price;
    const finalPrice = leaderPrice - 1;
    return [{ ...userItem, price: finalPrice }, ...others];
  }, [userItem, baseOthers]);

  // ── Timer orchestration ──
  useEffect(() => {
    if (reduceMotion || !userItem) return;

    const runShuffle = () => {
      shuffleStep();
      timerRef.current = setTimeout(runShuffle, SHUFFLE_STEP_MS);
    };

    // Jump to #1 after a short delay, then start shuffle
    timerRef.current = setTimeout(() => {
      jumpToFirst();
      timerRef.current = setTimeout(runShuffle, SHUFFLE_START_DELAY_MS);
    }, JUMP_DELAY_MS);

    return () => clearTimeout(timerRef.current);
  }, [reduceMotion, userItem, jumpToFirst, shuffleStep]);

  return reduceMotion ? staticList : list;
}

export default function PositionRanking({ renderList }) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const animatedList = useRankingAnimation(renderList, reduceMotion);

  return (
    <div className={s.root}>
      <div className={s.headerRow}>
        <div className={s.logoWrap}>
          <img src={kaspiLogo} alt="Kaspi" className={s.logoImg} />
        </div>
        <div>
          <p className={s.kicker}>{t('analysis.ranking.kicker')}</p>
          <h3 className={s.title}>{t('analysis.ranking.title')}</h3>
        </div>
      </div>

      <div className={s.phoneWrap}>
        <img src={sellersBg} alt="" className={s.phoneBg} draggable={false} />
        <div className={s.overlay}>
          <div className={s.listContainer}>
            <motion.div layout={!reduceMotion} className={s.listScroll}>
              <AnimatePresence initial={false} mode="popLayout">
                {animatedList.map((item) => {
                  const itemKey = item.uniqueId;
                  return (
                    <motion.div
                      layout={reduceMotion ? false : 'position'}
                      layoutId={reduceMotion ? undefined : `seller-${itemKey}`}
                      key={itemKey}
                      transition={reduceMotion ? undefined : layoutTransition}
                      className={cn(s.sellerRow, item.isHighlighted && s.sellerRowHighlighted)}
                    >
                      <div className={s.sellerNameRow}>
                        <div className={s.sellerNameWrap}>
                          <p
                            className={cn(
                              s.sellerName,
                              item.isHighlighted && s.sellerNameHighlighted,
                            )}
                          >
                            {item.title}
                          </p>
                          {item.subtitle?.length ? (
                            <p className={s.sellerSubtitle}>{item.subtitle}</p>
                          ) : null}
                        </div>
                        <span className={s.selectBtn}>{t('analysis.ranking.select')}</span>
                      </div>

                      <div className={s.metaRow}>
                        <div className={s.metaLeft}>
                          {item.rating !== null && (
                            <span className={s.ratingBadge}>
                              {item.rating.toFixed(1)}
                              <Star size={8} className={s.starIcon} />
                            </span>
                          )}
                          {item.reviewCount !== null && (
                            <span className={s.reviewCount}>
                              {item.reviewCount} {pluralizeReviews(item.reviewCount, i18n.language)}
                            </span>
                          )}
                        </div>
                        <AnimatedPrice
                          value={item.price}
                          className={cn(s.price, item.isHighlighted && s.priceHighlighted)}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
