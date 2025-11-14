/**
 * @summary
 * Type definitions for weather service.
 * Defines interfaces and types for weather data structures.
 *
 * @module services/weather/weatherTypes
 */

export interface WeatherData {
  temperature: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  location: string;
  lastUpdate: Date;
  connectionStatus: 'online' | 'offline' | 'outdated';
}

export interface WeatherApiResponse {
  current: {
    temp_c: number;
    temp_f: number;
    last_updated: string;
  };
  location: {
    name: string;
    region: string;
    country: string;
  };
}

export interface CachedWeatherData extends WeatherData {
  cachedAt: Date;
}

export interface TemperatureConversionParams {
  value: number;
  from: 'celsius' | 'fahrenheit';
  to: 'celsius' | 'fahrenheit';
}
