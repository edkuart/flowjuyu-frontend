# Email Lifecycle Hardening

Backend persistence required for production idempotency:

```sql
ALTER TABLE vendedor_perfil
  ADD COLUMN email_welcome_sent_at TIMESTAMP NULL,
  ADD COLUMN email_activation_sent_at TIMESTAMP NULL,
  ADD COLUMN email_week1_sent_at TIMESTAMP NULL;
```

Expected API shape on seller payloads:

```json
{
  "email_welcome_sent_at": "2026-04-10T12:00:00.000Z",
  "email_activation_sent_at": null,
  "email_week1_sent_at": null
}
```

Where these fields must be exposed:

- Seller registration response for the newly created seller profile
- Admin seller detail endpoint used by lifecycle cron
- Admin seller list endpoint if available

Current repo changes already consume these fields when the backend exposes them.
