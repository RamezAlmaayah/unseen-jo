# Unseen Jo Auth emails

Eight email types share the actual Unseen Jo symbol, white card, mint border, forest-green button and image-independent wordmark. Every type has English (`en`), Arabic RTL (`ar`), and safe bilingual (`bilingual`) HTML and subject files. Plain-text companions are provided for review or an email system that supports a separate text body; the Supabase Dashboard exposes the HTML editor, not a separate text-body field.

Generate: `node scripts/build-auth-emails.mjs`. Optimize the original symbol: `python scripts/prepare-auth-brand-assets.py`. No secrets or actual account links are stored in these files.

**Hosted status: unverified; no installation performed by this agent.** The connected MCP exposes SQL and project inspection, but no Auth config/template update or Storage byte-upload operation. The CLI also reports that no access token is configured, and no authenticated Dashboard browser is connected. The hosted template contents and notification enablement cannot be read with these capabilities. Public Auth settings confirm email signup is enabled, confirmations are required, and all social providers are disabled. No provider or notification has been enabled by this work. Local `deployed: false` values record this project's preparation history; they are not a live inventory of Supabase Auth. See `docs/AUTH_EMAIL_DEPLOYMENT_STATUS.md` for the latest verification.

## 1. Upload the branding asset first

In [Storage](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/storage/buckets), create a **new** public bucket named `brand-assets`, specifically for public branding. Do not change `place-images` or `profile-avatars`; they remain private. Upload only `public/assets/branding/unseen-jo-email-logo-v1.png` at the root. Suggested bucket restrictions: `image/png`, 256 KB maximum, no anonymous upload/update/delete policies. Public downloads are intentional for this single branding asset.

The intended stable HTTPS URL is:

`https://dkhwwvoplhfjccvjegty.supabase.co/storage/v1/object/public/brand-assets/unseen-jo-email-logo-v1.png`

This URL currently returns HTTP 400 (bucket/object absent), so it is **not a verified hosted asset**. Upload before installing the templates. Open it in an incognito window and verify HTTP 200 and the real logo. HTML previews load the same local PNG as a fixture; they are not proof of public hosting. Emails retain visible Unseen Jo text, tagline, content and CTA when external images are blocked.

## 2. Install the templates

Open [Authentication → Email Templates](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/templates). Record the existing HTML and subject before each replacement. For each matching tab, paste the corresponding `bilingual.subject.txt` and `bilingual.html`, save, then reopen to verify the saved content:

| Dashboard type | Folder | Installation scope |
| --- | --- | --- |
| Confirm signup | `confirmation` | Existing public signup |
| Reset password | `recovery` | Shared public/Admin branding; generated link retains its caller's callback |
| Invite user | `invite` | Existing `/admin/accept-invite` flow |
| Change email address | `email_change` | Existing profile change flow, retain current double-confirm setting |
| Reauthentication | `reauthentication` | Contains `{{ .Token }}` only; no fabricated confirmation URL |
| Magic link | `magic_link` | Optional template only; do not add/enable a passwordless sign-in method |
| Password changed | `password_changed_notification` | Install if notification is already enabled; do not infer or change enablement |
| Email address changed | `email_changed_notification` | Install if already enabled |

Use `en` or `ar` files only for a deliberately single-language deployment. Bilingual defaults work for admins and users whose language is unknown. The frontend stores `preferred_language` at signup for presentation only; it is never an authorization claim. No custom mail hook or second Auth system is needed.

Action emails retain **`{{ .ConfirmationURL }}`**, including Supabase's generated token, verification endpoint and redirect. Security notifications link only to **`{{ .SiteURL }}`**. The email-change template additionally uses supported **`{{ .NewEmail }}`**. No hardcoded localhost action links, new Auth routes, or manual token construction.

## 3. Review URL configuration

Open [Authentication → URL Configuration](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/url-configuration). Hosted values could not be read and were not changed. Preserve the existing working development entries. The current application is `http://127.0.0.1:4184`; callbacks used by the code are:

- `/auth/callback` for public signup/recovery/email changes and any existing OAuth callback, with `flow` and `returnTo` query parameters.
- `/admin/recovery` for app-initiated Admin recovery.
- `/admin/accept-invite` for existing Admin invitations.

For local development, allow `http://127.0.0.1:4184/auth/callback**`, `http://127.0.0.1:4184/admin/recovery`, and `http://127.0.0.1:4184/admin/accept-invite`. The callback suffix pattern is development-only and accommodates query parameters. Preserve any localhost/127.0.0.1 aliases actually used; those are different PKCE storage origins. A Site URL of `http://127.0.0.1:4184` suits this local app if no intentional alternative is currently in use. Local `supabase/config.toml` now documents these entries; it is not evidence of a hosted config update.

When a real production domain is approved, set the actual HTTPS Site URL and exact approved production callbacks, including the query forms the application uses. Do not add a wildcard production hostname or an invented domain. Do not run `supabase config push` as part of this task.

## 4. Controlled acceptance after installation

Use a separate test account and inbox, never the primary Admin. Request fresh signup and recovery messages. Open the newest email in the same browser profile **and site origin** used to request it so the SDK can retrieve its PKCE verifier. A different profile/device may confirm the email but cannot complete automatic PKCE sign-in; request a fresh reset in that browser instead. Verify account confirmation is acknowledged only after Supabase validates the link.

Check real Gmail/Outlook/mobile deliveries, blocked-image rendering, Arabic text direction, CTA and fallback link, and the installed notification if enabled. No real email delivery or real password update was tested during implementation. Browser HTML previews simulate email clients; they do not certify Gmail/Outlook desktop rendering. No SMTP service, sender domain, account, permissions or destination content was changed.

Official references: [Email template variables and Management API](https://supabase.com/docs/guides/auth/auth-email-templates), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
