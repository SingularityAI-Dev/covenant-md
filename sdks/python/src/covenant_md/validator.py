"""Validator: applies the COVENANT.md conformance rules.

Designed for verdict parity with @covenant-md/core's `validateCovenant` on the
shared `spec/fixtures/` suite. Error message terminology is kept consistent
with the JS validator so the same `expected.rule` substrings match.
"""

import json
import re
from pathlib import Path
from typing import Any, Dict, Union

from jsonschema import Draft202012Validator

from .parser import parse_file
from .types import ValidationResult

_SCHEMA_PATH = Path(__file__).parent / "schema.json"
_SCHEMA = json.loads(_SCHEMA_PATH.read_text(encoding="utf-8"))
_SCHEMA_VALIDATOR = Draft202012Validator(_SCHEMA)

_KEBAB_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
_SEMVER_RE = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+(?:[-+].+)?$")
_VERSION_RE = re.compile(r"^([0-9]+)\.([0-9]+)$")

_STABILITY_VALUES = ("stable", "experimental", "deprecated")


def _new_result() -> ValidationResult:
    return {"valid": False, "errors": [], "warnings": []}


def validate_covenant(path: Union[str, Path]) -> ValidationResult:
    """Validate a COVENANT.md file. Returns {valid, errors, warnings}."""
    result = _new_result()

    try:
        data = parse_file(path)
    except FileNotFoundError as exc:
        result["errors"].append(f"File not found: {exc}")
        return result
    except ValueError as exc:
        result["errors"].append(str(exc))
        return result

    # 1. Required fields.
    if not _present(data.get("covenant_version")):
        result["errors"].append("Missing required field: covenant_version")
    if not _present(data.get("name")):
        result["errors"].append("Missing required field: name")
    if result["errors"]:
        return result

    # 2. covenant_version handling (spec §Versioning).
    cv = str(data["covenant_version"])
    m = _VERSION_RE.match(cv)
    if not m:
        result["errors"].append(
            f'Invalid covenant_version: "{cv}". Expected the form "<major>.<minor>".'
        )
    else:
        major = int(m.group(1))
        minor = int(m.group(2))
        if major != 1:
            result["errors"].append(
                f'Unrecognised covenant_version major: "{cv}". This validator supports major 1.x; got {major}.x.'
            )
        elif minor > 0:
            result["warnings"].append(
                f"covenant_version {cv} is newer than this validator's known minor (1.0); unknown fields under known sections will be ignored."
            )

    # 3. name kebab-case.
    name = str(data["name"])
    if not _KEBAB_RE.match(name):
        result["errors"].append(
            "Field 'name' must be kebab-case (lowercase alphanumeric with hyphens)"
        )

    # 4. version semver if present.
    version_val = data.get("version")
    if version_val not in (None, ""):
        if not _SEMVER_RE.match(str(version_val)):
            result["errors"].append("Field 'version' must be valid semver if present")

    # 5. stability enum if present.
    stability = data.get("stability")
    if stability is not None and stability not in _STABILITY_VALUES:
        result["errors"].append(
            "Field 'stability' must be one of: stable, experimental, deprecated"
        )

    # 6. JSON Schema structural validation for everything else.
    schema_errors = sorted(_SCHEMA_VALIDATOR.iter_errors(data), key=lambda e: list(e.absolute_path))
    for err in schema_errors:
        # Skip duplicate hits on covenant_version pattern (handled in step 2).
        if list(err.absolute_path) == ["covenant_version"]:
            continue
        path_str = ".".join(str(p) for p in err.absolute_path) or "<root>"
        result["errors"].append(f"Schema violation at {path_str}: {err.message}")

    # 7. interface.surface accepts/returns cross-refs to contracts.inputs/outputs.
    surface = _get_path(data, "interface", "surface", default=[]) or []
    inputs = _get_path(data, "contracts", "inputs", default={}) or {}
    outputs = _get_path(data, "contracts", "outputs", default={}) or {}
    for idx, op in enumerate(surface):
        if not isinstance(op, dict):
            continue
        for field in op.get("accepts") or []:
            if field not in inputs:
                result["errors"].append(
                    f"interface.surface[{idx}].accepts references unknown input field: {field}"
                )
        for field in op.get("returns") or []:
            if field not in outputs:
                result["errors"].append(
                    f"interface.surface[{idx}].returns references unknown output field: {field}"
                )

    # 8. quality.fixtures operation and input cross-refs.
    surface_names = {op.get("name") for op in surface if isinstance(op, dict)}
    fixtures = _get_path(data, "quality", "fixtures", default=[]) or []
    for idx, fixture in enumerate(fixtures):
        if not isinstance(fixture, dict):
            continue
        op_name = fixture.get("operation")
        if op_name and op_name not in surface_names:
            result["errors"].append(
                f"quality.fixtures[{idx}].operation references unknown operation: {op_name}"
            )
        fx_input = fixture.get("input") or {}
        if isinstance(fx_input, dict):
            for field in fx_input.keys():
                if field not in inputs:
                    result["errors"].append(
                        f"quality.fixtures[{idx}].input references unknown input field: {field}"
                    )

    result["valid"] = not result["errors"]
    return result


def _present(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str) and value.strip() == "":
        return False
    return True


def _get_path(obj: Dict[str, Any], *keys, default=None):
    cur = obj
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
        if cur is None:
            return default
    return cur
