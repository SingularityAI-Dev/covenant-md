"""Type definitions for the COVENANT.md Python SDK."""

from typing import List, TypedDict


class ValidationResult(TypedDict):
    valid: bool
    errors: List[str]
    warnings: List[str]
