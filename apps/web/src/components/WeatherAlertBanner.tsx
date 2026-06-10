import React from 'react';

interface WeatherProps {
  currentTemp?: number;
  condition?: string;
  alerts?: string[];
  monsoonWarning?: boolean;
}

export function WeatherAlertBanner({ weather }: { weather?: WeatherProps }) {
  if (!weather || (!weather.monsoonWarning && (!weather.alerts || weather.alerts.length === 0))) {
    return null; // Only render if there's a significant warning
  }

  return (
    <div className="w-full mb-8 rounded-xl overflow-hidden shadow-lg border border-red-500/30 bg-gradient-to-r from-red-950/40 to-orange-950/40 backdrop-blur-md">
      <div className="p-4 flex items-start gap-4">
        <div className="flex-shrink-0 bg-red-500/20 p-2 rounded-full">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-300">
            {weather.monsoonWarning ? 'Active Monsoon Warning' : 'Weather Advisory'}
          </h3>
          <p className="text-red-200/80 text-sm mt-1">
            Current Condition: {weather.condition} {weather.currentTemp && `(${weather.currentTemp}°C)`}
          </p>
          {weather.alerts && weather.alerts.length > 0 && (
            <ul className="list-disc list-inside mt-2 text-sm text-red-200/70">
              {weather.alerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
