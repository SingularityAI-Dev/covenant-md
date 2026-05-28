# @covenant-md/cli

The command-line interface for [COVENANT.md](https://github.com/SingularityAI-Dev/covenant-md).

```bash
npm install -g @covenant-md/cli
```

Six commands:

```bash
covenant validate <path>          # validate a COVENANT.md against the spec
covenant test <skillDir>          # run a skill's fixtures through the contract runner
covenant generate                 # scaffold a new skill blueprint (interactive)
covenant lint <skillDir>          # heuristic design-quality checks
covenant diff <old> <new>         # classify changes as breaking, additive, or cosmetic
covenant graph <skillsDir>        # emit a dependency graph (DOT or JSON)
```

Built on [@covenant-md/core](https://www.npmjs.com/package/@covenant-md/core). The canonical
specification is `docs/COVENANT.md` in the repository.

Licence: MIT.
