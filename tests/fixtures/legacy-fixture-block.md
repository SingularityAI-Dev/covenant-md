---
covenant_version: "1.0"
name: legacy-skill
version: "0.1.0"
---

# legacy-skill

Some descriptive markdown.

```covenant-fixture
{
  "name": "first-fixture",
  "skill": "legacy-skill",
  "operation": "do-thing",
  "input": {"foo": "bar"},
  "depends_on": [],
  "retry": 0
}
```

More markdown body.

```covenant-fixture
{
  "name": "second-fixture",
  "skill": "legacy-skill",
  "operation": "do-thing",
  "input": {"foo": "baz"},
  "depends_on": ["first-fixture"],
  "retry": 0
}
```
