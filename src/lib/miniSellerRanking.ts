export type Top5Seller = {
  rank: number;
  name: string;
  price: number;
};

export type UserShopBase = {
  rankBase: number;
  priceBase: number;
  name?: string;
};

export type ComputedUser = {
  rank: number;
  price: number;
  name?: string;
};

export type MiniSellerRankingRenderItem = {
  uniqueId: string;
  type: 'top' | 'user';
  rankLabel: string;
  title: string;
  subtitle: string;
  price: number;
  isHighlighted: boolean;
};

const normalizeShopKey = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/["«»'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export type ScoringInputs = {
  maxGainCap?: number;
  maxDiscountPct?: number;
};

const isFiniteNumber = (value: unknown): value is number => Number.isFinite(Number(value));

export function computeSimulatedUser(
  userShopBase: UserShopBase | null | undefined,
  sliderValue: number,
  scoringInputs: ScoringInputs = {}
): ComputedUser | null {
  if (!userShopBase) return null;
  const basePrice = Number(userShopBase.priceBase);
  const baseRank = Number(userShopBase.rankBase);
  if (!isFiniteNumber(basePrice) || !isFiniteNumber(baseRank) || baseRank <= 0) return null;

  const discountPct = Math.max(0, Number(sliderValue) || 0);
  const maxDiscountPct = scoringInputs.maxDiscountPct ?? 5;
  const safeMaxDiscount = maxDiscountPct > 0 ? maxDiscountPct : 5;
  const price = Math.max(0, Math.round(basePrice * (1 - discountPct / 100)));

  const maxGainCap = scoringInputs.maxGainCap ?? 5;
  const maxGain = Math.min(maxGainCap, Math.max(baseRank - 1, 0));
  const improvement = Math.round((discountPct / safeMaxDiscount) * maxGain);
  const rank = Math.max(1, baseRank - improvement);

  return {
    rank,
    price,
    name: userShopBase.name
  };
}

export function buildMiniRating(
  top5Sellers: Top5Seller[],
  computedUser: ComputedUser | null | undefined,
  userShopName: string
): MiniSellerRankingRenderItem[] {
  const topSorted = Array.isArray(top5Sellers) ? [...top5Sellers] : [];
  topSorted.sort((a, b) => Number(a.rank) - Number(b.rank));

  const seenTopKeys = new Set<string>();
  const topRenderBase: MiniSellerRankingRenderItem[] = [];
  for (const seller of topSorted) {
    const name = String(seller?.name ?? '');
    const key = normalizeShopKey(name);
    if (!key) continue;
    if (seenTopKeys.has(key)) continue;
    seenTopKeys.add(key);

    topRenderBase.push({
      uniqueId: `top-${key}`,
      type: 'top',
      rankLabel: `#${Number(seller.rank)}`,
      title: name,
      subtitle: '',
      price: Number(seller.price),
      isHighlighted: false
    });
  }

  const hasUserData =
    computedUser &&
    isFiniteNumber(computedUser.rank) &&
    isFiniteNumber(computedUser.price) &&
    Number(computedUser.rank) > 0;

  if (!hasUserData) {
    return topRenderBase;
  }

  const userRank = Number(computedUser!.rank);
  const userPrice = Number(computedUser!.price);
  const userKey = normalizeShopKey(String(computedUser?.name ?? userShopName ?? ''));
  const withoutUserDuplicates = userKey
    ? topRenderBase.filter((item) => normalizeShopKey(item.title) !== userKey)
    : topRenderBase;

  const userItem: MiniSellerRankingRenderItem = {
    uniqueId: 'user',
    type: 'user',
    rankLabel: `#${userRank}`,
    title: 'Ваш магазин',
    subtitle: String(userShopName ?? ''),
    price: userPrice,
    isHighlighted: true
  };

  if (userRank >= 1 && userRank <= 5) {
    const withoutRank = withoutUserDuplicates.filter((item) => item.rankLabel !== userItem.rankLabel);
    const insertIndex = withoutRank.findIndex((item) => Number(item.rankLabel.slice(1)) > userRank);
    if (insertIndex === -1) {
      return [...withoutRank, userItem];
    }
    return [...withoutRank.slice(0, insertIndex), userItem, ...withoutRank.slice(insertIndex)];
  }

  return [...withoutUserDuplicates, userItem];
}
