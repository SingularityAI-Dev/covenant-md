"""Parser: extract YAML frontmatter from a COVENANT.md file."""

import re
from pathlib import Path
from typing import Any, Dict, Union

import yaml

_FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---", re.DOTALL)


def parse(text: str) -> Dict[str, Any]:
    """Parse the YAML frontmatter from a COVENANT.md document.

    Raises ValueError if the document has no frontmatter or the frontmatter is
    not a YAML mapping.
    """
    match = _FRONTMATTER_RE.match(text)
    if not match:
        raise ValueError("COVENANT.md must have YAML frontmatter enclosed in ---")
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        raise ValueError(f"Invalid YAML in COVENANT.md: {exc}") from exc
    if data is None:
        return {}
    if not isinstance(data, dict):
        raise ValueError("COVENANT.md frontmatter must be a YAML mapping")
    return data


def parse_file(path: Union[str, Path]) -> Dict[str, Any]:
    """Read a COVENANT.md file and return its parsed YAML frontmatter as a dict."""
    text = Path(path).read_text(encoding="utf-8")
    return parse(text)
