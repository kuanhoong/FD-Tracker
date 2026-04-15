const NOTIFIED_KEY = "fd-tracker.notified-reminders";
const DATA_FILE_PATH = "data/deposits.json";
const THEME_KEY = "fd-tracker.theme";

const fdForm = document.getElementById("fdForm");
const bankNameInput = document.getElementById("bankName");
const depositNameInput = document.getElementById("depositName");
const principalInput = document.getElementById("principal");
const rateInput = document.getElementById("rate");
const startDateInput = document.getElementById("startDate");
const tenureMonthsInput = document.getElementById("tenureMonths");
const notesInput = document.getElementById("notes");
const summaryCards = document.getElementById("summaryCards");
const projectionCards = document.getElementById("projectionCards");
const reminderList = document.getElementById("reminderList");
const depositTableBody = document.getElementById("depositTableBody");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const enableNotificationsBtn = document.getElementById("enableNotificationsBtn");
const formEnableNotificationsBtn = document.getElementById("formEnableNotificationsBtn");
const storageStatus = document.getElementById("storageStatus");
const notificationStatus = document.getElementById("notificationStatus");
const portfolioTotal = document.getElementById("portfolioTotal");
const portfolioGrowth = document.getElementById("portfolioGrowth");
const estimatedReturn = document.getElementById("estimatedReturn");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const investmentCount = document.getElementById("investmentCount");
const scrollInvestmentsBtn = document.getElementById("scrollInvestmentsBtn");
const downloadDataBtn = document.getElementById("downloadDataBtn");
const calculatedMaturityDate = document.getElementById("calculatedMaturityDate");
const calculatedInterest = document.getElementById("calculatedInterest");
const calculatedMaturityValue = document.getElementById("calculatedMaturityValue");
const riskProfileTitle = document.getElementById("riskProfileTitle");
const riskProfileCopy = document.getElementById("riskProfileCopy");
const readOnlyNotice = document.getElementById("readOnlyNotice");
const saveButton = fdForm?.querySelector('button[type="submit"]');

const appState = {
  deposits: [],
  storageMode: "json",
  storageIssue: "",
};

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function pluralize(value, singular, plural = `${singular}s`) {
  return `${value} ${Math.abs(value) === 1 ? singular : plural}`;
}

function loadNotifiedReminders() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveNotifiedReminders(map) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "Turn off dark mode" : "Turn on dark mode");
}

function toDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function daysBetween(start, end) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / msPerDay);
}

function addMonths(baseDate, months) {
  const copy = new Date(baseDate);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function toStorageDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizeDepositsForDownload() {
  return appState.deposits.map((deposit) => ({
    id: deposit.id,
    bankName: deposit.bankName,
    depositName: deposit.depositName,
    principal: Number(deposit.principal),
    rate: Number(deposit.rate),
    startDate: deposit.startDate,
    tenureMonths: Number(deposit.tenureMonths),
    maturityDate: deposit.maturityDate,
    notes: deposit.notes || "",
  }));
}

function downloadDeposits() {
  const fileContents = JSON.stringify(sanitizeDepositsForDownload(), null, 2);
  const blob = new Blob([fileContents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `fd-tracker-deposits-${toStorageDate(startOfToday())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(toDate(value));
}

function formatDateFromDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function calculateExpectedInterest(deposit) {
  const principal = Number(deposit.principal);
  const annualRate = Number(deposit.rate) / 100;
  const totalDays = Math.max(daysBetween(toDate(deposit.startDate), getMaturityDateForDeposit(deposit)), 0);
  const durationInYears = totalDays / 365;
  return principal * annualRate * durationInYears;
}

function calculateProjectedValue(deposit) {
  return Number(deposit.principal) + calculateExpectedInterest(deposit);
}

function getMaturityDateForDeposit(deposit) {
  if (deposit.startDate && deposit.tenureMonths) {
    return addMonths(toDate(deposit.startDate), Number(deposit.tenureMonths));
  }

  if (deposit.maturityDate) {
    return toDate(deposit.maturityDate);
  }

  return toDate(deposit.startDate);
}

function getEnrichedDeposits() {
  const today = startOfToday();
  return appState.deposits
    .map((deposit) => ({
      ...deposit,
      tenureMonths: deposit.tenureMonths ?? "",
      maturityDate: toStorageDate(getMaturityDateForDeposit(deposit)),
      expectedInterest: calculateExpectedInterest(deposit),
      projectedValue: calculateProjectedValue(deposit),
      daysUntilMaturity: daysBetween(today, getMaturityDateForDeposit(deposit)),
    }))
    .sort((a, b) => toDate(a.maturityDate) - toDate(b.maturityDate));
}

function isValidDepositRecord(record) {
  if (!record || typeof record !== "object") {
    return false;
  }

  const requiredStringFields = ["id", "bankName", "depositName", "startDate", "maturityDate"];
  return requiredStringFields.every((field) => typeof record[field] === "string")
    && Number.isFinite(Number(record.principal))
    && Number.isFinite(Number(record.rate))
    && Number.isFinite(Number(record.tenureMonths));
}

async function hydrateDeposits() {
  appState.storageMode = "json";
  appState.storageIssue = "";

  try {
    const response = await fetch(DATA_FILE_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${DATA_FILE_PATH} (${response.status}).`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Deposit data must be an array.");
    }

    const invalidRecord = data.find((record) => !isValidDepositRecord(record));
    if (invalidRecord) {
      throw new Error("Deposit data contains an invalid record.");
    }

    appState.deposits = data.map((deposit) => ({
      id: deposit.id,
      bankName: deposit.bankName,
      depositName: deposit.depositName,
      principal: Number(deposit.principal),
      rate: Number(deposit.rate),
      startDate: deposit.startDate,
      tenureMonths: Number(deposit.tenureMonths),
      maturityDate: deposit.maturityDate,
      notes: typeof deposit.notes === "string" ? deposit.notes : "",
    }));
    return;
  } catch (error) {
    appState.storageIssue = error.message || "Unable to load the bundled deposit data.";
  }

  appState.deposits = [];
}

function calculateFormPreview() {
  const principal = Number(principalInput.value || 0);
  const rate = Number(rateInput.value || 0);
  const startDateValue = startDateInput.value;
  const tenureMonths = Number(tenureMonthsInput.value || 0);

  if (!startDateValue || !tenureMonths) {
    calculatedMaturityDate.textContent = "Select start date and tenure";
    calculatedInterest.textContent = formatCurrency(0);
    calculatedMaturityValue.textContent = formatCurrency(0);
    return;
  }

  const maturityDate = addMonths(toDate(startDateValue), tenureMonths);
  const previewDeposit = {
    principal,
    rate,
    startDate: startDateValue,
    maturityDate: toStorageDate(maturityDate),
  };

  const expectedInterest = calculateExpectedInterest(previewDeposit);
  calculatedMaturityDate.textContent = formatDateFromDate(maturityDate);
  calculatedInterest.textContent = formatCurrency(expectedInterest);
  calculatedMaturityValue.textContent = formatCurrency(principal + expectedInterest);
}

function updateStorageStatus() {
  if (appState.storageIssue) {
    storageStatus.textContent = `Storage mode: bundled JSON file. ${appState.storageIssue}`;
    return;
  }

  storageStatus.textContent = "Storage mode: bundled JSON file in data/deposits.json. Update the repo file and redeploy to change entries.";
}

function renderRiskProfile(deposits) {
  if (!deposits.length) {
    riskProfileTitle.textContent = "Conservative Fixed-Income View";
    riskProfileCopy.textContent =
      "Add entries to data/deposits.json to see a live portfolio readout based on maturity mix, liquidity timing, and bank concentration.";
    return;
  }

  const totalPrincipal = deposits.reduce((sum, item) => sum + Number(item.principal), 0);
  const withinSixMonths = deposits
    .filter((item) => item.daysUntilMaturity >= 0 && item.daysUntilMaturity <= 183)
    .reduce((sum, item) => sum + Number(item.principal), 0);
  const afterTwelveMonths = deposits
    .filter((item) => item.daysUntilMaturity > 365)
    .reduce((sum, item) => sum + Number(item.principal), 0);

  const bankTotals = deposits.reduce((map, item) => {
    map[item.bankName] = (map[item.bankName] || 0) + Number(item.principal);
    return map;
  }, {});

  const largestBankEntry = Object.entries(bankTotals).sort((a, b) => b[1] - a[1])[0];
  const largestBankName = largestBankEntry?.[0] || "one bank";
  const largestBankShare = totalPrincipal > 0 ? (largestBankEntry?.[1] || 0) / totalPrincipal : 0;
  const shortTermShare = totalPrincipal > 0 ? withinSixMonths / totalPrincipal : 0;
  const longTermShare = totalPrincipal > 0 ? afterTwelveMonths / totalPrincipal : 0;

  if (largestBankShare >= 0.6) {
    riskProfileTitle.textContent = "Concentrated Fixed-Income View";
    riskProfileCopy.textContent =
      `${Math.round(largestBankShare * 100)}% of your portfolio is placed with ${largestBankName}, which increases institution concentration even though the holdings are fixed deposits.`;
    return;
  }

  if (shortTermShare >= 0.5) {
    riskProfileTitle.textContent = "Liquidity-Focused Fixed-Income View";
    riskProfileCopy.textContent =
      `${Math.round(shortTermShare * 100)}% of your portfolio matures within 6 months, giving you near-term liquidity and more frequent reinvestment decisions.`;
    return;
  }

  if (longTermShare >= 0.5) {
    riskProfileTitle.textContent = "Yield-Locking Fixed-Income View";
    riskProfileCopy.textContent =
      `${Math.round(longTermShare * 100)}% of your portfolio matures after 12 months, which leans toward rate stability over short-term liquidity.`;
    return;
  }

  riskProfileTitle.textContent = "Balanced Fixed-Income View";
  riskProfileCopy.textContent =
    `Your deposits are spread across maturity windows with the largest bank exposure at ${Math.round(largestBankShare * 100)}%, giving you a more balanced mix of liquidity and yield visibility.`;
}

function renderSummaryCards(deposits) {
  const totalPrincipal = deposits.reduce((sum, item) => sum + Number(item.principal), 0);
  const totalInterest = deposits.reduce((sum, item) => sum + item.expectedInterest, 0);
  const totalValue = deposits.reduce((sum, item) => sum + item.projectedValue, 0);
  const banks = new Set(deposits.map((item) => item.bankName.trim().toLowerCase())).size;

  const cards = [
    { label: "Total Principal", value: formatCurrency(totalPrincipal), subtext: `${pluralize(deposits.length, "active deposit")}` },
    { label: "Expected Interest", value: formatCurrency(totalInterest), subtext: "Calculated using simple annual interest" },
    { label: "Projected Maturity Value", value: formatCurrency(totalValue), subtext: "Principal plus expected interest" },
    { label: "Banks Covered", value: String(banks), subtext: `${pluralize(banks, "bank")} tracked` },
  ];

  summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <div class="summary-label">${card.label}</div>
          <div class="summary-value">${card.value}</div>
          <div class="timeline-subtext">${card.subtext}</div>
        </article>
      `
    )
    .join("");

  portfolioTotal.textContent = formatCurrency(totalPrincipal);
  estimatedReturn.textContent = formatCurrency(totalInterest);

  if (!deposits.length) {
    portfolioGrowth.textContent = "No deposits tracked yet.";
    progressPercent.textContent = "0%";
    progressFill.style.width = "0%";
    return;
  }

  const returnRatio = totalPrincipal > 0 ? Math.min((totalInterest / totalPrincipal) * 100, 100) : 0;
  portfolioGrowth.textContent = `+ ${percentFormatter.format(returnRatio)}% projected portfolio return`;
  progressPercent.textContent = `${Math.round(returnRatio)}%`;
  progressFill.style.width = `${Math.max(returnRatio, 4)}%`;
}

function renderProjectionCards(deposits) {
  const now = startOfToday();
  const windows = [6, 12, 18].map((months) => {
    const windowEnd = addMonths(now, months);
    const matches = deposits.filter((item) => {
      const maturityDate = toDate(item.maturityDate);
      return maturityDate >= now && maturityDate <= windowEnd;
    });
    const total = matches.reduce((sum, item) => sum + item.projectedValue, 0);
    return {
      label: `Within ${months} months`,
      count: matches.length,
      total,
      tone: months === 6 ? "urgent" : months === 12 ? "upcoming" : "stable",
    };
  });

  projectionCards.innerHTML = windows
    .map(
      (window) => `
        <article class="timeline-card is-${window.tone}">
          <div class="timeline-main">
            <div class="timeline-icon">${window.label.split(" ")[1]}</div>
            <div>
              <strong>${window.label}</strong>
              <div class="timeline-subtext">${pluralize(window.count, "maturity")} projected</div>
            </div>
          </div>
          <div>
            <div class="timeline-value">${formatCurrency(window.total)}</div>
            <div class="status-chip ${window.tone}">${window.tone}</div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderReminders(deposits) {
  const dueSoon = deposits.filter((deposit) => deposit.daysUntilMaturity <= 7);

  if (!dueSoon.length) {
    reminderList.innerHTML = emptyStateTemplate.innerHTML.replace(
      "No fixed deposits yet. Update data/deposits.json to publish your first placement and unlock maturity forecasts, expected returns, and reminder tracking.",
      "No deposits mature within the next 7 days. Your next reminder will appear here automatically."
    );
    return;
  }

  reminderList.innerHTML = dueSoon
    .map((deposit) => {
      const dayLabel =
        deposit.daysUntilMaturity < 0
          ? `${pluralize(Math.abs(deposit.daysUntilMaturity), "day")} overdue`
          : deposit.daysUntilMaturity === 0
            ? "Matures today"
            : `${pluralize(deposit.daysUntilMaturity, "day")} left`;

      return `
        <article class="reminder-item ${deposit.daysUntilMaturity <= 3 ? "urgent" : ""}">
          <div class="timeline-main">
            <div class="reminder-icon">${deposit.bankName.trim().slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>${deposit.depositName}</strong>
              <div class="reminder-meta">${deposit.bankName} | ${formatDate(deposit.maturityDate)}</div>
              <div class="timeline-subtext">Projected value ${formatCurrency(deposit.projectedValue)}</div>
            </div>
          </div>
          <div class="status-chip ${deposit.daysUntilMaturity <= 3 ? "urgent" : "upcoming"}">${dayLabel}</div>
        </article>
      `;
    })
    .join("");
}

function renderTable(deposits) {
  if (!deposits.length) {
    depositTableBody.innerHTML = emptyStateTemplate.innerHTML;
    investmentCount.textContent = "0 entries";
    return;
  }

  investmentCount.textContent = pluralize(deposits.length, "entry", "entries");
  depositTableBody.innerHTML = deposits
    .map(
      (deposit) => `
        <article class="investment-card">
          <div class="investment-bank">
            <div class="investment-bank-icon">${deposit.bankName.trim().slice(0, 2).toUpperCase()}</div>
            <div class="investment-bank-copy">
              <h3>${deposit.bankName}</h3>
              <p class="investment-meta">${deposit.depositName}</p>
              <p class="investment-notes">${deposit.notes || "No notes"}</p>
            </div>
          </div>
          <div>
            <span class="investment-label">Investment</span>
            <div class="investment-value">${formatCurrency(Number(deposit.principal))}</div>
          </div>
          <div>
            <span class="investment-label">Rate</span>
            <div class="investment-value">${percentFormatter.format(Number(deposit.rate))}%</div>
          </div>
          <div>
            <span class="investment-label">Expected Return</span>
            <div class="investment-value">${formatCurrency(deposit.expectedInterest)}</div>
          </div>
          <div>
            <span class="investment-label">Maturity</span>
            <div class="investment-value">${formatDate(deposit.maturityDate)}</div>
            <p class="investment-notes">${deposit.daysUntilMaturity < 0 ? `${pluralize(Math.abs(deposit.daysUntilMaturity), "day")} overdue` : deposit.daysUntilMaturity === 0 ? "Matures today" : `${pluralize(deposit.daysUntilMaturity, "day")} left`}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function disableManualEditing() {
  [bankNameInput, depositNameInput, principalInput, rateInput, startDateInput, tenureMonthsInput, notesInput].forEach((element) => {
    element.disabled = true;
  });

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Edit data/deposits.json to update";
  }

  if (readOnlyNotice) {
    readOnlyNotice.hidden = false;
  }
}

async function notifyDueDeposits(deposits) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notifiedMap = loadNotifiedReminders();
  const todayKey = toStorageDate(startOfToday());
  const dueSoon = deposits.filter((deposit) => deposit.daysUntilMaturity <= 7);
  const newDueSoon = dueSoon.filter((deposit) => notifiedMap[deposit.id] !== todayKey);

  for (const deposit of newDueSoon) {
    const title = `${deposit.depositName} matures soon`;
    const options = {
      body: `${deposit.bankName} matures on ${formatDate(deposit.maturityDate)}.`,
      tag: `fd-reminder-${deposit.id}`,
      badge: "icons/icon.svg",
      icon: "icons/icon.svg",
    };

    if (navigator.serviceWorker?.ready) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }

    notifiedMap[deposit.id] = todayKey;
  }

  saveNotifiedReminders(notifiedMap);
}

function updateNotificationStatus() {
  if (!("Notification" in window)) {
    notificationStatus.textContent = "This browser does not support popup notifications. In-app maturity alerts will still appear here.";
    enableNotificationsBtn.disabled = true;
    formEnableNotificationsBtn.disabled = true;
    formEnableNotificationsBtn.textContent = "Unavailable";
    return;
  }

  if (Notification.permission === "granted") {
    notificationStatus.textContent = "Popup reminders are enabled. You will be alerted when a deposit is within 7 days of maturity.";
    enableNotificationsBtn.setAttribute("aria-label", "Reminders enabled");
    enableNotificationsBtn.disabled = true;
    formEnableNotificationsBtn.textContent = "Enabled";
    formEnableNotificationsBtn.disabled = true;
    return;
  }

  if (Notification.permission === "denied") {
    notificationStatus.textContent = "Popup reminders are blocked in this browser. You can still view maturity alerts inside the dashboard.";
    enableNotificationsBtn.disabled = true;
    formEnableNotificationsBtn.textContent = "Blocked";
    formEnableNotificationsBtn.disabled = true;
    return;
  }

  notificationStatus.textContent = "Popup reminders are disabled. Click the bell to enable 7-day maturity alerts.";
  enableNotificationsBtn.disabled = false;
  formEnableNotificationsBtn.textContent = "Turn On";
  formEnableNotificationsBtn.disabled = false;
}

function renderDashboard() {
  const deposits = getEnrichedDeposits();
  updateStorageStatus();
  renderSummaryCards(deposits);
  renderProjectionCards(deposits);
  renderReminders(deposits);
  renderRiskProfile(deposits);
  renderTable(deposits);
  updateNotificationStatus();
  notifyDueDeposits(deposits);
}

fdForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  window.alert("This deployment is read-only. Update data/deposits.json in the repo and redeploy to change deposits.");
});

enableNotificationsBtn.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();
  updateNotificationStatus();
  if (permission === "granted") {
    renderDashboard();
  }
});

formEnableNotificationsBtn.addEventListener("click", async () => {
  enableNotificationsBtn.click();
});

scrollInvestmentsBtn.addEventListener("click", () => {
  document.getElementById("investmentsSection").scrollIntoView({ behavior: "smooth", block: "start" });
});

downloadDataBtn?.addEventListener("click", () => {
  downloadDeposits();
});

themeToggleBtn.addEventListener("click", () => {
  const nextTheme = loadTheme() === "dark" ? "light" : "dark";
  saveTheme(nextTheme);
  applyTheme(nextTheme);
});

[principalInput, rateInput, startDateInput, tenureMonthsInput].forEach((element) => {
  element.addEventListener("input", calculateFormPreview);
  element.addEventListener("change", calculateFormPreview);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

async function initializeApp() {
  applyTheme(loadTheme());
  disableManualEditing();
  await hydrateDeposits();
  renderDashboard();
  calculateFormPreview();
}

initializeApp();
