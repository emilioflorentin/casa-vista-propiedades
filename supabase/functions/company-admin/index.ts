import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "No autorizado" }, 401);
    const caller = userData.user;

    const body = await req.json();
    const action = String(body.action || "");

    // ---------- Superadmin: invite company owner ----------
    if (action === "invite_company") {
      const { data: isSa } = await admin.rpc("has_role", { _user_id: caller.id, _role: "superadmin" });
      if (!isSa) return json({ error: "Solo el superadministrador" }, 403);

      const { data: company } = await admin.from("companies").select("*").eq("id", body.companyId).single();
      if (!company) return json({ error: "Empresa no encontrada" }, 404);

      const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : undefined;
      let ownerId: string | null = null;
      const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(company.email, {
        redirectTo,
        data: {
          full_name: company.contact_name,
          user_type: "empresa",
          company_name: company.company_name,
          phone: company.phone,
          platform: "nazari",
        },
      });
      if (invited?.user) {
        ownerId = invited.user.id;
      } else {
        // Already registered: link the existing account
        const { data: prof } = await admin.from("profiles").select("id").ilike("email", company.email).maybeSingle();
        if (!prof) return json({ error: invErr?.message || "No se pudo invitar" }, 400);
        ownerId = prof.id;
        await admin.from("profiles").update({ user_type: "empresa", company_name: company.company_name }).eq("id", ownerId);
      }

      await admin.from("companies").update({ owner_user_id: ownerId }).eq("id", company.id);
      await admin.from("company_members").upsert(
        {
          company_id: company.id,
          user_id: ownerId,
          role: "owner",
          full_name: company.contact_name,
          email: company.email,
          phone: company.phone,
          is_active: true,
        },
        { onConflict: "user_id" },
      );
      return json({ ok: true, invited: !!invited?.user });
    }

    // ---------- Company owner actions ----------
    const { data: me } = await admin
      .from("company_members")
      .select("company_id, role, is_active")
      .eq("user_id", caller.id)
      .maybeSingle();
    if (!me || me.role !== "owner" || !me.is_active) return json({ error: "Solo el responsable de la empresa" }, 403);
    const companyId = me.company_id;

    if (action === "create_advisor") {
      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const password = String(body.password || "");
      if (!fullName || fullName.length > 100) return json({ error: "Nombre obligatorio" }, 400);
      if (!emailRe.test(email)) return json({ error: "Email no válido" }, 400);
      if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);

      const { data: usage } = await admin.rpc("get_company_usage", { p_company_id: companyId });
      const u = usage?.[0];
      if (!u || u.company_status !== "active") return json({ error: "La empresa no está activa" }, 400);
      if (Number(u.used_advisors) >= Number(u.max_advisors))
        return json({ error: `Tu plan permite como máximo ${u.max_advisors} asesores` }, 400);

      const { data: company } = await admin.from("companies").select("company_name").eq("id", companyId).single();
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone,
          user_type: "asesor",
          company_name: company?.company_name,
          platform: "nazari",
        },
      });
      if (error || !created.user) return json({ error: error?.message || "No se pudo crear" }, 400);

      await admin.from("company_members").insert({
        company_id: companyId,
        user_id: created.user.id,
        role: "advisor",
        full_name: fullName,
        email,
        phone,
      });
      return json({ ok: true });
    }

    if (action === "set_advisor_active") {
      const { data: target } = await admin
        .from("company_members")
        .select("user_id, role")
        .eq("id", body.memberId)
        .eq("company_id", companyId)
        .maybeSingle();
      if (!target || target.role !== "advisor") return json({ error: "Asesor no encontrado" }, 404);
      const active = !!body.active;
      if (active) {
        const { data: usage } = await admin.rpc("get_company_usage", { p_company_id: companyId });
        const u = usage?.[0];
        if (u && Number(u.used_advisors) >= Number(u.max_advisors))
          return json({ error: `Tu plan permite como máximo ${u.max_advisors} asesores` }, 400);
      }
      await admin.auth.admin.updateUserById(target.user_id, { ban_duration: active ? "none" : "876000h" });
      await admin.from("company_members").update({ is_active: active }).eq("id", body.memberId);
      return json({ ok: true });
    }

    if (action === "delete_advisor") {
      const { data: target } = await admin
        .from("company_members")
        .select("user_id, role")
        .eq("id", body.memberId)
        .eq("company_id", companyId)
        .maybeSingle();
      if (!target || target.role !== "advisor") return json({ error: "Asesor no encontrado" }, 404);
      await admin.from("company_members").delete().eq("id", body.memberId);
      await admin.auth.admin.deleteUser(target.user_id);
      return json({ ok: true });
    }

    return json({ error: "Acción no válida" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error inesperado" }, 500);
  }
});
