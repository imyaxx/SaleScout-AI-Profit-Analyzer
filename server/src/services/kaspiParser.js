const CITY_ID_DEFAULT = '750000000';
const LIMIT_DEFAULT = 5;
const ZONE_ID_DEFAULT = ['Magnum_ZONE1'];
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 15000;

const KASPI_HOST = 'kaspi.kz';
const KASPI_API_BASE = 'https://kaspi.kz/yml/offer-view/offers';

function normalizeShopName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/["«»'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractProductIdFromPath(pathname) {
  if (!pathname) return null;
  const matches = String(pathname).match(/(\d{6,})/g);
  if (!matches || matches.length === 0) return null;
  return matches[matches.length - 1];
}

function extractOffers(payload) {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.offers)) return payload.offers;
  if (Array.isArray(payload.data?.offers)) return payload.data.offers;
  if (Array.isArray(payload.payload?.offers)) return payload.payload.offers;
  return [];
}

function extractOfferName(offer) {
  return (
    offer?.merchantName ||
    offer?.shopName ||
    offer?.sellerName ||
    offer?.name ||
    ''
  );
}

function extractOfferRating(offer) {
  const raw =
    offer?.merchantRating ??
    offer?.rating ??
    offer?.sellerRating ??
    offer?.shopRating ??
    offer?.merchantInfo?.rating ??
    offer?.seller?.rating ??
    null;
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 5
    ? Math.round(value * 10) / 10
    : null;
}

function extractOfferReviewCount(offer) {
  const raw =
    offer?.merchantReviewsQuantity ??
    offer?.reviewsQuantity ??
    offer?.reviewCount ??
    offer?.reviewsCount ??
    offer?.totalReviews ??
    offer?.merchantInfo?.reviewsQuantity ??
    offer?.seller?.reviewsQuantity ??
    null;
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

function extractOfferPrice(offer) {
  const raw =
    offer?.price ??
    offer?.finalPrice ??
    offer?.priceValue ??
    offer?.amount ??
    offer?.price?.value ??
    offer?.price?.amount;

  if (raw === null || raw === undefined) return null;
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) ? value : null;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(url, options) {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_COUNT; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${text}`);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_COUNT) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Kaspi request failed');
}

export async function analyzeKaspiProduct(productUrl, myShopName) {
  if (!productUrl) {
    throw new Error('Введите ссылку на товар');
  }

  let parsedUrl = null;
  try {
    parsedUrl = new URL(productUrl);
  } catch (error) {
    throw new Error('Некорректная ссылка');
  }

  if (!parsedUrl.hostname.endsWith(KASPI_HOST)) {
    throw new Error('Платформа не поддерживается. Вставьте ссылку на товар Kaspi.');
  }

  const productId = extractProductIdFromPath(parsedUrl.pathname);
  if (!productId) {
    throw new Error('Не удалось определить productId');
  }

  const cityId = parsedUrl.searchParams.get('c') || CITY_ID_DEFAULT;
  const limit = Number(process.env.KASPI_LIMIT) || LIMIT_DEFAULT;
  const zoneId = process.env.KASPI_ZONE_ID
    ? process.env.KASPI_ZONE_ID.split(',').map((item) => item.trim()).filter(Boolean)
    : ZONE_ID_DEFAULT;

  const normalizedTarget = normalizeShopName(myShopName);
  if (!normalizedTarget) {
    throw new Error('Введите название магазина');
  }

  let leaderShop = null;
  let leaderPrice = null;
  let myShopFound = false;
  let myShopPrice = null;
  let myShopPosition = null;
  const offersMap = new Map();

  let page = 0;
  let globalOffset = 0;
  while (true) {
    const url = `${KASPI_API_BASE}/${productId}`;

    const body = {
      cityId,
      id: productId,
      merchantUID: [],
      limit,
      page,
      sortOption: 'PRICE',
      zoneId
    };

    const payload = await requestWithRetry(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/*',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/json; charset=UTF-8',
        Origin: 'https://kaspi.kz',
        Referer: productUrl,
        'User-Agent': 'Mozilla/5.0',
        'X-Description-Enabled': 'true',
        'X-KS-City': cityId,
        Cookie: `kaspi.storefront.cookie.city=${cityId}`
      },
      body: JSON.stringify(body)
    });

    const offers = extractOffers(payload);
    if (!Array.isArray(offers) || offers.length === 0) {
      if (page === 0) {
        throw new Error('Не удалось получить список продавцов');
      }
      break;
    }

    if (page === 0) {
      const first = offers[0];
      leaderShop = extractOfferName(first);
      leaderPrice = extractOfferPrice(first);
    }

    offers.forEach((offer, index) => {
      const rawName = extractOfferName(offer);
      const offerName = normalizeShopName(rawName);
      if (!offerName) return;

      const price = extractOfferPrice(offer);
      if (price === null) return;

      const rating = extractOfferRating(offer);
      const reviewCount = extractOfferReviewCount(offer);

      if (!offersMap.has(offerName)) {
        offersMap.set(offerName, { name: rawName, price, rating, reviewCount });
      } else if (price < offersMap.get(offerName).price) {
        offersMap.set(offerName, { name: rawName, price, rating, reviewCount });
      }

      if (offerName !== normalizedTarget) return;

      const position = globalOffset + index + 1;
      if (myShopPosition === null) {
        myShopPosition = position;
      }
      if (myShopPrice === null || price < myShopPrice) {
        myShopPrice = price;
      }
      myShopFound = true;
    });

    globalOffset += offers.length;

    if (offers.length < limit) {
      break;
    }

    page += 1;
  }

  if (leaderPrice === null || leaderShop === null) {
    throw new Error('Не удалось определить лидера');
  }

  if (!myShopFound) {
    return {
      productId,
      leaderShop,
      leaderPrice,
      myShopFound: false,
      myShopPrice: null,
      myShopPosition: null,
      priceToTop1: null,
      offers: Array.from(offersMap.values())
    };
  }

  const priceToTop1 = myShopPrice - leaderPrice;

  return {
    productId,
    leaderShop,
    leaderPrice,
    myShopFound: true,
    myShopPrice,
    myShopPosition,
    priceToTop1,
    offers: Array.from(offersMap.values())
  };
}
