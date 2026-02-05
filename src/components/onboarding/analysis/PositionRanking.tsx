import React, { useEffect } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Award } from 'lucide-react';
import { cn, formatMoney } from '../../../lib/utils';
import { MiniSellerRankingRenderItem } from '../../../lib/miniSellerRanking';

interface PositionRankingProps {
  renderList: MiniSellerRankingRenderItem[];
}

const layoutEase: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const priceEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const AnimatedPrice: React.FC<{ value: number; reduceMotion: boolean }> = ({ value, reduceMotion }) => {
  const motionValue = useMotionValue(value);
  const formatted = useTransform(motionValue, (latest) => formatMoney(Math.round(latest)));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      type: 'tween',
      duration: 0.28,
      ease: 'easeOut'
    });
    return controls.stop;
  }, [motionValue, reduceMotion, value]);

  return <motion.span>{formatted}</motion.span>;
};

const PositionRanking: React.FC<PositionRankingProps> = ({ renderList }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400">Позиция на Kaspi</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">Мини-рейтинг продавцов</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Award size={18} />
        </div>
      </div>

      <motion.div layout={!reduceMotion} className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {renderList.map((item, index) => {
            const isLeader = item.rankLabel === '#1';
            const itemKey = item.uniqueId;
            return (
              <motion.div
                layout={reduceMotion ? false : 'position'}
                layoutId={reduceMotion ? undefined : `seller-${itemKey}`}
                key={itemKey}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        layout: { type: 'tween', duration: 0.35, ease: layoutEase },
                        opacity: { duration: 0.2, ease: priceEase },
                        y: { duration: 0.2, ease: priceEase }
                      }
                }
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-2xl border',
                  item.isHighlighted ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white',
                  isLeader && 'shadow-sm'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold',
                      isLeader ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500',
                      item.isHighlighted && 'bg-blue-600 text-white'
                    )}
                  >
                    {item.rankLabel}
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', item.isHighlighted ? 'text-blue-700' : 'text-gray-900')}>
                      {item.title}
                    </p>
                    {item.subtitle?.length ? (
                      <p className="text-xs text-blue-500 whitespace-pre-wrap">{item.subtitle}</p>
                    ) : null}
                  </div>
                </div>
                <p className={cn('text-sm font-semibold', item.isHighlighted ? 'text-blue-700' : 'text-gray-600')}>
                  {reduceMotion ? (
                    formatMoney(item.price)
                  ) : (
                    <AnimatedPrice value={item.price} reduceMotion={reduceMotion} />
                  )}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PositionRanking;
