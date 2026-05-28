---
covenant_version: "1.0"
name: code-risk-analyze
version: "1.0.0"

interface:
  surface:
    - name: analyze
      accepts: [code_snippet]
      returns: [risk_level, risk_factors, confidence, recommended_action, evidence_refs]

contracts:
  inputs:
    code_snippet:
      type: string
      required: true
  outputs:
    risk_level:
      type: string
      description: "One of: low, medium, high, critical"
    risk_factors:
      type: array
      description: "List of identified risk factor strings"
    confidence:
      type: number
      description: "Confidence in the assessment, 0.0 to 1.0"
    recommended_action:
      type: string
      description: "Suggested next step"
    evidence_refs:
      type: array
      description: "References to lines or patterns that evidence the assessment"
---

# code-risk-analyze

Analyses a code snippet and returns a structured risk assessment with exactly
five named outputs: risk_level, risk_factors, confidence, recommended_action,
evidence_refs.
