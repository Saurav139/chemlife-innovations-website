# Domain Docs

This is a single-context repository. The engineering skills use a root `GLOSSARY.md` and `docs/adr/` for domain vocabulary and architectural decisions.

## Before exploring, read these

- `GLOSSARY.md` at the repository root.
- Relevant architectural decision records under `docs/adr/`.

If either is absent, proceed silently. Do not flag the absence or suggest creating empty files upfront. The `domain-modeling` skill, reached via `grill-with-docs` and `improve-codebase-architecture`, creates these lazily when terms or decisions are actually resolved.

## File structure

```text
/
├── GLOSSARY.md
├── docs/adr/
│   └── 0001-short-decision-title.md
└── src/
```

## Use the glossary's vocabulary

Use the glossary's terms for domain concepts in issue titles, refactor proposals, hypotheses and tests. Do not drift to synonyms the glossary explicitly avoids.

If a concept is not defined, first reconsider whether it belongs to the domain; note a genuine gap for `domain-modeling` rather than inventing a definition.

## Flag ADR conflicts

If a proposal contradicts an existing ADR, surface the conflict explicitly, with the ADR identifier and why the decision should be reconsidered. Do not silently override it.
