# Tab 3 — Meta Guardian & WhatsApp Compliance

## Status: PASS

### Guardian Agent Checks
| Category | Type | Terms Monitored |
|----------|------|-----------------|
| Aggressive Sales | Warning | 15 Hebrew + English terms |
| Housing Discrimination | Critical | 17 terms (race, religion, family) |
| Misleading Claims | Critical | Guaranteed returns, price predictions, risk-free |
| Text-to-Image Ratio | Warning | Meta 20% rule |
| WhatsApp Length | Warning | 1024 char template limit |

### Audit Test Results
| Test | Input | Score | Verdict |
|------|-------|-------|---------|
| Extreme (discrimination + aggression) | 15 violations | 0/100 | BLOCKED |
| Moderate (aggressive, no discrimination) | 7 violations | 0/100 | BLOCKED |
| Clean (professional Hebrew) | 0 violations | 100/100 | SAFE |

### WhatsApp Two-Step Outbound
- `sendServiceFirst()`: Pre-approved Meta template only
- `sendFullMarketingKit()`: Freeform only after user replies (24h window)
- Phone normalization: 052-X → 972X automatic

### Hebrew Linguistic Quality
- Natural conversational Hebrew (not robot-speak)
- Israeli RE market slang: "מיקום פרימיום", "בטאבו", "משטחי קוורץ"
- Emotional openers: "תארו לעצמכם" (imagine)
