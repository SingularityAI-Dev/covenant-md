"""Python SDK for COVENANT.md.

Parser and validator at Runtime tier, producing identical verdicts to the
TypeScript-compatible reference core on the shared `spec/fixtures/` suite.
"""

from .parser import parse, parse_file
from .types import ValidationResult
from .validator import validate_covenant

__version__ = "0.1.0"
__all__ = ["parse", "parse_file", "validate_covenant", "ValidationResult"]
