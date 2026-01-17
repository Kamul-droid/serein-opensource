/**
 * Types for Content Service
 */

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface RecommendationsRequest {
  beliefs: string[];
  limit?: number;
}
