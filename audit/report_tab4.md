# Tab 4 — Dispatcher & Social Automation

## Status: PASS

### Autopilot Dispatcher
| Quality Score | Decision | Action |
|---------------|----------|--------|
| ≥ 90 | auto_publish | Straight to social queue |
| 70–89 | needs_review | Manual approval required |
| < 70 | hold | Manual intervention |

### Employee Briefing Agent
| Role | Deliverables | Priority |
|------|-------------|----------|
| Graphic Designer | 4 assets (IG feed, Story, Reel thumb, FB cover) | Urgent / 24h |
| Social Media Manager | 5 tasks (IG Reel, TikTok, FB, WhatsApp, metrics) | Urgent / 48h |

### Mission Control Integration
- Compliance badge on every Kanban card (green/amber/red shield)
- Dispatch gated: score < 100 blocks "Go Live" button
- Brand-filtered Kanban board (Toro / מרכז הנכסים / Kidomedia)

### CLI Automation
| Command | Pipeline |
|---------|----------|
| `toro hunt <url>` | Scout → 8 agents → Guardian → Dispatcher → Linear |
| `toro status` | Latest 5 Linear issues in terminal table |
| `toro deploy` | git commit → push → Linear sync issue |
| `toro check` | Full monorepo type-check |
