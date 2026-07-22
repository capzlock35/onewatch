import axios from "axios";

const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY ?? "";

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "en-US",
  },
});
