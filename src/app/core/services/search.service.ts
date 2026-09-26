import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SearchResultItem {
  id: string;
  public_lead_id?: string;
  title: string;
  subtitle: string;
  category: string;
  score?: number;
  stage?: string;
  salesperson?: string;
  url: string;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResultItem[];
  leads: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private api = inject(ApiService);

  public readonly searchResults = signal<SearchResultItem[]>([]);
  public readonly isSearching = signal<boolean>(false);
  public readonly searchError = signal<string | null>(null);

  search(query: string, limit = 15): Observable<SearchResponse> {
    this.isSearching.set(true);
    this.searchError.set(null);
    return this.api.get<SearchResponse>('/search', { q: query, limit });
  }

  async performSearch(query: string, limit = 15): Promise<SearchResultItem[]> {
    if (!query || query.trim().length === 0) {
      this.searchResults.set([]);
      return [];
    }

    this.isSearching.set(true);
    this.searchError.set(null);

    try {
      const res = await this.api.get<SearchResponse>('/search', { q: query.trim(), limit }).toPromise();
      const items = res?.results || [];
      this.searchResults.set(items);
      return items;
    } catch (err: any) {
      this.searchError.set(err?.message || 'Search failed');
      this.searchResults.set([]);
      return [];
    } finally {
      this.isSearching.set(false);
    }
  }

  clearSearch(): void {
    this.searchResults.set([]);
    this.searchError.set(null);
  }
}
