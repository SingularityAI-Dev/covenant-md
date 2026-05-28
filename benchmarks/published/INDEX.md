# Published benchmark runs

Each entry below is a real, reproducible run with raw outputs, the scoring
function version, and an honest analysis. Results are published whether or not
they support the COVENANT.md contract thesis, matching the disclosure norm of
the sibling logic-md project.

| Date | Run | Task | Model | Trials | Headline |
| --- | --- | --- | --- | --- | --- |
| 2026-05-28 | [sonnet-interface-adherence](2026-05-28-sonnet-interface-adherence/) | interface-adherence | claude-sonnet-4-6 | 10 | No measurable delta on a trivial single-operation task (100/100). Expected on capable frontier models; the bench needs harder tasks or weaker models to expose an effect. |
| 2026-05-28 | [haiku-interface-adherence](2026-05-28-haiku-interface-adherence/) | interface-adherence | claude-haiku-4-5-20251001 | 10 | Same null result on the cheaper model. The bottleneck is the task, not the model tier. |
