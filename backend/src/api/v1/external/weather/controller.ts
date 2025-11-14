/**
 * @api {get} /api/v1/external/weather/current Get Current Weather
 * @apiName GetCurrentWeather
 * @apiGroup Weather
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves current weather data for a specified location
 *
 * @apiParam {String} location Location name (city, coordinates, etc.)
 * @apiParam {String} [unit=celsius] Temperature unit (celsius or fahrenheit)
 *
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {Object} data Weather data
 * @apiSuccess {Number} data.temperature Current temperature
 * @apiSuccess {String} data.temperatureUnit Temperature unit
 * @apiSuccess {String} data.location Location name
 * @apiSuccess {String} data.lastUpdate Last update timestamp
 * @apiSuccess {String} data.connectionStatus Connection status (online/offline/outdated)
 *
 * @apiError {String} locationRequired Location parameter is required
 * @apiError {String} invalidUnit Invalid temperature unit
 * @apiError {String} weatherApiRequestFailed Failed to fetch weather data
 */

import { Request, Response, NextFunction } from 'express';
import {
  fetchWeatherData,
  convertTemperature,
  getCachedWeatherData,
  hasCachedData,
} from '@/services/weather';
import { successResponse, errorResponse } from '@/utils/response';

export async function getCurrentWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { location, unit = 'celsius' } = req.query;

    /**
     * @validation Verify required parameters
     * @throw {Error} When location is missing
     */
    if (!location || typeof location !== 'string') {
      res.status(400).json(errorResponse('locationRequired'));
      return;
    }

    /**
     * @validation Verify unit parameter is valid
     * @throw {Error} When unit is invalid
     */
    if (unit !== 'celsius' && unit !== 'fahrenheit') {
      res.status(400).json(errorResponse('invalidUnit'));
      return;
    }

    let weatherData;

    try {
      /**
       * @rule {be-api-integration} Fetch fresh data from external API
       */
      weatherData = await fetchWeatherData(location);
    } catch (error: any) {
      /**
       * @rule {be-offline-fallback} Use cached data when API fails
       */
      if (hasCachedData()) {
        weatherData = getCachedWeatherData();
      } else {
        res.status(503).json(errorResponse('weatherApiRequestFailed'));
        return;
      }
    }

    /**
     * @rule {be-temperature-conversion} Convert temperature if needed
     */
    if (unit === 'fahrenheit' && weatherData.temperatureUnit === 'celsius') {
      weatherData.temperature = convertTemperature({
        value: weatherData.temperature,
        from: 'celsius',
        to: 'fahrenheit',
      });
      weatherData.temperatureUnit = 'fahrenheit';
    }

    /**
     * @output {WeatherData, 1, 1}
     * @column {Number} temperature - Current temperature value
     * @column {String} temperatureUnit - Temperature unit (celsius/fahrenheit)
     * @column {String} location - Location name
     * @column {String} lastUpdate - Last update timestamp
     * @column {String} connectionStatus - Connection status
     */
    res.json(successResponse(weatherData));
  } catch (error: any) {
    next(error);
  }
}

/**
 * @api {post} /api/v1/external/weather/refresh Refresh Weather Data
 * @apiName RefreshWeather
 * @apiGroup Weather
 * @apiVersion 1.0.0
 *
 * @apiDescription Manually refreshes weather data for a location
 *
 * @apiParam {String} location Location name
 *
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {Object} data Updated weather data
 *
 * @apiError {String} locationRequired Location parameter is required
 * @apiError {String} weatherApiRequestFailed Failed to fetch weather data
 */
export async function refreshWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { location } = req.body;

    /**
     * @validation Verify required parameters
     * @throw {Error} When location is missing
     */
    if (!location || typeof location !== 'string') {
      res.status(400).json(errorResponse('locationRequired'));
      return;
    }

    /**
     * @rule {be-api-integration} Force fresh data fetch
     */
    const weatherData = await fetchWeatherData(location);

    res.json(successResponse(weatherData));
  } catch (error: any) {
    if (error.message === 'weatherApiRequestFailed') {
      res.status(503).json(errorResponse('weatherApiRequestFailed'));
    } else if (error.message === 'temperatureOutOfRange') {
      res.status(400).json(errorResponse('temperatureOutOfRange'));
    } else {
      next(error);
    }
  }
}
