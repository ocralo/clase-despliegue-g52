import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const BUCKET = "archivos-clase";
const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONES = { "image/png": ".png", "image/jpeg": ".jpg" };

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

export async function POST(request) {
  const { tipo, tamano } = await request.json();
  const extension = EXTENSIONES[tipo];
  if (!extension || !(tamano > 0 && tamano <= MAX_BYTES)) {
    return Response.json({ error: "Archivo no permitido" }, { status: 422 });
  }

  const ruta = `clase/${randomUUID()}${extension}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(ruta);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ruta: data.path, token: data.token });
}
