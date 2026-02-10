import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { Star } from 'lucide-react';
import kaspiLogo from '@/assets/Logo_of_Kaspi_bank.png';
import { useTranslation } from 'react-i18next';
import { formatMoney, cn } from '@/shared/lib/utils';
import sellersBg from '@/assets/sellers-bg.png';
import { RANKING_PAUSE_AT_BOTTOM_MS, RANKING_SHUFFLE_INTERVAL_MS } from '@/shared/constants/app';
import s from './PositionRanking.module.css';

const EASE_STANDARD = [0.4, 0, 0.2, 1];

const animations = {
  layoutTransition: {
    layout: { type: 'tween', duration: 1.2, ease: EASE_STANDARD },
    opacity: { duration: 0.5, ease: EASE_STANDARD },
    y: { duration: 0.5, ease: EASE_STANDARD },
  },
  priceTween: { type: 'tween', duration: 1.0, ease: EASE_STANDARD },
  sellerItem: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 4 },
  },
};

function pluralizeReviews(count, lang) {
  if (lang === 'en') return count === 1 ? 'review' : 'reviews';
  if (lang === 'kk') return 'пікір';
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'отзыва';
  return 'отзывов';
}

function AnimatedPrice({ value, reduceMotion }) {
  const motionValue = useMotionValue(value);
  const formatted = useTransform(motionValue, (latest) => formatMoney(Math.round(latest)));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, animations.priceTween);
    return controls.stop;
  }, [motionValue, reduceMotion, value]);

  return <motion.span>{formatted}</motion.span>;
}

function useAnimatedRanking(renderList) {
  const [isPromoted, setIsPromoted] = useState(false);
  const [pricedOthers, setPricedOthers] = useState(null);
  const timerRef = useRef(undefined);
  const shuffleRef = useRef(undefined);

  const userItem = useMemo(() => renderList.find((i) => i.type === 'user'), [renderList]);
  const leaderPrice = useMemo(() => {
    const topItems = renderList.filter((i) => i.type === 'top');
    if (topItems.length === 0) return 0;
    return Math.min(...topItems.map((i) => i.price));
  }, [renderList]);

  const isAlreadyFirst = useMemo(() => {
    if (!userItem) return false;
    return userItem.price <= leaderPrice || leaderPrice === 0;
  }, [userItem, leaderPrice]);

  const baseOthers = useMemo(() => renderList.filter((i) => i.type !== 'user'), [renderList]);

  useEffect(() => {
    if (baseOthers.length < 2) return;
    const tick = () => {
      setPricedOthers((prev) => {
        const list = (prev ?? baseOthers).map((item) => {
          const base = item._basePrice ?? item.price;
          const swing = Math.round(base * 0.003);
          const delta = Math.floor(Math.random() * (swing * 2 + 1)) - swing;
          return { ...item, _basePrice: base, price: base + delta };
        });
        list.sort((a, b) => a.price - b.price);
        return list;
      });
    };
    shuffleRef.current = window.setInterval(tick, RANKING_SHUFFLE_INTERVAL_MS);
    return () => clearInterval(shuffleRef.current);
  }, [baseOthers]);

  const animatedList = useMemo(() => {
    const others = pricedOthers ?? baseOthers;
    if (!userItem) return others;
    if (isPromoted && !isAlreadyFirst) {
      const promotedUser = { ...userItem, price: leaderPrice - 1 };
      return [promotedUser, ...others];
    }
    const userIndex = renderList.indexOf(userItem);
    const result = [...others];
    result.splice(Math.min(userIndex, result.length), 0, userItem);
    return result;
  }, [renderList, userItem, isPromoted, isAlreadyFirst, leaderPrice, baseOthers, pricedOthers]);

  useEffect(() => {
    if (!userItem || isAlreadyFirst || isPromoted) return;
    timerRef.current = window.setTimeout(() => {
      setIsPromoted(true);
    }, RANKING_PAUSE_AT_BOTTOM_MS);
    return () => clearTimeout(timerRef.current);
  }, [userItem, isAlreadyFirst, isPromoted]);

  return animatedList;
}

export default function PositionRanking({ renderList }) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const animatedList = useAnimatedRanking(renderList);

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
          <div
            className={s.listContainer}
            style={{
              paddingTop: '58%',
              paddingBottom: '14%',
              paddingLeft: '8%',
              paddingRight: '8%',
            }}
          >
            <motion.div layout={!reduceMotion} className={s.listScroll}>
              <AnimatePresence initial={false} mode="popLayout">
                {animatedList.map((item) => {
                  const itemKey = item.uniqueId;
                  return (
                    <motion.div
                      layout={reduceMotion ? false : 'position'}
                      layoutId={reduceMotion ? undefined : `seller-${itemKey}`}
                      key={itemKey}
                      initial={reduceMotion ? false : animations.sellerItem.initial}
                      animate={reduceMotion ? undefined : animations.sellerItem.animate}
                      exit={reduceMotion ? undefined : animations.sellerItem.exit}
                      transition={reduceMotion ? undefined : animations.layoutTransition}
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
                        <p className={cn(s.price, item.isHighlighted && s.priceHighlighted)}>
                          {reduceMotion ? (
                            formatMoney(item.price)
                          ) : (
                            <AnimatedPrice value={item.price} reduceMotion={reduceMotion} />
                          )}
                        </p>
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
