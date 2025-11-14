/**
 * @summary
 * Weather service exports.
 *
 * @module services/weather
 */

export {
  fetchWeatherData,
  getCachedWeatherData,
  convertTemperature,
  hasCachedData,
  clearCache,
} from './weatherService';

export type {
  WeatherData,
  WeatherApiResponse,
  CachedWeatherData,
  TemperatureConversionParams,
} from './weatherTypes';
