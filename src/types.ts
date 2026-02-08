export interface AnalyzeRequest {
  productUrl: string;
  shopName: string;
}

export interface KaspiAnalysis {
  productId: string;
  leaderShop: string;
  leaderPrice: number;
  myShopFound: boolean;
  myShopPrice: number | null;
  myShopPosition: number | null;
  priceToTop1: number | null;
  offers: { name: string; price: number; rating?: number | null; reviewCount?: number | null }[];
}

export interface LeadPayload {
  name: string;
  phone: string;
  email: string;
  shopName: string;
  description: string;
}
