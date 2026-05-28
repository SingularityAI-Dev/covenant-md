"""Shared test fixtures for the covenant-md Python SDK."""

from pathlib import Path

import pytest

# tests/ -> python/ -> sdks/ -> repo root
REPO_ROOT = Path(__file__).resolve().parents[3]
SPEC_FIXTURES_DIR = REPO_ROOT / "spec" / "fixtures"


@pytest.fixture
def spec_fixtures_dir() -> Path:
    return SPEC_FIXTURES_DIR
