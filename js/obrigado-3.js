/* Upsell Step 3: Reembolso Seguro — portado de obrigado.3.tsx */

(function () {
  const id = qs("id", "");
  const app = document.getElementById("rb-app");

  function genProtocol() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `RBF-${y}${m}${d}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function validateCPF(cpf) {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let r = (sum * 10) % 11;
    if (r === 10) r = 0;
    if (r !== parseInt(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    r = (sum * 10) % 11;
    if (r === 10) r = 0;
    return r === parseInt(digits[10]);
  }

  function maskCPF(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  }

  function maskPhone(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  }

  function maskCurrency(v) {
    const d = v.replace(/\D/g, "");
    if (!d) return "";
    const num = parseInt(d) / 100;
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  }

  /* Posição no texto formatado logo após o N-ésimo dígito — mantém o
     cursor no lugar certo depois de remascarar (evita o campo "travar"
     quando o cursor fica ao lado de um espaço/ponto/hífen da máscara). */
  function digitCountToPos(formatted, digitCount) {
    if (digitCount <= 0) return 0;
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        count++;
        if (count === digitCount) return i + 1;
      }
    }
    return formatted.length;
  }

  function wireMaskedInput(inp, maskFn) {
    inp.addEventListener("keydown", (e) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (inp.selectionStart !== inp.selectionEnd) return;

      const raw = inp.value.replace(/\D/g, "");
      const k = inp.value.slice(0, inp.selectionStart).replace(/\D/g, "").length;
      let newDigits, newDigitCount;

      if (e.key === "Backspace") {
        if (k === 0) return;
        newDigits = raw.slice(0, k - 1) + raw.slice(k);
        newDigitCount = k - 1;
      } else {
        if (k >= raw.length) return;
        newDigits = raw.slice(0, k) + raw.slice(k + 1);
        newDigitCount = k;
      }

      e.preventDefault();
      const newFormatted = maskFn(newDigits);
      const pos = digitCountToPos(newFormatted, newDigitCount);
      inp.value = newFormatted;
      inp.setSelectionRange(pos, pos);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    });

    inp.addEventListener("input", () => {
      const digitsBeforeCursor = inp.value.slice(0, inp.selectionStart ?? inp.value.length).replace(/\D/g, "").length;
      const v = maskFn(inp.value);
      inp.value = v;
      const pos = digitCountToPos(v, digitsBeforeCursor);
      inp.setSelectionRange(pos, pos);
    });
  }

  function headerHtml(dark) {
    return `
      <div class="rb-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <div><div class="t1">Reembolso Seguro</div><div class="t2">Portal de Reembolso</div></div>
      </div>`;
  }

  function renderWarning() {
    app.innerHTML = `
      ${headerHtml()}
      <div class="rb-main">
        <div class="rb-card">
          <div class="warn-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Atenção: Solicitação de Reembolso
          </div>
          <div class="info-item green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>O pedido deve ser feito exclusivamente por este formulário oficial.</span>
          </div>
          <div class="info-item red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
            <span>Reembolsos solicitados diretamente ao banco serão negados.</span>
          </div>
          <div class="info-item yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span>Ao tentar por fora, o valor não volta automaticamente.</span>
          </div>
          <div class="warn-btns">
            <button type="button" class="btn-cancel" id="btn-cancel">Cancelar</button>
            <button type="button" class="btn-continue" id="btn-continue">Entendi e Continuar</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("btn-cancel").addEventListener("click", () => history.back());
    document.getElementById("btn-continue").addEventListener("click", renderForm);
  }

  let formData = { name: "", cpf: "", phone: "", email: "", purchaseDate: "", totalPaid: "", reason: "", agreed: false };
  let files = [];
  let errors = {};

  function renderForm() {
    app.innerHTML = `
      ${headerHtml()}
      <div class="rb-main" style="background:#f3f4f6;">
        <div class="rb-card">
          <div class="form-title">Formulário de Solicitação de Reembolso</div>
          <div class="form-sub">Preencha todos os campos obrigatórios</div>

          <div class="form-group">
            <label>Nome Completo <span class="req">*</span></label>
            <input type="text" id="f-name" placeholder="Seu nome completo" value="${escapeHtml(formData.name)}" />
            <span class="error" id="err-name" ${errors.name ? "" : 'hidden'}>${errors.name || ""}</span>
          </div>

          <div class="form-row2">
            <div class="form-group">
              <label>CPF <span class="req">*</span></label>
              <input type="text" id="f-cpf" placeholder="000.000.000-00" value="${escapeHtml(formData.cpf)}" maxlength="14" />
              <span class="error" id="err-cpf" ${errors.cpf ? "" : 'hidden'}>${errors.cpf || ""}</span>
            </div>
            <div class="form-group">
              <label>Telefone <span class="req">*</span></label>
              <input type="text" id="f-phone" placeholder="(00) 00000-0000" value="${escapeHtml(formData.phone)}" maxlength="15" />
              <span class="error" id="err-phone" ${errors.phone ? "" : 'hidden'}>${errors.phone || ""}</span>
            </div>
          </div>

          <div class="form-group">
            <label>E-mail <span class="req">*</span></label>
            <input type="email" id="f-email" placeholder="seu@email.com" value="${escapeHtml(formData.email)}" />
            <span class="error" id="err-email" ${errors.email ? "" : 'hidden'}>${errors.email || ""}</span>
          </div>

          <div class="form-row2">
            <div class="form-group">
              <label>Data da Compra <span class="req">*</span></label>
              <input type="date" id="f-date" value="${formData.purchaseDate}" />
              <span class="error" id="err-date" ${errors.purchaseDate ? "" : 'hidden'}>${errors.purchaseDate || ""}</span>
            </div>
            <div class="form-group">
              <label>Valor total pago <span class="req">*</span></label>
              <input type="text" id="f-total" placeholder="R$ 0,00" value="${escapeHtml(formData.totalPaid)}" />
              <span class="error" id="err-total" ${errors.totalPaid ? "" : 'hidden'}>${errors.totalPaid || ""}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Motivo do Reembolso <span class="req">*</span></label>
            <textarea id="f-reason" placeholder="Descreva o motivo..." maxlength="1000">${escapeHtml(formData.reason)}</textarea>
            <div class="form-char" id="char-count">${formData.reason.length}/1000 (mín. 20)</div>
            <span class="error" id="err-reason" ${errors.reason ? "" : 'hidden'}>${errors.reason || ""}</span>
          </div>

          <div class="form-group">
            <label>Comprovante(s) <span class="req">*</span></label>
            <label class="upload-label" for="f-files">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Escolher Arquivo(s)
              <input type="file" id="f-files" multiple accept=".pdf,.jpg,.jpeg,.png" hidden />
            </label>
            <div class="file-list" id="file-list">
              ${files.map(f => `<div class="file-item">📎 ${escapeHtml(f.name)}</div>`).join("")}
            </div>
            <span class="error" id="err-files" ${errors.files ? "" : 'hidden'}>${errors.files || ""}</span>
          </div>

          <div class="terms-row">
            <input type="checkbox" id="f-terms" ${formData.agreed ? "checked" : ""} />
            <label for="f-terms">Declaro que li e compreendi a política de reembolso. *</label>
          </div>
          <span class="error" id="err-terms" ${errors.terms ? "" : 'hidden'}>${errors.terms || ""}</span>

          <button type="button" class="btn-submit" id="btn-submit">Enviar Solicitação</button>
        </div>
      </div>
    `;

    // Live events
    wireMaskedInput(document.getElementById("f-cpf"), maskCPF);
    wireMaskedInput(document.getElementById("f-phone"), maskPhone);
    document.getElementById("f-total").addEventListener("input", e => { e.target.value = maskCurrency(e.target.value); });
    document.getElementById("f-reason").addEventListener("input", e => {
      document.getElementById("char-count").textContent = `${e.target.value.length}/1000 (mín. 20)`;
    });
    document.getElementById("f-files").addEventListener("change", e => {
      const newFiles = Array.from(e.target.files || []).filter(f => f.size <= 10 * 1024 * 1024 && /\.(pdf|jpg|jpeg|png)$/i.test(f.name));
      files = [...files, ...newFiles];
      document.getElementById("file-list").innerHTML = files.map(f => `<div class="file-item">📎 ${escapeHtml(f.name)}</div>`).join("");
    });
    document.getElementById("btn-submit").addEventListener("click", handleSubmit);
  }

  function handleSubmit() {
    // Save form values
    formData.name = document.getElementById("f-name").value;
    formData.cpf = document.getElementById("f-cpf").value;
    formData.phone = document.getElementById("f-phone").value;
    formData.email = document.getElementById("f-email").value;
    formData.purchaseDate = document.getElementById("f-date").value;
    formData.totalPaid = document.getElementById("f-total").value;
    formData.reason = document.getElementById("f-reason").value;
    formData.agreed = document.getElementById("f-terms").checked;

    errors = {};
    if (!formData.name.trim()) errors.name = "Nome obrigatório";
    if (!validateCPF(formData.cpf)) errors.cpf = "CPF inválido";
    if (formData.phone.replace(/\D/g, "").length < 10) errors.phone = "Telefone inválido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "E-mail inválido";
    if (!formData.purchaseDate) errors.purchaseDate = "Data obrigatória";
    if (!formData.totalPaid) errors.totalPaid = "Valor obrigatório";
    if (formData.reason.trim().length < 20) errors.reason = "Mínimo 20 caracteres";
    if (files.length === 0) errors.files = "Anexe pelo menos um comprovante";
    if (!formData.agreed) errors.terms = "Aceite os termos";

    if (Object.keys(errors).length > 0) {
      renderForm();
      return;
    }

    renderSuccess(genProtocol());
  }

  function renderSuccess(protocol) {
    app.innerHTML = `
      ${headerHtml()}
      <div class="rb-main" style="background:#f3f4f6;">
        <div class="rb-card" style="text-align:center;">
          <div class="success-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="success-title">Obrigado por enviar sua solicitação!</div>
          <div class="success-sub">Sua solicitação foi recebida com sucesso</div>
          <div class="protocol-box">
            <div class="lbl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Número do Protocolo:
            </div>
            <div class="num">${protocol}</div>
          </div>
          <div class="info-note">
            O processo pode levar até <strong>5 dias úteis</strong>.
          </div>
          <a class="btn-voltar" href="obrigado.html?id=${encodeURIComponent(id)}">Ver confirmação do pedido →</a>
        </div>
      </div>
    `;
  }

  renderWarning();
})();
