from __future__ import annotations

from math import asin, cos, radians, sin, sqrt


def haversine_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculates the great-circle distance between two points on the Earth in kilometers."""
    earth_radius = 6371.0

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    # Bound value to [0.0, 1.0] to guard against floating-point inaccuracies
    a = min(1.0, max(0.0, a))
    return 2 * earth_radius * asin(sqrt(a))


def calculate_bounding_box(
    latitude: float,
    longitude: float,
    radius_km: float,
) -> tuple[float, float, float, float]:
    """
    Computes an approximate (min_lat, max_lat, min_lon, max_lon) bounding box
    to quickly index-scan candidates before calculating exact Haversine distances.
    """
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * max(0.1, cos(radians(latitude))))

    min_lat = latitude - lat_delta
    max_lat = latitude + lat_delta
    min_lon = longitude - lon_delta
    max_lon = longitude + lon_delta

    return min_lat, max_lat, min_lon, max_lon
