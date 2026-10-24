# Hosted authentication email status — Unseen Jo

Verification date: 22 October 2026. Project: `dkhwwvoplhfjccvjegty`.

**Confirmed live branded templates: 0. Installed during this verification: 0. Local prepared types: 8. Actual hosted contents: unverified.**

This distinction matters: local HTML and `manifest.json` are not evidence of hosted installation. No supported connection available here can retrieve or update hosted Auth template configuration. The authenticated Supabase MCP successfully queried the correct database, but exposes no Auth configuration endpoint or Storage byte-upload tool. The CLI independently returned “Access token not provided.” The browser inventory contains no connected browser. Therefore it is not possible to assert that an owner has, or has not, installed any of these templates separately.

## Per-template inventory

Every HTML file below and its neighboring `bilingual.subject.txt` exist locally. All eight require hosted verification and installation if the branded content is absent.

| Supabase Email Templates tab | Prepared HTML | Truly live? |
| --- | --- | --- |
| Confirm signup | [confirmation](../supabase/templates/auth/confirmation/bilingual.html) | Unverified |
| Reset password | [recovery](../supabase/templates/auth/recovery/bilingual.html) | Unverified |
| Invite user | [invite](../supabase/templates/auth/invite/bilingual.html) | Unverified |
| Magic link | [magic_link](../supabase/templates/auth/magic_link/bilingual.html) | Unverified |
| Change email address | [email_change](../supabase/templates/auth/email_change/bilingual.html) | Unverified |
| Reauthentication | [reauthentication](../supabase/templates/auth/reauthentication/bilingual.html) | Unverified |
| Password changed | [password_changed_notification](../supabase/templates/auth/password_changed_notification/bilingual.html) | Unverified, including enablement |
| Email address changed | [email_changed_notification](../supabase/templates/auth/email_changed_notification/bilingual.html) | Unverified, including enablement |

The only branded artifacts verified in this session are local files/previews. Public Auth settings confirm email signup is enabled and email confirmation is required; they do not expose the installed email bodies or subjects.

## Logo check

The real optimized logo is [unseen-jo-email-logo-v1.png](../public/assets/branding/unseen-jo-email-logo-v1.png).

The templates reference this intended HTTPS URL:

`https://dkhwwvoplhfjccvjegty.supabase.co/storage/v1/object/public/brand-assets/unseen-jo-email-logo-v1.png`

**Fresh HTTP result: 400. Logo does not load publicly.** Read-only database inspection confirms there is no `brand-assets` bucket and no matching object. The existing `place-images` and `profile-avatars` buckets must remain private. No asset was uploaded or bucket created during verification.

## Exact manual installation

1. Open [Storage](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/storage/buckets). Create a separate public bucket named `brand-assets`, intended only for public branding. Upload the PNG above at its root as `unseen-jo-email-logo-v1.png`. Do not make either existing bucket public or grant anonymous uploads. Open the absolute logo URL in a signed-out/incognito browser and confirm HTTP 200 and the correct logo before proceeding.
2. Open [Authentication → Email Templates](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/templates). For each row in the inventory, open the matching template, save a copy of its current subject and HTML, then compare it with the prepared files. If different, paste that folder's `bilingual.subject.txt` into Subject and `bilingual.html` into the HTML body. Save. Reopen the tab and verify the saved subject, logo URL and body. Repeat for all eight supported types. For security notifications, preserve their existing enablement state; do not enable new methods or notifications solely to install branding.
3. Preserve the generated `{{ .ConfirmationURL }}` in signup, recovery, invite, magic-link and email-change templates. Reauthentication uses `{{ .Token }}`. Security notifications use `{{ .SiteURL }}`; email change additionally uses `{{ .NewEmail }}`. Do not substitute localhost URLs or construct a new verification endpoint.
4. Open [Authentication → URL Configuration](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/url-configuration) for inspection only. Keep the working Site URL and existing redirect entries. Application callbacks remain `/auth/callback` (including its existing query parameters), `/admin/recovery`, and `/admin/accept-invite`. Local TOML is not proof of the hosted configuration. No production domain or wildcard allowlist needs to be added for this email-only task.
5. Use a dedicated controlled inbox/account for delivery acceptance. From `http://127.0.0.1:4184`, request a fresh signup confirmation, check the received subject/HTML/logo/link, and open the newest link in the same browser profile and site origin. Then request password recovery for that test account, inspect the new email, and complete recovery in that same browser profile. A different profile lacks the PKCE verifier; request a new link there instead. Keep tokens out of screenshots, logs and reports. Never use the primary Admin password for this test.

A [template-only Management API payload](../supabase/templates/auth/hosted-template-patch.json) is also prepared for a future authorized authenticated integration. It contains subjects and HTML only, with no redirects, provider settings, enablement flags, passwords or credentials. It has **not** been submitted. The supported API is `GET/PATCH https://api.supabase.com/v1/projects/dkhwwvoplhfjccvjegty/config/auth`; authenticate privately, back up existing values, upload/verify the logo first, patch only the included fields, and GET again to compare all eight saved templates. Do not paste a Management API token into chat.

## Delivery and preservation

Real signup/recovery email delivery was **not tested**: no controlled test inbox or usable test-account session is connected. No account explicitly marked for this branding test was found; this does not establish that no other test accounts exist. No real emails were sent, no primary Admin credentials were read or changed, no tokens were exposed, and no account, callback, redirect, tourism content or publication state was modified. All 24 destinations remain present. No production deployment was started.

Evidence: [fresh hosted settings and logo HTTP check](validation/auth-hosted-inspection.json). Supported installation method: [official Supabase email-template documentation](https://supabase.com/docs/guides/auth/auth-email-templates).
