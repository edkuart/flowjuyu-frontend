// src/types/review.ts
//
// Canonical review type aligned with the backend API responses.
// Phase 1: includes purchase-linkage fields.

/** A review as returned by GET /api/products/:id/reviews */
export type SellerResponse = {
  id:         number;
  review_id:  string;
  seller_id:  number;
  respuesta:  string;
  created_at: string;
  updated_at: string;
};

export type ReviewSignal = {
  id:            number;
  review_id:     string;
  risk_score:    number;
  trust_score:   number;
  quality_score: number;
  signals:       Record<string, unknown>;
  created_at:    string;
  updated_at:    string;
};

export type ProductReview = {
  id:                string;
  product_id?:       string;
  producto_id?:      string;
  producto_nombre?:  string | null;
  rating:            number;
  comentario:        string | null;
  buyer_nombre:      string;
  verified_purchase: boolean;
  order_date:        string | null;
  created_at:        string;
  helpful_count?:    number;
  estado?:           string;
  seller_response?:  SellerResponse | null;
  review_signal?:    ReviewSignal | null;
};

/** A review as returned by GET /api/buyer/reviews */
export type BuyerReview = {
  id:                string;
  producto_id:       string;
  producto_nombre:   string;
  rating:            number;
  comentario:        string | null;
  created_at:        string;
  buyer_nombre:      string;
  verified_purchase: boolean;
  order_date:        string | null;
  estado:            string;
  helpful_count?:    number;
  can_edit?:         boolean;
  can_delete?:       boolean;
  seller_response?:  SellerResponse | null;
  review_signal?:    ReviewSignal | null;
};

/**
 * @deprecated Use ProductReview or BuyerReview instead.
 * Kept for backward compatibility with components not yet migrated.
 */
export type Review = {
  id:                string | number;
  producto_id?:      string;
  producto_nombre?:  string | null;
  buyer_nombre:      string;
  rating:            number;
  comentario:        string | null;
  created_at?:       string;
  verified_purchase?: boolean;
  order_date?:       string | null;
  estado?:           string;
  helpful_count?:    number;
  seller_response?:  SellerResponse | null;
  review_signal?:    ReviewSignal | null;
};
