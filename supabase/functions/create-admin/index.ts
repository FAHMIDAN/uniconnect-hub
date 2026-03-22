import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ensureAdminRole = async (userId: string) => {
      const { error: deleteError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (insertError) throw insertError;
    };

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.find(u => u.email === "admin@studyhub.com");
    
    if (adminExists) {
      await ensureAdminRole(adminExists.id);
      return new Response(JSON.stringify({ message: "Admin already exists" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@studyhub.com",
      password: "admin",
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });

    if (error) throw error;

    await ensureAdminRole(newUser.user.id);

    return new Response(JSON.stringify({ message: "Admin created", email: "admin@studyhub.com" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
