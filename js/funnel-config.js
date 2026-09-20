/* =========================================================================
   INTERRUPTOR DO FUNIL PÓS-COMPRA
   -------------------------------------------------------------------------
   UPSELLS_ATIVOS = false  → depois do PIX pago o cliente vai para
                             pedido-confirmado.html (tela de "pagamento
                             recebido"). As telas de taxa (obrigado-1 /
                             obrigado-2 / obrigado-3) ficam inacessíveis:
                             quem abrir pelo link é redirecionado, então
                             nenhum evento de upsell é disparado.

   UPSELLS_ATIVOS = true   → volta o funil original (obrigado-1 → 2 → 3) e
                             a tela pedido-confirmado.html deixa de existir
                             (quem abrir é mandado para obrigado-1).

   É a ÚNICA linha que precisa mudar para ligar/desligar.
   ========================================================================= */
(function () {
  var UPSELLS_ATIVOS = true;

  function pedidoId() {
    try {
      var u = new URLSearchParams(location.search);
      return u.get('id') || u.get('order') || localStorage.getItem('pdap-pending') || '';
    } catch (_) { return ''; }
  }

  function comId(pagina, id) {
    id = id || pedidoId();
    return pagina + (id ? '?id=' + encodeURIComponent(id) : '');
  }

  window.FUNNEL = {
    upsellsAtivos: UPSELLS_ATIVOS,
    pedidoId: pedidoId,

    /* Para onde ir depois que o PIX principal é confirmado. */
    urlPosPagamento: function (id) {
      return comId(UPSELLS_ATIVOS ? 'obrigado-1.html' : 'pedido-confirmado.html', id);
    },

    /* Chamado no <head> das páginas de upsell: com o funil desligado,
       sai da página antes de qualquer script de pixel carregar. */
    guardUpsell: function () {
      if (UPSELLS_ATIVOS) return;
      location.replace(comId('pedido-confirmado.html'));
    },

    /* Chamado na tela de confirmação: com o funil ligado, ela não deve existir. */
    guardConfirmacao: function () {
      if (!UPSELLS_ATIVOS) return;
      location.replace(comId('obrigado-1.html'));
    }
  };
})();
