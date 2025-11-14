/**
 * @summary
 * Weather service business logic.
 * Handles weather data retrieval, caching, and temperature conversions.
 *
 * @module services/weather/weatherService
 */

import { config } from '@/config';
import {
  WeatherData,
  WeatherApiResponse,
  CachedWeatherData,
  TemperatureConversionParams,
} from './weatherTypes';

let weatherCache: CachedWeatherData | null = null;

/**
 * @summary
 * Fetches current weather data from external API.
 *
 * @function fetchWeatherData
 * @param {string} location - Location to fetch weather for
 * @returns {Promise<WeatherData>} Weather data
 * @throws {Error} When API call fails
 */
export async function fetchWeatherData(location: string): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${config.weather.apiUrl}/current.json?key=${config.weather.apiKey}&q=${encodeURIComponent(
        location
      )}`
    );

    if (!response.ok) {
      throw new Error('weatherApiRequestFailed');
    }

    const data: WeatherApiResponse = await response.json();

    /**
     * @validation Verify API returned valid temperature data
     * @throw {Error} When temperature is outside plausible range
     */
    if (data.current.temp_c < -90 || data.current.temp_c > 60) {
      throw new Error('temperatureOutOfRange');
    }

    const weatherData: WeatherData = {
      temperature: parseFloat(data.current.temp_c.toFixed(1)),
      temperatureUnit: 'celsius',
      location: `${data.location.name}, ${data.location.region || data.location.country}`,
      lastUpdate: new Date(data.current.last_updated),
      connectionStatus: 'online',
    };

    /**
     * @rule {be-cache-update} Update cache with fresh data
     */
    weatherCache = {
      ...weatherData,
      cachedAt: new Date(),
    };

    return weatherData;
  } catch (error: any) {
    /**
     * @rule {be-offline-fallback} Return cached data when API fails
     */
    if (weatherCache) {
      return getCachedWeatherData();
    }
    throw error;
  }
}

/**
 * @summary
 * Retrieves cached weather data with status indicators.
 *
 * @function getCachedWeatherData
 * @returns {WeatherData} Cached weather data with appropriate status
 * @throws {Error} When no cached data is available
 */
export function getCachedWeatherData(): WeatherData {
  if (!weatherCache) {
    throw new Error('noCachedDataAvailable');
  }

  const now = new Date();
  const cacheAge = now.getTime() - weatherCache.cachedAt.getTime();
  const oneHour = 60 * 60 * 1000;
  const twentyFourHours = 24 * 60 * 60 * 1000;

  /**
   * @rule {be-cache-expiration} Determine cache status based on age
   */
  let connectionStatus: 'online' | 'offline' | 'outdated' = 'offline';
  if (cacheAge > twentyFourHours) {
    connectionStatus = 'outdated';
  } else if (cacheAge > oneHour) {
    connectionStatus = 'outdated';
  }

  return {
    ...weatherCache,
    connectionStatus,
  };
}

/**
 * @summary
 * Converts temperature between Celsius and Fahrenheit.
 *
 * @function convertTemperature
 * @param {TemperatureConversionParams} params - Conversion parameters
 * @returns {number} Converted temperature value
 */
export function convertTemperature(params: TemperatureConversionParams): number {
  const { value, from, to } = params;

  if (from === to) {
    return parseFloat(value.toFixed(1));
  }

  /**
   * @rule {be-temperature-conversion} Apply standard conversion formulas
   */
  if (from === 'celsius' && to === 'fahrenheit') {
    return parseFloat(((value * 9) / 5 + 32).toFixed(1));
  }

  if (from === 'fahrenheit' && to === 'celsius') {
    return parseFloat((((value - 32) * 5) / 9).toFixed(1));
  }

  return parseFloat(value.toFixed(1));
}

/**
 * @summary
 * Checks if cached data exists and is valid.
 *
 * @function hasCachedData
 * @returns {boolean} True if valid cached data exists
 */
export function hasCachedData(): boolean {
  return weatherCache !== null;
}

/**
 * @summary
 * Clears the weather cache.
 *
 * @function clearCache
 */
export function clearCache(): void {
  weatherCache = null;
}
