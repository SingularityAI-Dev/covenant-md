"""Parser tests for covenant_md."""

import pytest

from covenant_md import parse, parse_file


def test_parse_minimal():
    text = "---\ncovenant_version: \"1.0\"\nname: hello\n---\n\nbody\n"
    data = parse(text)
    assert data["covenant_version"] == "1.0"
    assert data["name"] == "hello"


def test_parse_no_frontmatter_raises():
    with pytest.raises(ValueError, match="frontmatter"):
        parse("no frontmatter here")


def test_parse_invalid_yaml_raises():
    text = "---\nname: [unclosed\n---\n"
    with pytest.raises(ValueError, match="YAML"):
        parse(text)


def test_parse_file(tmp_path):
    file = tmp_path / "COVENANT.md"
    file.write_text("---\ncovenant_version: \"1.0\"\nname: from-file\n---\n", encoding="utf-8")
    data = parse_file(file)
    assert data["name"] == "from-file"
