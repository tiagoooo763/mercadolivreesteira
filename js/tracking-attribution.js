/* Atribuição centralizada — Central Fit
   Fonte única de verdade sobre "de qual canal veio esta visita".
   Carregar SEMPRE antes de qualquer pixel ou config de tracking.

   Regras:
   1. Click id novo na URL (ttclid / fbclid) → grava com data e define o canal.
   2. Click id salvo há mais de 30 dias → apagado (janela oficial de atribuição).
   3. Chegou sinal de OUTRO canal → apaga o click id do canal anterior,
      para a venda não ser creditada ao anúncio errado.
   4. Expõe window._CHANNEL ('tiktok' | 'meta' | 'direct').
*/
;(function () {
  var TTL = 30 * 24 * 60 * 60 * 1000 // 30 dias
  var STORE = '_marketing_attribution'
  var now = Date.now()

  function read() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {} } catch (e) { return {} }
  }
  function write(o) {
    try { localStorage.setItem(STORE, JSON.stringify(o)) } catch (e) {}
  }
  function dropTikTok() {
    try { localStorage.removeItem('ttclid') } catch (e) {}
    try { document.cookie = 'ttclid=;path=/;max-age=0;SameSite=Lax' } catch (e) {}
  }
  function dropMeta() {
    try { localStorage.removeItem('_fbclid'); localStorage.removeItem('fbclid') } catch (e) {}
  }

  var p = new URLSearchParams(location.search)
  var val = function (k) { return (p.get(k) || '').trim() }

  var forced = (val('channel') || val('ch')).toLowerCase()
  var urlTt = val('ttclid')
  var urlFb = val('fbclid')
  var src = val('utm_source').toLowerCase()

  var data = read()

  /* 1. Expira click id antigo */
  if (data.channel && data.ts && (now - data.ts) > TTL) {
    if (data.channel === 'tiktok') dropTikTok()
    if (data.channel === 'meta') dropMeta()
    data = {}
    write(data)
  }

  var channel = ''

  if (forced === 'tiktok' || forced === 'ttk' || forced === 'tt') channel = 'tiktok'
  else if (forced === 'meta' || forced === 'fb' || forced === 'facebook') channel = 'meta'
  else if (urlTt) channel = 'tiktok'
  else if (urlFb) channel = 'meta'
  else if (src.indexOf('tiktok') >= 0 || src.indexOf('ttk') >= 0) channel = 'tiktok'
  else if (src.indexOf('facebook') >= 0 || src.indexOf('instagram') >= 0 ||
           src.indexOf('meta') >= 0 || src === 'fb' || src === 'ig') channel = 'meta'

  if (channel) {
    /* 3. Troca de canal → limpa o click id do canal antigo */
    if (data.channel && data.channel !== channel) {
      if (data.channel === 'tiktok') dropTikTok()
      if (data.channel === 'meta') dropMeta()
    }
    if (channel === 'tiktok' && urlTt) {
      try { localStorage.setItem('ttclid', urlTt) } catch (e) {}
      try { document.cookie = 'ttclid=' + encodeURIComponent(urlTt) + ';path=/;max-age=2592000;SameSite=Lax' } catch (e) {}
    }
    if (channel === 'meta' && urlFb) {
      try { localStorage.setItem('_fbclid', urlFb) } catch (e) {}
    }
    write({
      channel: channel,
      ts: now,
      utm_source: val('utm_source') || (channel === 'tiktok' ? 'tiktok' : ''),
      utm_medium: val('utm_medium'),
      utm_campaign: val('utm_campaign'),
      utm_content: val('utm_content'),
    })
  } else {
    /* 4. Sem sinal na URL: usa o que está salvo, se ainda válido */
    var stored = ''
    try { stored = localStorage.getItem('ttclid') || '' } catch (e) {}
    var storedFb = ''
    try { storedFb = localStorage.getItem('_fbclid') || '' } catch (e) {}
    if (data.channel === 'tiktok' && stored) channel = 'tiktok'
    else if (data.channel === 'meta' && storedFb) channel = 'meta'
    else if (data.channel) channel = data.channel
    else if (stored) channel = 'tiktok'
    else channel = 'direct'
  }

  window._CHANNEL = channel
  window._ATTRIBUTION = read()
})()
