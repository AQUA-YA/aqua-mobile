import { useQuery } from '@tanstack/react-query';
import { purifiersApi } from '../api/purifiers.api';
import { waterTypesApi } from '../api/water-types.api';
import { bottleSizesApi } from '../api/bottle-sizes.api';

export function useNearbyPurifiers(params: {
  lat: number;
  lng: number;
  radiusKm?: number;
  waterTypeId?: string;
  bottleSizeId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['purifiers', 'nearby', params],
    queryFn: () => purifiersApi.getNearby(params),
    enabled: !!params.lat && !!params.lng,
  });
}

export function usePurifier(id: string) {
  return useQuery({
    queryKey: ['purifiers', id],
    queryFn: () => purifiersApi.getById(id),
    enabled: !!id,
  });
}

export function usePurifierPrices(id: string) {
  return useQuery({
    queryKey: ['purifiers', id, 'prices'],
    queryFn: () => purifiersApi.getPrices(id),
    enabled: !!id,
  });
}

export function usePurifierRatings(id: string, page = 1) {
  return useQuery({
    queryKey: ['purifiers', id, 'ratings', page],
    queryFn: () => purifiersApi.getRatings(id, { page, limit: 10 }),
    enabled: !!id,
  });
}

export function useWaterTypes() {
  return useQuery({
    queryKey: ['water-types'],
    queryFn: () => waterTypesApi.getAll(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useBottleSizes() {
  return useQuery({
    queryKey: ['bottle-sizes'],
    queryFn: () => bottleSizesApi.getAll(),
    staleTime: 30 * 60 * 1000,
  });
}
