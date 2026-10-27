# Insights inbox

The moderator decides which posts from ChemLife's channels appear on the Insights page, at `/admin/insights`.

- **YouTube** uploads and **blog** (WordPress) posts come in by themselves. So do **Instagram** posts once
  `INSTAGRAM_ACCESS_TOKEN` is set.
- **LinkedIn** posts, and anything else, are added by pasting the post's link into "Add a post". The title, text,
  picture and date are filled in from the post where the site allows it.
- New posts wait under **Waiting**. **Add to page** puts one on the Insights page straight away; **Hide** keeps it
  off. **Feature** chooses the big card at the top for its type (blog, video, podcast); otherwise the newest is
  featured. **Edit** changes how a post appears on the page, never the original.
- The inbox checks for new posts when the moderator opens it (at most every 10 minutes), with **Check for new
  posts**, and from a scheduled job if one is set up.

## Setting it up on Hostinger

1. hPanel → **Databases → MySQL Databases**: create a database and a user. Note the host shown there.
2. hPanel → the website's **environment variables**:
   - `DATABASE_URL` = `mysql://USER:PASSWORD@HOST:3306/DATABASE` (URL-encode special characters in the password,
     e.g. `@` as `%40`)
   - `ADMIN_PASSWORD` = a long password for the moderator
3. Redeploy, then open `/admin/insights` and sign in. The first visit copies the page's current posts in as
   approved, so the Insights page doesn't change until something is added or hidden.

The staging and live sites should each have their own database, so testing on staging never changes the live page.

### Optional

- **Instagram:** create a Meta app with the *Instagram API with Instagram Login* product, add ChemLife's Instagram
  business account, generate an access token and set it as `INSTAGRAM_ACCESS_TOKEN`. It lasts 60 days; the inbox
  renews it every week and keeps the renewed one in the database. Setting a new one in hPanel replaces it.
- **Scheduled checks:** set `INSIGHTS_SYNC_KEY` to a long random string and add an hPanel cron job, e.g. hourly:
  `curl -fsS "https://chemlifeinnovations.com/api/admin/insights/sync?key=THE_KEY"`

## How it works

- `db.ts`: the MySQL tables (created on first use): posts, copied pictures, settings.
- `sources.ts`: reading YouTube, WordPress and Instagram. `preview.ts`: filling in a pasted link.
- `sync.ts`: checking for new posts, and starting the inbox from the built-in list (`FALLBACK_INSIGHTS` in
  `src/lib/insights.ts`).
- `src/lib/insights.ts` `getInsights()`: the approved posts once the inbox has started; the built-in list if the
  database isn't set up or can't be reached.
- Instagram and LinkedIn picture addresses expire, so their pictures are copied into the database and served from
  `/api/insights/media/<id>.<ext>`.
