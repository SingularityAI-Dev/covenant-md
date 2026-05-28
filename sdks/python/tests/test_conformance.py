"""Conformance parity: the Python validator must reach the same verdict as the
TypeScript-compatible reference core on every fixture in `spec/fixtures/`.
"""

import json
from pathlib import Path

import pytest

from covenant_md import validate_covenant

# tests/ -> python/ -> sdks/ -> repo root
REPO_ROOT = Path(__file__).resolve().parents[3]
SPEC_FIXTURES_DIR = REPO_ROOT / "spec" / "fixtures"
CATEGORIES = ["valid", "invalid", "edge-cases"]


def _collect_cases():
    cases = []
    for category in CATEGORIES:
        directory = SPEC_FIXTURES_DIR / category
        if not directory.exists():
            continue
        for md_path in sorted(directory.glob("*.covenant.md")):
            expected_path = md_path.with_name(
                md_path.name.replace(".covenant.md", ".expected.json")
            )
            if not expected_path.exists():
                continue
            expected = json.loads(expected_path.read_text(encoding="utf-8"))
            cases.append(
                pytest.param(
                    str(md_path),
                    expected,
                    id=f"{category}/{md_path.name}",
                )
            )
    return cases


@pytest.mark.parametrize("md_path,expected", _collect_cases())
def test_conformance_parity(md_path, expected):
    result = validate_covenant(md_path)

    if expected.get("valid") is True:
        assert result["valid"] is True, (
            f"Expected valid, got errors: {result['errors']}"
        )
    else:
        assert result["valid"] is False, "Expected invalid, but validator said valid"
        rule = expected.get("rule")
        if rule:
            joined = " | ".join(result["errors"]).lower()
            assert rule.lower() in joined, (
                f"Expected rule '{rule}' in errors, got: {result['errors']}"
            )
