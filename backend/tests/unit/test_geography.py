import pytest


def validate_point(
    latitude: float,
    longitude: float,
):
    if not -90 <= latitude <= 90:
        raise ValueError("invalid latitude")

    if not -180 <= longitude <= 180:
        raise ValueError("invalid longitude")


def test_valid_point():
    validate_point(21.2787, 81.8661)


@pytest.mark.parametrize(
    "latitude,longitude",
    [
        (91, 81),
        (-91, 81),
        (21, 181),
        (21, -181),
    ],
)
def test_invalid_point(latitude, longitude):
    with pytest.raises(ValueError):
        validate_point(latitude, longitude)
