# Hackathon Runners website

This is a static website using Supabase Auth and a Supabase Postgres table for shared admin-managed content. Keep the HTML, CSS, JavaScript, and `supabase-config.js` at the repository root. Username sign-in is resolved by a Supabase Edge Function; the service-role key is never shipped to the browser.

## Configure Supabase

1. Create a Supabase project.
2. In **Authentication → Users**, create the administrator account with `onkarbsawant11@gmail.com` and a strong password. Disable public sign-ups in **Authentication → Providers → Email**.
3. Open the Supabase SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql). The script creates the content table, admin allow-list, and row-level security policies.
4. Add that Auth account to the administrator allow-list. The permanent sign-in username is `onkarbsawant11@gmail.com`:

	```sql
	insert into public.site_admins (user_id, username, email)
	select id, 'onkarbsawant11@gmail.com', email
	from auth.users
	where email = 'onkarbsawant11@gmail.com'
	on conflict (user_id) do update
	set username = excluded.username, email = excluded.email;
	```

5. Install the Supabase CLI, link the repository with `supabase link --project-ref YOUR_PROJECT_REF`, then deploy the username login function with `supabase functions deploy admin-login --no-verify-jwt`. The login endpoint is intentionally reachable before sign-in; it looks up the username server-side and validates the password through Supabase Auth. Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Never expose the service-role key in website files or Vercel client settings.
6. Copy the Supabase project URL and public anon/publishable key into `supabase-config.js`. These client values are public by design.
7. Sign in with username `onkarbsawant11@gmail.com` and the password belonging to the Auth account created above. The Edge Function verifies the permanent identifier and password with Supabase Auth. **Deploy changes** writes shared content through authenticated RLS policies. After configuration, published content loads from Supabase for all browsers, including private/incognito windows.

On the first authenticated login, if the Supabase content arrays are still empty, existing profile, project, text-section, and site-identity drafts from that browser are loaded into the editor. Review them and click **Deploy changes** to migrate them into Supabase. Other browsers do not have access to that old local content.

The username is fixed and cannot be changed from the website. Password changes reauthenticate with Supabase Auth before updating the account password. Keep the Auth account email as `onkarbsawant11@gmail.com` so it matches the permanent username mapping.

## Deploy on Vercel

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project** and import the repository.
3. Use the **Other** framework preset and leave the build command empty.
4. Deploy. Vercel serves `index.html` and its relative CSS/JavaScript assets from the project root.

## Security model

Supabase Auth verifies admin passwords. The website's public anon key is restricted by database row-level security: visitors can read published content, while only user IDs explicitly listed in `site_admins` can insert or update it. The service-role key is never used by the browser. Secure access depends on running the SQL setup and adding only trusted administrator IDs to the allow-list.
