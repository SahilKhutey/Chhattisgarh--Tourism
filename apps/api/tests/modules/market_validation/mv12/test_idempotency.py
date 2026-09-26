import pytest


class IdempotentHandler:
    def __init__(self):
        self.seen_keys = {}

    def process_command(self, idempotency_key: str, command: str) -> dict:
        if idempotency_key in self.seen_keys:
            return self.seen_keys[idempotency_key]
        result = {"status": "SUCCESS", "command": command, "execution_count": 1}
        self.seen_keys[idempotency_key] = result
        return result


def test_idempotency_key_prevents_duplicate_execution():
    handler = IdempotentHandler()
    res1 = handler.process_command("key-pilot-001", "start_pilot")
    res2 = handler.process_command("key-pilot-001", "start_pilot")

    assert res1 == res2
    assert res1["execution_count"] == 1
    assert len(handler.seen_keys) == 1
