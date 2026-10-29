# Insights inbox

The moderator decides which posts from ChemLife's channels appear on the Insights page, at `/admin/insights`.

- **YouTube** uploads and **blog** (WordPress) posts come in by themselves. So do **Instagram** posts once
  `INSTAGRAM_ACCESS_TOKEN` is set.
- **LinkedIn** posts come in by themselves when `LINKEDIN_FEED_URL` is set (see below); otherwise, like anything
  else, they are added by pasting the post's link into "Add a post". The title, text,
  picture and date are filled in from the post where the site allows it.
- New posts wait under **Waiting**, marked **New** if they arrived since your last visit (remembered per browser).
  **Add to page** puts one on the Insights page straight away; **Hide** keeps it off. Tick several posts (or
  **Select all**) to decide for all of them at once; every decision can be undone from the notification. The search
  box looks through every tab. **Feature** chooses the big card at the top for its type (blog, video, podcast);
  otherwise the newest is featured. **Edit** changes how a post appears on the page, never the original, and shows
  the card as the page will.
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

- **Demo on staging without signing in:** set `INSIGHTS_DEMO` to `true` (then `ADMIN_PASSWORD` isn't needed). The
  inbox shows a "Demo" notice, and anyone who can open the staging site can use it. It never applies on
  chemlifeinnovations.com. Remove it after the demo.
- **Instagram:** create a Meta app with the *Instagram API with Instagram Login* product, add ChemLife's Instagram
  business account, generate an access token and set it as `INSTAGRAM_ACCESS_TOKEN`. It lasts 60 days; the inbox
  renews it every week and keeps the renewed one in the database. Setting a new one in hPanel replaces it.
- **LinkedIn automatically:** LinkedIn only lets approved apps read a company page's posts, so use a feed service.
  With RSS.app, make a feed from the public company page (its LinkedIn feed generator), and set `LINKEDIN_FEED_URL`
  to the feed's address (RSS, Atom and JSON feeds all work). Each check reads the 20 newest posts; new ones wait
  under **Waiting** with their text, picture and date. Treat the address as private: anyone with it can read the feed.
- **Scheduled checks:** set `INSIGHTS_SYNC_KEY` to a long random string and add an hPanel cron job, e.g. hourly:
  `curl -fsS "https://chemlifeinnovations.com/api/admin/insights/sync?key=THE_KEY"`

## How it works

- `db.ts`: the MySQL tables (created on first use): posts, copied pictures, settings.
- `sources.ts`: reading YouTube, WordPress and Instagram. `preview.ts`: filling in a pasted link.
- `sync.ts`: checking for new posts, and starting the inbox from the built-in list (`FALLBACK_INSIGHTS` in
  `src/lib/insights.ts`). Once per database it also brings blog posts imported before October 2026 up to today's
  summaries and titles.
- `card.ts`: how a post becomes an Insights card, for the page and for the inbox's preview (`src/components/InsightCard.tsx`).
- `src/lib/insights.ts` `getInsights()`: the approved posts once the inbox has started; the built-in list if the
  database isn't set up or can't be reached.
- Instagram and LinkedIn picture addresses expire, so their pictures are copied into the database and served from
  `/api/insights/media/<id>.<ext>`.
