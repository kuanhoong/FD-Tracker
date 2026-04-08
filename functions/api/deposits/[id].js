function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    ...init,
  });
}

function methodNotAllowed() {
  return json({ error: "Method not allowed" }, { status: 405 });
}

export async function onRequestDelete(context) {
  const id = String(context.params.id || "").trim();

  if (!id) {
    return json({ error: "Deposit id is required." }, { status: 400 });
  }

  const result = await context.env.DB.prepare("DELETE FROM deposits WHERE id = ?")
    .bind(id)
    .run();

  if (!result.success) {
    return json({ error: "Delete failed." }, { status: 500 });
  }

  return json({ ok: true, id });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "DELETE, OPTIONS",
      "cache-control": "no-store",
    },
  });
}

export const onRequestGet = methodNotAllowed;
export const onRequestPost = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestPatch = methodNotAllowed;
