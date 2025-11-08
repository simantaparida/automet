# Lint Debt Snapshot

Generated on **2025-11-08** by running:

```bash
npx eslint pages src --format unix > lint-report.txt
cat lint-report.txt | cut -d: -f1 | sed 's#/[^/]*$##' | sort | uniq -c | sort -nr | head
```

## Top Offending Directories (current run)

| Directory | Issues |
| --------- | -----: |
| `pages/blog` | 621 |
| `pages` (root-level components) | 119 |
| `pages/jobs` | 63 |
| `pages/assets` | 50 |
| `pages/sites` | 35 |
| `pages/clients` | 32 |
| `pages/inventory/[id]` | 30 |
| `pages/inventory` | 28 |
| `pages/sites/[id]` | 27 |
| `pages/assets/[id]` | 27 |

These counts reflect ESLint errors and warnings (including Prettier formatting) and will guide the gradual expansion of the `lint:core` script. Refresh this report whenever cleanup work lands to track progress.

