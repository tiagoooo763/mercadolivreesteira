/* TikTok Pixel — Central Fit
   - Captura ttclid real da URL e persiste em localStorage + cookie
   - SHA-256 em email, telefone e CPF antes de enviar ao TikTok
   - identify() automático quando dados do cliente estão no localStorage
   - API pública: window.ttk.viewContent / addToCart / initiateCheckout /
                  addPaymentInfo / placeAnOrder / purchase / upsellPurchase
*/
;(function () {
  var PX_ID = 'DALIGI3C77UES9756IQ0'

  /* ── 1. Captura e persiste ttclid ─────────────────────────────────── */
  var _params = new URLSearchParams(location.search)
  var _ttclid = _params.get('ttclid') // URLSearchParams já decodifica %XX e + automaticamente

  if (_ttclid) {
    try { localStorage.setItem('ttclid', _ttclid) } catch {}
    // encodeURIComponent garante que caracteres especiais do ttclid (que pode ter 200+ chars) não quebrem o cookie
    try { document.cookie = 'ttclid=' + encodeURIComponent(_ttclid) + ';path=/;max-age=2592000;SameSite=Lax' } catch {}
  } else {
    // Repassa ttclid de sessões anteriores (usuário navegou sem o parâmetro na URL)
    var _stored = ''
    try { _stored = localStorage.getItem('ttclid') || '' } catch {}
    if (_stored) {
      try { document.cookie = 'ttclid=' + encodeURIComponent(_stored) + ';path=/;max-age=2592000;SameSite=Lax' } catch {}
    }
  }

  /* ── 2. Snippet oficial do TikTok Pixel ───────────────────────────── */
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t
    var ttq = w[t] = w[t] || []
    ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent']
    ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i])
    ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n])
      return e
    }
    ttq.load = function (e, n) {
      var r = 'https://analytics.tiktok.com/i18n/pixel/events.js'
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r
      ttq._t = ttq._t || {}; ttq._t[e] = +new Date
      ttq._o = ttq._o || {}; ttq._o[e] = n || {}
      n = document.createElement('script'); n.type = 'text/javascript'; n.async = !0
      n.src = r + '?sdkid=' + e + '&lib=' + t
      e = document.getElementsByTagName('script')[0]; e.parentNode.insertBefore(n, e)
    }
    ttq.load(PX_ID)
    ttq.page()
  }(window, document, 'ttq')

  /* ── 3. SHA-256 helper ─────────────────────────────────────────────── */
  function sha256(str) {
    if (!str) return Promise.resolve('')
    var s = String(str).trim().toLowerCase()
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0') }).join('')
      })
  }

  /* Telefone → E.164: +55XXXXXXXXXXX */
  function toE164(phone) {
    if (!phone) return ''
    var d = String(phone).replace(/\D/g, '')
    if (d.startsWith('55') && d.length >= 12) return '+' + d
    if (d.length === 11 || d.length === 10) return '+55' + d
    return '+' + d
  }

  /* CPF somente dígitos */
  function onlyDigits(v) { return String(v || '').replace(/\D/g, '') }

  /* ── 4. identify() com dados hasheados ─────────────────────────────── */
  // Retorna a Promise (antes era fire-and-forget) — os chamadores agora
  // conseguem "esperar" o identify() terminar ANTES de disparar o ttq.track(),
  // senão o evento saía sem e-mail/telefone anexado (o hash ainda não tinha
  // resolvido quando o track já tinha sido despachado).
  function identifyCustomer(customer) {
    if (!customer || typeof ttq === 'undefined') return Promise.resolve()
    return Promise.all([
      sha256(customer.email),
      sha256(toE164(customer.phone)),
      sha256(onlyDigits(customer.document || customer.cpf || '')),
    ]).then(function (hashes) {
      var emailHash = hashes[0], phoneHash = hashes[1], cpfHash = hashes[2]
      ttq.identify({
        email:        emailHash,
        phone_number: phoneHash,
        external_id:  cpfHash,   // CPF como ID externo único
      })
    })
  }

  /* ── 4b. Envio server-side da taxa (Events API via Edge Function) ────
     Mesmos campos que a ponte do index.html manda em /tiktok-track — não
     acrescentar chaves novas: a função rejeita payload desconhecido. */
  var _EDGE_TT = 'https://dswawxckvmzftxumtdad.supabase.co/functions/v1/tiktok-track'
  var _OFFER   = 'esteira'
  var _PROD_ID = 'WCT_ESTEIRA_2HP'
  var _PROD_NM = 'Esteira Elétrica WCT Fitness'
  var _PROD_PR = 159.20

  function sendUpsellServer(step, name, value, eventId, cust) {
    /* Só atribui ao TikTok quando a visita é do TikTok (mesma regra do funil) */
    var channel = (typeof window._CHANNEL !== 'undefined') ? window._CHANNEL : null
    var ttclid = ''
    try { ttclid = localStorage.getItem('ttclid') || '' } catch (e) {}
    if (channel && channel !== 'tiktok') ttclid = ''
    if (!ttclid) return

    var extId = ''
    try { extId = localStorage.getItem('_ttk_eid') || '' } catch (e) {}
    var utms = {}
    try { utms = JSON.parse(localStorage.getItem('_ttk_utms') || '{}') || {} } catch (e) {}

    var payload = {
      event:         'CompletePayment',
      event_id:      eventId,
      page_url:      location.href,
      value:         value,
      user_agent:    navigator.userAgent,
      offer:         _OFFER,
      product_id:    _PROD_ID,
      product_name:  _PROD_NM,
      product_price: _PROD_PR
    }
    if (ttclid) payload.ttclid = ttclid
    if (extId)  payload.external_id = extId
    Object.keys(utms).forEach(function (k) { if (utms[k]) payload[k] = utms[k] })
    if (cust && cust.email) payload.email = String(cust.email).trim().toLowerCase()
    if (cust && (cust.phone || cust.tel)) payload.phone = onlyDigits(cust.phone || cust.tel)

    var body = JSON.stringify(payload)
    try {
      if (navigator.sendBeacon &&
          navigator.sendBeacon(_EDGE_TT, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return
    } catch (e) {}
    fetch(_EDGE_TT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: true
    }).catch(function () {})
  }

  /* ── 5. API pública window.ttk ─────────────────────────────────────── */
  window.ttk = {
    identify: identifyCustomer,

    /* produto.html — produto visualizado */
    viewContent: function (product) {
      if (typeof ttq === 'undefined') return
      ttq.track('ViewContent', {
        content_id:   String(product && product.id ? product.id : ''),
        content_name: (product && product.name) || '',
        content_type: 'product',
        currency:     'BRL',
        value:        (product && product.price) ? Number(product.price) : 0,
      })
    },

    /* cart.js — adicionou ao carrinho */
    addToCart: function (product, qty) {
      if (typeof ttq === 'undefined') return
      var q = qty || 1
      ttq.track('AddToCart', {
        content_id:   String(product && product.id ? product.id : ''),
        content_name: (product && product.name) || '',
        content_type: 'product',
        quantity:     q,
        currency:     'BRL',
        value:        product && product.price ? Number(product.price) * q : 0,
      })
    },

    /* checkout.html — página de checkout aberta */
    initiateCheckout: function (cart, totalCents) {
      if (typeof ttq === 'undefined') return
      ttq.track('InitiateCheckout', {
        contents: (cart || []).map(function (i) {
          return { content_id: String(i.id || i.name || ''), content_name: i.name || '', quantity: i.quantity || 1 }
        }),
        num_items: (cart || []).reduce(function (s, i) { return s + (i.quantity || 1) }, 0),
        currency:  'BRL',
        value:     (totalCents || 0) / 100,
      })
    },

    /* checkout.js — form válido submetido, antes de gerar PIX */
    addPaymentInfo: async function (customer, totalCents, cart) {
      await identifyCustomer(customer)   // espera o hash — senão o evento sai sem e-mail/telefone
      if (typeof ttq === 'undefined') return
      ttq.track('AddPaymentInfo', {
        contents: (cart || []).map(function (i) {
          return { content_id: String(i.id || i.name || ''), content_name: i.name || '', quantity: i.quantity || 1 }
        }),
        currency: 'BRL',
        value:    (totalCents || 0) / 100,
      })
    },

    /* pix.html — PIX gerado, pedido criado (aguardando pagamento) */
    placeAnOrder: function (orderId, totalCents, cart) {
      if (typeof ttq === 'undefined') return
      ttq.track('PlaceAnOrder', {
        content_id:   orderId || '',
        content_type: 'product',
        contents: (cart || []).map(function (i) {
          return { content_id: String(i.id || i.name || ''), content_name: i.name || '', quantity: i.quantity || 1 }
        }),
        currency: 'BRL',
        value:    (totalCents || 0) / 100,
      })
    },

    /* obrigado-1.html — PIX pago, conversão principal.
       event_id igual ao usado no envio server-side (TikTok Events API) —
       o TikTok deduplica automaticamente se os dois chegarem. */
    purchase: async function (orderId, totalCents, cart, customer) {
      if (customer) await identifyCustomer(customer)   // espera o hash — senão o Purchase sai sem e-mail/telefone
      if (typeof ttq === 'undefined') return
      ttq.track('CompletePayment', {
        content_id:   orderId || '',
        content_type: 'product',
        contents: (cart || []).map(function (i) {
          return { content_id: String(i.id || i.name || ''), content_name: i.name || '', quantity: i.quantity || 1 }
        }),
        currency: 'BRL',
        value:    (totalCents || 0) / 100,
      }, { event_id: 'order-' + orderId })
    },

    /* obrigado-1.js / obrigado-2.js — upsell pago.
       Reidentifica o comprador (email/telefone/CPF) ANTES de disparar — senão
       o CompletePayment do upsell saía sem esses dados e derrubava a cobertura
       (match quality) do Purchase, já que o upsell usa o mesmo nome de evento.
       Sai também pela Events API (server-side) com o MESMO event_id
       ('upsell-<id>') — o TikTok deduplica e a taxa deixa de depender só do
       navegador (bloqueador/aba fechada derrubavam o evento). */
    upsellPurchase: async function (step, amountCents, upsellId) {
      var cust = null
      try { cust = JSON.parse(localStorage.getItem('pdap-customer') || 'null') } catch (e) {}
      if (!cust) { try { cust = JSON.parse(localStorage.getItem('upsell_buyer') || 'null') } catch (e) {} }
      if (cust && typeof ttq !== 'undefined') await identifyCustomer({
        email:    cust.email,
        phone:    cust.phone || cust.tel,
        document: cust.document || cust.cpf
      })
      var names = { 1: 'Taxa de Importação', 2: 'Taxa TENF' }
      var eventId = upsellId ? ('upsell-' + upsellId) : ('upsell-step-' + step + '-' + Date.now())
      var value   = amountCents / 100

      /* ── server-side (Edge Function tiktok-track) ── */
      try { sendUpsellServer(step, names[step] || ('Upsell ' + step), value, eventId, cust) } catch (e) {}

      if (typeof ttq === 'undefined') return
      ttq.track('CompletePayment', {
        content_id:   'upsell-step-' + step,
        content_name: names[step] || ('Upsell ' + step),
        content_type: 'product',
        currency:     'BRL',
        value:        value,
      }, { event_id: eventId })
    },
  }

  /* ── 6. Auto-identify se dados do cliente já estão no localStorage ─── */
  try {
    var _cust = JSON.parse(localStorage.getItem('pdap-customer') || 'null')
    if (_cust) identifyCustomer(_cust)
  } catch {}

})()
