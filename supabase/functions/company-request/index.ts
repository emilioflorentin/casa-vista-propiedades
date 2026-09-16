import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { companyName, contactName, email, phone } = await req.json();

    if (!companyName || !contactName || !email || !phone) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
        Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { error: dbError } = await supabase.from("company_requests").insert({
      company_name: companyName,
      contact_name: contactName,
      email,
      phone,
    });

    if (dbError) {
      console.error("db insert failed", dbError);
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aviso por correo (best-effort: la solicitud ya está guardada)
    let emailSent = false;
    try {
      const form = new FormData();
      form.append("Empresa", companyName);
      form.append("Persona de contacto", contactName);
      form.append("Email", email);
      form.append("Teléfono", phone);
      form.append("Tipo de cuenta", "Profesional / Empresa");
      form.append("_captcha", "false");
      form.append("_subject", "Solicitud de cuenta de empresa en PisoGo");
      form.append("_template", "table");

      const res = await fetch(
        "https://formsubmit.co/ajax/info@nazarihomes.com",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Referer: "https://nazarihomes.com/auth",
            Origin: "https://nazarihomes.com",
          },
          body: form,
        },
      );
      const data = await res.json().catch(() => null);
      emailSent = res.ok && String(data?.success) === "true";
      if (!emailSent) console.error("formsubmit response", data);
    } catch (e) {
      console.error("formsubmit failed", e);
    }

    return new Response(JSON.stringify({ ok: true, emailSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("company-request error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
