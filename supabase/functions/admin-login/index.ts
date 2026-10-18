import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Authentication service is not configured" }, 500);
  }

  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }
  if (username !== "onkarbsawant11@gmail.com" || password.length < 1 || password.length > 256) {
    return jsonResponse({ error: "Invalid username or password" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: adminRecord, error: lookupError } = await adminClient
    .from("site_admins")
    .select("user_id, email")
    .eq("username", username)
    .maybeSingle();

  if (lookupError || !adminRecord) {
    return jsonResponse({ error: "Username or password is incorrect" }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
    email: adminRecord.email,
    password,
  });

  if (authError || !authData.user || authData.user.id !== adminRecord.user_id || !authData.session) {
    return jsonResponse({ error: "Username or password is incorrect" }, 401);
  }

  return jsonResponse({ session: authData.session });
});
