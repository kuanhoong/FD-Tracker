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

function normalizeDepositPayload(payload) {
  return {
    id: String(payload.id || crypto.randomUUID()),
    bankName: String(payload.bankName || "").trim(),
    depositName: String(payload.depositName || "").trim(),
    principal: Number(payload.principal || 0),
    rate: Number(payload.rate || 0),
    startDate: String(payload.startDate || ""),
    tenureMonths: Number(payload.tenureMonths || 0),
    maturityDate: String(payload.maturityDate || ""),
    notes: String(payload.notes || "").trim(),
  };
}

function validateDeposit(deposit) {
  if (!deposit.bankName) return "Bank name is required.";
  if (!deposit.depositName) return "Deposit name is required.";
  if (!Number.isFinite(deposit.principal) || deposit.principal <= 0) return "Principal must be greater than zero.";
  if (!Number.isFinite(deposit.rate) || deposit.rate < 0) return "Rate must be zero or greater.";
  if (!deposit.startDate) return "Start date is required.";
  if (!deposit.maturityDate) return "Maturity date is required.";
  if (!Number.isInteger(deposit.tenureMonths) || deposit.tenureMonths < 0) return "Tenure must be zero or greater.";
  if (deposit.tenureMonths === 0 && !deposit.maturityDate) return "Tenure is required.";
  return null;
}

function mapRow(row) {
  return {
    id: row.id,
    bankName: row.bank_name,
    depositName: row.deposit_name,
    principal: row.principal,
    rate: row.rate,
    startDate: row.start_date,
    tenureMonths: row.tenure_months,
    maturityDate: row.maturity_date,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function onRequestGet(context) {
  const result = await context.env.DB.prepare(
    `SELECT
      id,
      bank_name,
      deposit_name,
      principal,
      rate,
      start_date,
      tenure_months,
      maturity_date,
      notes,
      created_at,
      updated_at
    FROM deposits
    ORDER BY maturity_date ASC, created_at ASC`
  ).all();

  return json({ deposits: (result.results || []).map(mapRow) });
}

export async function onRequestPost(context) {
  const payload = normalizeDepositPayload(await context.request.json());
  const error = validateDeposit(payload);

  if (error) {
    return json({ error }, { status: 400 });
  }

  await context.env.DB.prepare(
    `INSERT INTO deposits (
      id,
      bank_name,
      deposit_name,
      principal,
      rate,
      start_date,
      tenure_months,
      maturity_date,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      bank_name = excluded.bank_name,
      deposit_name = excluded.deposit_name,
      principal = excluded.principal,
      rate = excluded.rate,
      start_date = excluded.start_date,
      tenure_months = excluded.tenure_months,
      maturity_date = excluded.maturity_date,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP`
  )
    .bind(
      payload.id,
      payload.bankName,
      payload.depositName,
      payload.principal,
      payload.rate,
      payload.startDate,
      payload.tenureMonths,
      payload.maturityDate,
      payload.notes
    )
    .run();

  return json({ deposit: payload }, { status: 201 });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "GET, POST, OPTIONS",
      "cache-control": "no-store",
    },
  });
}

export const onRequestPut = methodNotAllowed;
export const onRequestPatch = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;
