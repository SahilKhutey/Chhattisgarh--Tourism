import time
import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.domain.errors import CircuitBreakerOpenError
from app.modules.social.sync.circuit_breaker import CircuitState, ProviderCircuitBreaker


def test_circuit_breaker_transitions():
    cb = ProviderCircuitBreaker(failure_threshold=3, cooldown_seconds=0.1)
    platform = SocialPlatform.YOUTUBE

    # Initial state is CLOSED
    assert cb.can_execute(platform) is True
    cb.assert_can_execute(platform)

    # 1st and 2nd failure remain CLOSED
    cb.record_failure(platform)
    assert cb.can_execute(platform) is True
    cb.record_failure(platform)
    assert cb.can_execute(platform) is True

    # 3rd failure trips to OPEN
    cb.record_failure(platform)
    assert cb.can_execute(platform) is False
    with pytest.raises(CircuitBreakerOpenError):
        cb.assert_can_execute(platform)

    # Cooldown expires -> transitions to HALF_OPEN (probing)
    time.sleep(0.12)
    assert cb.can_execute(platform) is True

    # Successful probe restores to CLOSED
    cb.record_success(platform)
    assert cb.can_execute(platform) is True


def test_circuit_breaker_independent_platforms():
    cb = ProviderCircuitBreaker(failure_threshold=2)

    # Fail YouTube
    cb.record_failure(SocialPlatform.YOUTUBE)
    cb.record_failure(SocialPlatform.YOUTUBE)

    # YouTube is OPEN
    assert cb.can_execute(SocialPlatform.YOUTUBE) is False

    # Instagram remains normal CLOSED
    assert cb.can_execute(SocialPlatform.INSTAGRAM) is True
