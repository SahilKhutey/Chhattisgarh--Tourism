from __future__ import annotations

import pytest
from app.modules.search.query_parser import parse_query
from app.modules.search.tokenizer import normalize_query


def test_normalize_query():
    assert normalize_query("   waterfalls   ") == "waterfalls"
    assert normalize_query("waterfalls \t\n  near   Raipur") == "waterfalls near Raipur"
    assert normalize_query("") == ""
    assert normalize_query(None) == ""


def test_parse_simple_query():
    parsed = parse_query("waterfalls")
    assert parsed.text == "waterfalls"
    assert parsed.location is None


def test_parse_location_near():
    parsed = parse_query("waterfalls near Raipur")
    assert parsed.text == "waterfalls"
    assert parsed.location == "Raipur"


def test_parse_location_in():
    parsed = parse_query("temples in Bastar")
    assert parsed.text == "temples"
    assert parsed.location == "Bastar"


def test_parse_around():
    parsed = parse_query("caves around Jagdalpur")
    assert parsed.text == "caves"
    assert parsed.location == "Jagdalpur"
