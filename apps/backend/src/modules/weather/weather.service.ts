import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches real-time weather from OpenWeatherMap for a given place.
   * If the API key is missing, it mocks the data.
   */
  async updateWeatherForPlace(placeId: string, lat: number, lon: number) {
    let currentTemp = 30;
    let condition = 'Sunny';
    let humidity = 60;
    let windSpeed = 5.5;
    let monsoonWarning = false;

    if (this.openWeatherApiKey && lat && lon) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherApiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        
        currentTemp = data.main.temp;
        humidity = data.main.humidity;
        condition = data.weather[0]?.main || 'Clear';
        windSpeed = data.wind.speed;
        
        if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('thunderstorm')) {
          monsoonWarning = true;
        }
      } catch (error) {
        this.logger.error(`Failed to fetch live weather for place ${placeId}. Using mock/fallback.`, error.message);
      }
    } else {
      this.logger.warn(`No OpenWeather API key or coordinates missing for place ${placeId}. Mocking weather data.`);
      // Mock Data based on typical CG weather
      if (Math.random() > 0.7) {
        condition = 'Rainy';
        monsoonWarning = true;
      }
    }

    const alerts = monsoonWarning ? JSON.stringify(['Heavy rain expected. Drive carefully.']) : JSON.stringify([]);

    return this.prisma.placeWeather.upsert({
      where: { placeId },
      update: {
        currentTemp,
        condition,
        humidity,
        windSpeed,
        alerts,
        monsoonWarning,
        lastFetchedAt: new Date(),
      },
      create: {
        placeId,
        currentTemp,
        condition,
        humidity,
        windSpeed,
        alerts,
        monsoonWarning,
      },
    });
  }
}
