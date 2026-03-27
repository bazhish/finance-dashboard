const api = {
  async getBootstrap(month) {
    const response = await fetch(`/api/bootstrap?month=${encodeURIComponent(month)}`);
    if (!response.ok) throw new Error("Falha ao carregar dashboard.");
    return response.json();
  },
  async saveSettings(payload) {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar configurações.");
    return response.json();
  },
  async createTransaction(payload) {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar lançamento.");
    return response.json();
  },
  async createCategory(payload) {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).error || "Falha ao criar categoria.");
    return response.json();
  },
  async createCard(payload) {
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).error || "Falha ao criar cartão.");
    return response.json();
  },
  async createInstallment(cardId, payload) {
    const response = await fetch(`/api/cards/${cardId}/installments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).error || "Falha ao salvar compra parcelada.");
    return response.json();
  },
  async deleteTransaction(id) {
    const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error((await response.json()).error || "Falha ao remover lançamento.");
    return response.json();
  }
};

const state = {
  month: new Date().toISOString().slice(0, 7),
  chartType: localStorage.getItem("rf_chart_type") || "doughnut",
  data: null,
  search: ""
};

const monthPicker = document.getElementById("monthPicker");
const chartTypeSelect = document.getElementById("chartTypeSelect");
const transactionSearch = document.getElementById("transactionSearch");
const cardsStack = document.getElementById("cardsStack");
const transactionsList = document.getElementById("transactionsList");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalWindow = document.getElementById("modalWindow");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalForm = document.getElementById("modalForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const hideBannerBtn = document.getElementById("hideBannerBtn");

let categoryChart;
let trendChart;

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2600);
}

function currentDayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getExpenseCategories() {
  return (state.data?.categories || []).filter((category) => category.type === "expense");
}

function getIncomeCategories() {
  return (state.data?.categories || []).filter((category) => category.type === "income");
}

function fillCategorySelect(select, categories) {
  select.innerHTML = categories.map((category) => (
    `<option value="${category.id}">${escapeHtml(category.icon)} ${escapeHtml(category.name)}</option>`
  )).join("");
}

function fillCardSelect(select, includeEmpty = false) {
  const options = [];
  if (includeEmpty) options.push(`<option value="">Sem cartão</option>`);
  for (const card of state.data.cards) {
    options.push(`<option value="${card.id}">${escapeHtml(card.name)} • ${escapeHtml(card.last_four)}</option>`);
  }
  select.innerHTML = options.join("");
}

function renderKpis() {
  const { dashboard } = state.data;
  document.getElementById("salaryValue").textContent = formatBRL(state.data.settings.monthly_income);
  document.getElementById("inflowValue").textContent = formatBRL(dashboard.inflow);
  document.getElementById("outflowValue").textContent = formatBRL(dashboard.outflow);
  document.getElementById("balanceValue").textContent = formatBRL(dashboard.balance);
  document.getElementById("summaryInflow").textContent = formatBRL(dashboard.inflow);
  document.getElementById("summaryOutflow").textContent = formatBRL(dashboard.outflow);
  document.getElementById("summaryNet").textContent = formatBRL(dashboard.balance);
}

function renderCategoryChart() {
  const canvas = document.getElementById("categoryChart");
  const items = state.data.dashboard.categoryBreakdown;
  const labels = items.map((item) => item.name);
  const values = items.map((item) => item.total);
  const colors = items.map((item) => item.color);

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(canvas, {
    type: state.chartType,
    data: {
      labels,
      datasets: [{
        data: values.length ? values : [1],
        backgroundColor: values.length ? colors : ["#d9d9d9"],
        borderWidth: 0,
        label: "Gastos por categoria"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#111" } },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.raw || 0;
              return `${context.label}: ${formatBRL(value)}`;
            }
          }
        }
      },
      scales: ["bar"].includes(state.chartType)
        ? {
            y: {
              beginAtZero: true,
              ticks: { callback: (value) => formatBRL(value) }
            }
          }
        : {}
    }
  });
}

function renderTrendChart() {
  const canvas = document.getElementById("trendChart");
  const trend = state.data.dashboard.monthlyTrend;
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: trend.map((item) => item.label),
      datasets: [
        {
          label: "Entradas",
          data: trend.map((item) => item.inflow),
          borderColor: "#98ea62",
          backgroundColor: "rgba(152,234,98,.18)",
          fill: false,
          tension: 0.34
        },
        {
          label: "Saídas",
          data: trend.map((item) => item.outflow),
          borderColor: "#111111",
          backgroundColor: "rgba(17,17,17,.08)",
          fill: false,
          tension: 0.34
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#111" } }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return formatBRL(value);
            }
          }
        }
      }
    }
  });
}

function renderTransactions() {
  const query = state.search.trim().toLowerCase();
  const transactions = state.data.transactions.filter((item) => {
    const haystack = `${item.title} ${item.category_name || ""} ${item.payment_method || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  if (!transactions.length) {
    transactionsList.innerHTML = `<div class="empty-state">Nenhum lançamento encontrado para esse filtro.</div>`;
    return;
  }

  transactionsList.innerHTML = transactions.map((item) => {
    const installment = item.total_installments
      ? `<span class="tag">Parcela ${item.installment_number}/${item.total_installments}</span>`
      : "";
    const card = item.card_name
      ? `<span class="tag">${escapeHtml(item.card_name)}</span>`
      : "";
    const billing = item.billing_month
      ? `<span class="tag">Fatura ${escapeHtml(item.billing_month)}</span>`
      : "";

    return `
      <article class="transaction-item">
        <div class="transaction-top">
          <div>
            <div class="transaction-title">${escapeHtml(item.title)}</div>
            <div class="transaction-meta">${escapeHtml(item.category_name || "Sem categoria")} • ${escapeHtml(item.payment_method)} • ${escapeHtml(item.transaction_date)}</div>
          </div>
          <div class="transaction-amount ${item.type}">${item.type === "income" ? "+" : "-"} ${formatBRL(item.amount)}</div>
        </div>

        <div class="transaction-tags">
          <span class="tag">${item.type === "income" ? "Entrada" : "Despesa"}</span>
          ${card}
          ${billing}
          ${installment}
        </div>

        <div class="transaction-actions">
          <button class="link-btn" type="button" data-delete-id="${item.id}">Excluir</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCards() {
  const cards = state.data.cards;

  if (!cards.length) {
    cardsStack.innerHTML = `<div class="empty-state">Nenhum cartão cadastrado.</div>`;
    return;
  }

  cardsStack.innerHTML = cards.map((card) => {
    const installments = card.activeInstallments.length
      ? card.activeInstallments.map((item) => `
          <div class="card-installment">
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <div class="card-footnote">${escapeHtml(item.installmentLabel)} • ${item.remaining} restantes</div>
            </div>
            <strong>${formatBRL(item.amount)}</strong>
          </div>
        `).join("")
      : `<div class="card-footnote">Sem parcelas ativas neste período.</div>`;

    return `
      <article class="card-item" style="background:${escapeHtml(card.color)};">
        <div class="card-top">
          <div>
            <div class="card-name">${escapeHtml(card.name)}</div>
            <div class="card-subtitle">${escapeHtml(card.brand)} • final ${escapeHtml(card.last_four)}</div>
          </div>
          <div class="metric-chip">Fatura ${escapeHtml(state.month)}</div>
        </div>

        <div class="card-meta" style="margin-top:16px;">
          <div>
            <div class="card-footnote">Fatura atual</div>
            <div class="card-limit">${formatBRL(card.invoice)}</div>
          </div>
          <div>
            <div class="card-footnote">Disponível</div>
            <div class="card-limit">${formatBRL(card.availableCredit)}</div>
          </div>
        </div>

        <div class="transaction-tags" style="margin-top:16px;">
          <span class="metric-chip">Limite ${formatBRL(card.credit_limit)}</span>
          <span class="metric-chip">${card.activeInstallmentsCount} compras parceladas</span>
          <span class="metric-chip">Fecha dia ${card.closing_day}</span>
          <span class="metric-chip">Vence dia ${card.due_day}</span>
        </div>

        <div class="card-installments-list" style="margin-top:18px;">
          ${installments}
        </div>
      </article>
    `;
  }).join("");
}

function openModal(kind) {
  const templates = {
    salaryModal: {
      title: "Definir salário base",
      subtitle: "Esse valor entra como base fixa no cálculo do saldo.",
      templateId: "salaryTemplate",
      onSubmit: async (formData) => {
        await api.saveSettings({ monthlyIncome: Number(formData.get("monthlyIncome")) });
      }
    },
    transactionModal: {
      title: "Novo lançamento",
      subtitle: "Entrada ou despesa comum. Para parcelamento, use a ação específica.",
      templateId: "transactionTemplate",
      onSubmit: async (formData) => {
        await api.createTransaction({
          title: formData.get("title"),
          amount: Number(formData.get("amount")),
          type: formData.get("type"),
          categoryId: Number(formData.get("categoryId")),
          paymentMethod: formData.get("paymentMethod"),
          transactionDate: formData.get("transactionDate"),
          notes: formData.get("notes"),
          cardId: formData.get("cardId") ? Number(formData.get("cardId")) : null,
          billingMonth: formData.get("paymentMethod") === "crédito" && formData.get("cardId") ? state.month : null
        });
      }
    },
    categoryModal: {
      title: "Nova categoria",
      subtitle: "Amplie as categorias sem mexer no código da interface.",
      templateId: "categoryTemplate",
      onSubmit: async (formData) => {
        await api.createCategory({
          name: formData.get("name"),
          type: formData.get("type"),
          color: formData.get("color"),
          icon: formData.get("icon")
        });
      }
    },
    cardModal: {
      title: "Novo cartão",
      subtitle: "Cadastre limite, fechamento e vencimento.",
      templateId: "cardTemplate",
      onSubmit: async (formData) => {
        await api.createCard({
          name: formData.get("name"),
          brand: formData.get("brand"),
          lastFour: formData.get("lastFour"),
          creditLimit: Number(formData.get("creditLimit")),
          color: formData.get("color"),
          closingDay: Number(formData.get("closingDay")),
          dueDay: Number(formData.get("dueDay"))
        });
      }
    },
    installmentModal: {
      title: "Compra parcelada",
      subtitle: "O sistema gera todas as parcelas e distribui por fatura.",
      templateId: "installmentTemplate",
      onSubmit: async (formData) => {
        await api.createInstallment(formData.get("cardId"), {
          title: formData.get("title"),
          categoryId: Number(formData.get("categoryId")),
          totalAmount: Number(formData.get("totalAmount")),
          totalInstallments: Number(formData.get("totalInstallments")),
          purchaseDate: formData.get("purchaseDate"),
          notes: formData.get("notes")
        });
      }
    }
  };

  const config = templates[kind];
  if (!config) return;

  modalTitle.textContent = config.title;
  modalSubtitle.textContent = config.subtitle;
  modalForm.innerHTML = document.getElementById(config.templateId).innerHTML;
  modalBackdrop.classList.remove("hidden");
  modalWindow.classList.remove("hidden");

  if (kind === "salaryModal") {
    modalForm.elements.monthlyIncome.value = state.data.settings.monthly_income;
  }

  if (kind === "transactionModal") {
    const typeSelect = modalForm.elements.type;
    const categorySelect = modalForm.querySelector("#transactionCategorySelect");
    const cardSelect = modalForm.querySelector("#transactionCardSelect");
    modalForm.elements.transactionDate.value = currentDayISO();
    fillCategorySelect(categorySelect, getExpenseCategories());
    fillCardSelect(cardSelect, true);

    typeSelect.addEventListener("change", () => {
      fillCategorySelect(categorySelect, typeSelect.value === "income" ? getIncomeCategories() : getExpenseCategories());
    });
  }

  if (kind === "installmentModal") {
    const categorySelect = modalForm.querySelector("#installmentCategorySelect");
    const cardSelect = modalForm.querySelector("#installmentCardSelect");
    modalForm.elements.purchaseDate.value = currentDayISO();
    fillCategorySelect(categorySelect, getExpenseCategories());
    fillCardSelect(cardSelect, false);
  }

  modalForm.onsubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(modalForm);
      await config.onSubmit(formData);
      closeModal();
      await loadDashboard();
      showToast("Salvo com sucesso.");
    } catch (error) {
      showToast(error.message);
    }
  };
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  modalWindow.classList.add("hidden");
  modalForm.innerHTML = "";
}

async function loadDashboard() {
  state.data = await api.getBootstrap(state.month);
  renderKpis();
  renderCategoryChart();
  renderTrendChart();
  renderTransactions();
  renderCards();
}

document.addEventListener("click", async (event) => {
  const modalTrigger = event.target.closest("[data-modal-target]");
  if (modalTrigger) openModal(modalTrigger.dataset.modalTarget);

  if (event.target === modalBackdrop || event.target === closeModalBtn) closeModal();

  const deleteBtn = event.target.closest("[data-delete-id]");
  if (deleteBtn) {
    try {
      await api.deleteTransaction(deleteBtn.dataset.deleteId);
      await loadDashboard();
      showToast("Lançamento removido.");
    } catch (error) {
      showToast(error.message);
    }
  }
});

monthPicker.value = state.month;
chartTypeSelect.value = state.chartType;

monthPicker.addEventListener("change", async (event) => {
  state.month = event.target.value;
  await loadDashboard();
});

chartTypeSelect.addEventListener("change", () => {
  state.chartType = chartTypeSelect.value;
  localStorage.setItem("rf_chart_type", state.chartType);
  renderCategoryChart();
});

transactionSearch.addEventListener("input", () => {
  state.search = transactionSearch.value;
  renderTransactions();
});

hideBannerBtn.addEventListener("click", () => {
  document.querySelector(".welcome-banner").style.display = "none";
});

closeModalBtn.addEventListener("click", closeModal);

loadDashboard().catch((error) => {
  showToast(error.message);
});
