# Unseen Jo — final Auth email installation

Project: **dkhwwvoplhfjccvjegty**. Use the Dashboard actions below; no terminal commands are needed.

## 1. Upload the logo once

1. Open [Supabase Storage](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/storage/buckets). Click **New bucket**, name it **brand-assets**, enable **Public bucket**, and create it. There is no suitable existing public bucket. Keep **place-images** and **profile-avatars** private. Do not move their files.
2. Open **brand-assets** and click **Upload files**. Select [unseen-jo-email-logo-v1.png](../public/assets/branding/unseen-jo-email-logo-v1.png) from the project's public/assets/branding folder. Keep the filename unchanged and upload at the bucket root. This 10,952-byte PNG is resized from the approved Unseen Jo logo. Upload only this logo; do not add private files or anonymous upload/write policies.
3. Open this address in a signed-out/incognito browser:

https://dkhwwvoplhfjccvjegty.supabase.co/storage/v1/object/public/brand-assets/unseen-jo-email-logo-v1.png

Confirm it displays the real logo and returns **HTTP 200** with an image/png response before installing the email templates. All eight prepared templates already reference this exact URL, so no HTML URL edits are needed after upload. The fresh check before this manual step returned **HTTP 400**, not a working public image. The connector cannot upload the file.

## 2. Install the eight templates

Open [Authentication → Email Templates](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/templates). For each item below:

- Open the named template tab/card. Copy its existing subject and body somewhere safe before replacing them.
- Paste the exact subject below into **Subject**.
- Open the linked **bilingual.html** file in a text editor. Copy its entire contents into the template's **HTML email body / Source** editor, replacing the old HTML. Do not paste it into Preview or Subject.
- Click **Save changes**, then reopen the template to verify the saved subject and HTML.

### 1. Confirm signup

**HTML file:** [supabase/templates/auth/confirmation/bilingual.html](../supabase/templates/auth/confirmation/bilingual.html)

**Exact subject:**

```text
Welcome to Unseen Jo — Verify Your Email / أهلاً بك في Unseen Jo — تأكيد البريد الإلكتروني
```

**Notification switch:** No separate security-notification switch is required. Installing the template does not enable a new sign-in provider or method.

### 2. Reset password

**HTML file:** [supabase/templates/auth/recovery/bilingual.html](../supabase/templates/auth/recovery/bilingual.html)

**Exact subject:**

```text
Reset Your Unseen Jo Password / إعادة تعيين كلمة المرور — Unseen Jo
```

**Notification switch:** No separate security-notification switch is required. Installing the template does not enable a new sign-in provider or method.

### 3. Invite user

**HTML file:** [supabase/templates/auth/invite/bilingual.html](../supabase/templates/auth/invite/bilingual.html)

**Exact subject:**

```text
You're Invited to Unseen Jo / دعوة للانضمام إلى Unseen Jo
```

**Notification switch:** No separate security-notification switch is required. Installing the template does not enable a new sign-in provider or method.

### 4. Magic link

**HTML file:** [supabase/templates/auth/magic_link/bilingual.html](../supabase/templates/auth/magic_link/bilingual.html)

**Exact subject:**

```text
Your Secure Unseen Jo Sign-in Link / رابط دخولك الآمن — Unseen Jo
```

**Notification switch:** No separate security-notification switch is required. Installing the template does not enable a new sign-in provider or method.

### 5. Change email address

**HTML file:** [supabase/templates/auth/email_change/bilingual.html](../supabase/templates/auth/email_change/bilingual.html)

**Exact subject:**

```text
Confirm Your New Unseen Jo Email / تأكيد بريدك الإلكتروني الجديد — Unseen Jo
```

**Notification switch:** No separate security-notification switch is required. Installing the template does not enable a new sign-in provider or method.

### 6. Reauthentication

**HTML file:** [supabase/templates/auth/reauthentication/bilingual.html](../supabase/templates/auth/reauthentication/bilingual.html)

**Exact subject:**

```text
Your Unseen Jo Verification Code / رمز التحقّق من هويتك — Unseen Jo
```

**Notification switch:** No separate security-notification switch is required. Installing the template does not enable a new sign-in provider or method.

### 7. Password changed

**HTML file:** [supabase/templates/auth/password_changed_notification/bilingual.html](../supabase/templates/auth/password_changed_notification/bilingual.html)

**Exact subject:**

```text
Your Unseen Jo Password Has Been Updated / تم تحديث كلمة المرور — Unseen Jo
```

**Notification switch:** The **Password changed** security notification must be enabled to send this email. If disabled, turn on only this matching notification; if already enabled, leave it on.

### 8. Email address changed

**HTML file:** [supabase/templates/auth/email_changed_notification/bilingual.html](../supabase/templates/auth/email_changed_notification/bilingual.html)

**Exact subject:**

```text
Your Unseen Jo Email Has Been Updated / تم تحديث بريدك الإلكتروني — Unseen Jo
```

**Notification switch:** The **Email address changed** security notification must be enabled to send this email. If disabled, turn on only this matching notification; if already enabled, leave it on.

## 3. Preserve the working links and callbacks

Leave all Supabase variables exactly as supplied: **{{ .ConfirmationURL }}** for action emails, **{{ .Token }}** for reauthentication, **{{ .SiteURL }}** for notifications, and **{{ .NewEmail }}** in email-change confirmation. Do not replace them with localhost links.

Do not edit the existing Site URL, redirect allowlist, PKCE settings or callbacks. The app continues using **/auth/callback**, **/admin/recovery**, and **/admin/accept-invite**. The Magic link template needs no new app button or provider.

## 4. Verify activation

1. Reopen all eight templates to confirm they retained the branded subject, HTML and logo URL. Use each template's Preview to check English and Arabic.
2. With a dedicated controlled test inbox/account, request a new signup confirmation and a fresh password-reset email through the local app. Confirm both arrive, show the logo, and open the latest links in the same browser profile and site origin that requested them. Do not use the primary Admin account or password. Do not share links or tokens in screenshots.
3. After a password change and email change on that test account only, check the matching enabled security notification arrives.

**Verification boundary:** The local HTML passes structural checks, supported-variable checks and credential scanning. Browser preview testing uses a local logo fixture; that does not prove public hosting or delivery. Hosted templates remain unverified until the Dashboard saves and checks above are performed. No real account, password, destination record, Auth permission or production deployment was changed.
