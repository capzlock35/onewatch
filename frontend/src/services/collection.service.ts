import { tmdb } from "./api";
import type { TmdbCollection, TmdbImages } from "@/types";

export const collectionService = {
  async details(id: number): Promise<TmdbCollection> {
    const { data } = await tmdb.get<TmdbCollection>(`/collection/${id}`);
    return data;
  },

  async images(id: number): Promise<TmdbImages> {
    const { data } = await tmdb.get<TmdbImages>(`/collection/${id}/images`);
    return data;
  },

  async translations(id: number): Promise<{ id: number; translations: unknown[] }> {
    const { data } = await tmdb.get(`/collection/${id}/translations`);
    return data;
  },
};
