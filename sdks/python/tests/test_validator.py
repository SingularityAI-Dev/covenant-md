"""Direct validator tests (independent of the shared fixture suite)."""

from covenant_md import validate_covenant


def _write(tmp_path, content):
    p = tmp_path / "COVENANT.md"
    p.write_text(content, encoding="utf-8")
    return p


def test_minimal_valid(tmp_path):
    p = _write(tmp_path, "---\ncovenant_version: \"1.0\"\nname: ok\n---\n")
    result = validate_covenant(p)
    assert result["valid"] is True
    assert result["errors"] == []


def test_missing_covenant_version(tmp_path):
    p = _write(tmp_path, "---\nname: only-name\n---\n")
    result = validate_covenant(p)
    assert result["valid"] is False
    assert any("covenant_version" in e for e in result["errors"])


def test_unknown_major_rejected(tmp_path):
    p = _write(tmp_path, "---\ncovenant_version: \"2.0\"\nname: future\n---\n")
    result = validate_covenant(p)
    assert result["valid"] is False
    assert any("major" in e.lower() for e in result["errors"])


def test_newer_minor_warns(tmp_path):
    p = _write(tmp_path, "---\ncovenant_version: \"1.1\"\nname: newer-minor\n---\n")
    result = validate_covenant(p)
    assert result["valid"] is True
    assert any("newer" in w.lower() for w in result["warnings"])


def test_kebab_case_enforced(tmp_path):
    p = _write(tmp_path, "---\ncovenant_version: \"1.0\"\nname: BadName\n---\n")
    result = validate_covenant(p)
    assert result["valid"] is False
    assert any("kebab-case" in e for e in result["errors"])
