from app.modules.localization.seed import seed_locales
from app.modules.localization.service import LocalizationService


def test_seed_locales_creates_default_locales(db_session):
    service = LocalizationService()
    assert len(service.get_locales(db_session)) == 0

    seed_locales(db_session)
    locales = service.get_locales(db_session)
    assert len(locales) == 3
    codes = {loc.code for loc in locales}
    assert codes == {"en", "hi", "chg"}

    default_loc = next(loc for loc in locales if loc.code == "en")
    assert default_loc.is_default is True


def test_seed_locales_idempotency(db_session):
    service = LocalizationService()
    seed_locales(db_session)
    seed_locales(db_session)
    locales = service.get_locales(db_session)
    assert len(locales) == 3
