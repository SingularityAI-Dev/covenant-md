# @covenant-md/core

The reference library for the [COVENANT.md](https://github.com/SingularityAI-Dev/covenant-md)
design-contract spec. Parse, validate, test, lint, diff, and graph COVENANT.md files.

```bash
npm install @covenant-md/core
```

```js
import { validateCovenant, CovenantTestRunner, createSkillRunner } from '@covenant-md/core';
```

Exposed API: `validateCovenant`, `CovenantTestRunner`, `createSkillRunner`, `lintCovenant`,
`printFindings`, `diffCovenants`, `printDiff`, `graphSkills`.

For the command-line interface see [@covenant-md/cli](https://www.npmjs.com/package/@covenant-md/cli).
The canonical specification is `docs/COVENANT.md` in the repository.

Licence: MIT.
