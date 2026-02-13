import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { cn, formatMoney } from '@/shared/lib/utils';
import s from './StickyResult.module.css';

const StickyResult = forwardRef(function StickyResult(
  {
    storeName,
    rank,
    price,
    rawPrice,
    leaderName,
    leaderPrice,
    rawLeaderPrice,
    isLeader,
    visible,
    onCta,
  },
  ref,
) {
  const { t } = useTranslation();

  /* ── Price difference logic ── */
  const hasBothPrices =
    Number.isFinite(rawPrice) &&
    Number.isFinite(rawLeaderPrice) &&
    rawPrice > 0 &&
    rawLeaderPrice > 0;
  const diff = hasBothPrices ? rawPrice - rawLeaderPrice : 0;
  const diffAmount = hasBothPrices ? formatMoney(Math.abs(diff)) : null;

  let diffText = t('analysis.sticky.pricesEqual');
  let desktopDiffText = t('analysis.sticky.pricesEqual');
  let diffClass = s.diffNeutral;
  if (hasBothPrices && diff > 0) {
    diffText = t('analysis.sticky.needReduce', { amount: formatMoney(diff) });
    desktopDiffText = t('analysis.sticky.needReduceShort');
    diffClass = s.diffNegative;
  } else if (hasBothPrices && diff < 0) {
    diffText = t('analysis.sticky.youLower', { amount: formatMoney(Math.abs(diff)) });
    desktopDiffText = t('analysis.sticky.youLowerShort');
    diffClass = s.diffPositive;
  }

  return (
    <div ref={ref} className={cn(s.root, visible && s.rootVisible)}>
      <div className={s.inner}>
        {/* ══ Desktop / Tablet: original layout ══ */}
        <div className={s.desktopOnly}>
          <p className={s.sectionLabel}>{t('analysis.sticky.resultsTitle')}</p>
          {isLeader ? (
            <div className={s.soloBlock}>
              <div className={s.rankBadge}>#{rank ?? '—'}</div>
              <div className={s.soloInfo}>
                <p className={s.storeName}>{storeName || '—'}</p>
                <div className={s.soloMeta}>
                  <span className={s.metaItem}>Позиция: #{rank ?? '—'}</span>
                  <span className={s.metaDot} />
                  <span className={s.metaItem}>{price || '—'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={s.columns}>
              <div className={s.column}>
                <div className={s.columnHeader}>
                  <div className={s.rankBadge}>#{rank ?? '—'}</div>
                  <p className={s.storeName}>{storeName || '—'}</p>
                </div>
                <div className={s.columnMeta}>
                  <span className={s.metaItem}>Позиция: #{rank ?? '—'}</span>
                  <span className={s.metaDot} />
                  <span className={s.metaItem}>{price || '—'}</span>
                </div>
              </div>
              <div className={s.divider} />
              <div className={s.column}>
                <div className={s.columnHeader}>
                  <div className={cn(s.rankBadge, s.rankBadgeLeader)}>#1</div>
                  <p className={s.storeName}>{leaderName || '—'}</p>
                </div>
                <div className={s.columnMeta}>
                  <span className={s.metaItem}>Позиция: #1</span>
                  <span className={s.metaDot} />
                  <span className={s.metaItem}>{leaderPrice || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══ Desktop >=1024px: orange floating dashboard ══ */}
        <div className={s.desktopStickyOnly}>
          <div className={s.dRow}>
            <div className={s.dLeft}>
              <div className={s.dRankGroup}>
                <span className={s.dYourRank}>
                  {t('analysis.sticky.you')} #{rank ?? '—'}
                </span>
                <ArrowRight size={16} className={s.mArrow} />
                <span className={s.dGoalRank}>{t('analysis.sticky.goal')} #1</span>
              </div>
              <span className={s.dTrialTag}>{t('analysis.sticky.trial')}</span>
            </div>

            <div className={s.dPrices}>
              <div className={s.dPriceCol}>
                <span className={s.dPriceLabel}>{t('analysis.sticky.you')}</span>
                <span className={s.dPriceValue}>{price || '—'}</span>
              </div>
              <div className={s.dPriceDivider} />
              <div className={s.dPriceCol}>
                <span className={s.dPriceLabel}>{t('analysis.sticky.leader')}</span>
                <span className={s.dPriceValue}>{leaderPrice || '—'}</span>
              </div>
              <div className={s.dPriceDivider} />
              <div className={s.dDiffCol}>
                <span className={s.dDiffLabel}>{t('analysis.sticky.diff')}:</span>
                {hasBothPrices ? (
                  <span className={s.dDiffInline}>
                    <span className={cn(s.dDiffValue, s.dDiffText, diffClass)}>{desktopDiffText}</span>
                    <span className={cn(s.dDiffAmount, diffClass)}>{diffAmount}</span>
                  </span>
                ) : (
                  <span className={cn(s.dDiffValue, s.dDiffText, diffClass)}>{diffText}</span>
                )}
              </div>
            </div>

            <button className={s.dCtaBtn} onClick={onCta}>
              {t('analysis.sticky.cta')}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ══ Mobile: expanded mini-dashboard ══ */}
        <div className={s.mobileOnly}>
          {/* Row 1: rank + goal + trial badge */}
          <div className={s.mRow1}>
            <div className={s.mRankGroup}>
              <span className={s.mYourRank}>
                {t('analysis.sticky.you')} #{rank ?? '—'}
              </span>
              <ArrowRight size={14} className={s.mArrow} />
              <span className={s.mGoalRank}>{t('analysis.sticky.goal')} #1</span>
            </div>
            <span className={s.mTrialTag}>{t('analysis.sticky.trial')}</span>
          </div>

          {/* Row 2: prices in 2 columns */}
          <div className={s.mRow2}>
            <div className={s.mPriceCol}>
              <span className={s.mPriceLabel}>{t('analysis.sticky.you')}</span>
              <span className={s.mPriceValue}>{price || '—'}</span>
            </div>
            <div className={s.mPriceDivider} />
            <div className={s.mPriceCol}>
              <span className={s.mPriceLabel}>{t('analysis.sticky.leader')}</span>
              <span className={s.mPriceValue}>{leaderPrice || '—'}</span>
            </div>
          </div>

          {/* Row 3: difference */}
          <div className={s.mRow3}>
            <span className={s.mDiffLabel}>{t('analysis.sticky.diff')}:</span>
            <span className={cn(s.mDiffValue, diffClass)}>{diffText}</span>
          </div>

          {/* CTA */}
          <button className={s.mCtaBtn} onClick={onCta}>
            {t('analysis.sticky.cta')}
          </button>
          <p className={s.mCancelText}>{t('analysis.sticky.cancel')}</p>
        </div>

      </div>
    </div>
  );
});

export default StickyResult;
