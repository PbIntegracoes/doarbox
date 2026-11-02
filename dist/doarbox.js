(function () {
  "use strict";

  var API_BASE = "https://api.pbintegracoes.com/v1";
  var DEFAULT_LOGO =
    "https://cdn.jsdelivr.net/gh/r-martins/pb-doarbox@5/dist/doarbox-logo.png";
  var SITE_URL = "https://pbintegracoes.com/doarbox";
  var DEFAULT_AMOUNTS = [10, 50, 100];
  var MIN_REAIS = 1;

  var CSS = [
    ":host{display:inline-block;font-family:Avenir,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}",
    ".box{width:260px;background:#f9f9f9;padding:10px;border:1px solid #dedede;text-align:center;color:#2c3e50;box-sizing:border-box;}",
    ".logo{width:180px;max-width:100%;margin:0 auto 8px;}",
    ".logo img{width:100%;height:auto;display:block;}",
    "h2{font-size:20px;font-weight:normal;margin:8px 0;}",
    ".freq{display:flex;justify-content:center;gap:0;margin:8px 0;}",
    ".freq button{flex:1;font-size:14px;padding:9px;border:0;cursor:pointer;background:rgba(197,197,204,.28);color:#46a034;font-family:Arial,sans-serif;}",
    ".freq button:first-child{border-radius:3px 0 0 3px;}",
    ".freq button:last-child{border-radius:0 3px 3px 0;}",
    ".freq button.active,.freq button:hover{background:#2d7120;color:#fff;}",
    ".hint{font-size:13px;margin:6px 0 0;color:#555;}",
    "hr{width:50%;height:0;border:0;border-top:1px solid #d0cece;margin:12px auto;}",
    ".amounts{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;}",
    ".amounts button{color:#46a034;font-size:16px;padding:9px;border:0;margin:0;cursor:pointer;background:rgba(197,197,204,.28);font-family:Arial,sans-serif;min-width:72px;}",
    ".amounts button.active,.amounts button:hover{background:#2d7120;color:#fff;}",
    ".custom{margin-top:14px;}",
    ".custom label{display:block;margin-bottom:6px;font-size:15px;}",
    ".custom input{font-size:15px;line-height:23px;width:120px;border:1px solid gray;color:#4b4a4a;padding:6px;text-align:center;box-sizing:border-box;}",
    ".error{color:red;font-size:14px;margin:14px 0;font-weight:bold;min-height:1.2em;}",
    ".submit{padding:12px 31px;background:#09a805;border:none;font-weight:bold;color:#fff;text-transform:uppercase;cursor:pointer;font-size:15px;}",
    ".submit:disabled{opacity:.65;cursor:wait;}",
    ".submit:hover:not(:disabled){background:#2d7120;}",
    ".by{font-size:12px;margin:12px 0 4px;}",
    ".by a{text-decoration:none;color:inherit;font-weight:bold;}",
    ".spinner{display:inline-block;width:28px;height:28px;border:3px solid #c8c8c8;border-top-color:#09a805;border-radius:50%;animation:spin .7s linear infinite;margin:10px 0;}",
    "@keyframes spin{to{transform:rotate(360deg);}}",
  ].join("");

  function parseAmounts(attr) {
    if (!attr || !String(attr).trim()) return DEFAULT_AMOUNTS.slice();
    var out = [];
    String(attr)
      .split(",")
      .forEach(function (part) {
        var n = parseFloat(String(part).trim().replace(",", "."));
        if (!isNaN(n) && n >= MIN_REAIS) out.push(n);
      });
    return out.length ? out : DEFAULT_AMOUNTS.slice();
  }

  function moneyLabel(reais) {
    return (
      "R$ " +
      Number(reais).toLocaleString("pt-BR", {
        minimumFractionDigits: Number.isInteger(reais) ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function toCents(reais) {
    return Math.round(Number(reais) * 100);
  }

  function parseCustom(raw) {
    var cleaned = String(raw || "")
      .replace(/[^\d,.]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    var n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  class DoarBox extends HTMLElement {
    constructor() {
      super();
      this._root = this.attachShadow({ mode: "open" });
      this._frequency = "once";
      this._amount = 0;
      this._useCustom = false;
      this._busy = false;
      this._error = "";
    }

    static get observedAttributes() {
      return ["box", "title", "logo", "amounts", "api"];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    get boxId() {
      return (this.getAttribute("box") || "").trim();
    }

    get titleText() {
      return (this.getAttribute("title") || "Contribua com nosso projeto").trim();
    }

    get logoUrl() {
      var logo = (this.getAttribute("logo") || "").trim();
      return logo || DEFAULT_LOGO;
    }

    get apiBase() {
      return (this.getAttribute("api") || API_BASE).replace(/\/$/, "");
    }

    get amounts() {
      return parseAmounts(this.getAttribute("amounts"));
    }

    setFrequency(freq) {
      this._frequency = freq;
      this._error = "";
      this.render();
    }

    setAmount(value, custom) {
      this._amount = value;
      this._useCustom = !!custom;
      this._error = "";
      this.render();
      if (custom) {
        var input = this._root.querySelector(".customAmount");
        if (input) {
          setTimeout(function () {
            input.focus();
          }, 0);
        }
      }
    }

    render() {
      var amounts = this.amounts;
      var self = this;
      var freqOnce = this._frequency === "once";
      var amountBtns = amounts
        .map(function (a) {
          var active = !self._useCustom && self._amount === a ? " active" : "";
          return (
            '<button type="button" class="opt' +
            active +
            '" data-amount="' +
            a +
            '">' +
            moneyLabel(a) +
            "</button>"
          );
        })
        .join("");

      this._root.innerHTML =
        "<style>" +
        CSS +
        "</style>" +
        '<form class="box" novalidate>' +
        '<div class="logo"><img alt="DoarBox" src="' +
        this.escapeAttr(this.logoUrl) +
        '"/></div>' +
        "<h2>" +
        this.escapeHtml(this.titleText) +
        "</h2>" +
        '<div class="freq">' +
        '<button type="button" class="freq-once' +
        (freqOnce ? " active" : "") +
        '">Única</button>' +
        '<button type="button" class="freq-month' +
        (!freqOnce ? " active" : "") +
        '">Mensal</button>' +
        "</div>" +
        (!freqOnce
          ? '<p class="hint">Cobrança mensal no cartão. Você pode cancelar a qualquer momento pelo link enviado após a doação.</p>'
          : "") +
        "<hr/>" +
        '<h2>Escolha um valor</h2>' +
        '<div class="amounts">' +
        amountBtns +
        '<button type="button" class="opt custom-btn' +
        (this._useCustom ? " active" : "") +
        '">Outro Valor</button>' +
        "</div>" +
        (this._useCustom
          ? '<div class="custom"><label>Valor personalizado:</label>' +
            '<input class="customAmount" type="text" inputmode="decimal" placeholder="R$ 123,99" value="' +
            this.escapeAttr(
              this._amount > 0 ? moneyLabel(this._amount) : ""
            ) +
            '"/></div>'
          : "") +
        '<div class="error">' +
        this.escapeHtml(this._error) +
        "</div>" +
        (this._busy
          ? '<div class="spinner" aria-label="Carregando"></div>'
          : '<button type="submit" class="submit">Doar</button>') +
        '<p class="by">Contribuição via <a href="' +
        SITE_URL +
        '" target="_blank" rel="noopener">DoarBox</a></p>' +
        "</form>";

      this.bind();
    }

    bind() {
      var self = this;
      var form = this._root.querySelector("form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        self.submit();
      });
      var once = this._root.querySelector(".freq-once");
      var month = this._root.querySelector(".freq-month");
      if (once)
        once.addEventListener("click", function () {
          self.setFrequency("once");
        });
      if (month)
        month.addEventListener("click", function () {
          self.setFrequency("month");
        });
      this._root.querySelectorAll(".amounts button.opt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.classList.contains("custom-btn")) {
            self.setAmount(0, true);
          } else {
            self.setAmount(parseFloat(btn.getAttribute("data-amount")), false);
          }
        });
      });
      var custom = this._root.querySelector(".customAmount");
      if (custom) {
        custom.addEventListener("focus", function () {
          custom.value = custom.value.replace(/[^\d,.]/g, "");
        });
        custom.addEventListener("blur", function () {
          var n = parseCustom(custom.value);
          self._amount = n;
          if (n > 0) custom.value = moneyLabel(n);
        });
      }
    }

    currentAmount() {
      if (this._useCustom) {
        var input = this._root.querySelector(".customAmount");
        if (input) return parseCustom(input.value);
      }
      return Number(this._amount) || 0;
    }

    submit() {
      var self = this;
      if (this._busy) return;
      var box = this.boxId;
      if (!box) {
        this._error = "Caixa não configurada (atributo box).";
        this.render();
        return;
      }
      var amount = this.currentAmount();
      if (amount < MIN_REAIS) {
        this._error = "O valor mínimo deve ser R$ 1,00.";
        this.render();
        return;
      }

      this._busy = true;
      this._error = "";
      this.render();

      var body = {
        box: box,
        amount: toCents(amount),
        frequency: this._frequency,
      };
      var title = this.titleText;
      if (title) body.title = title;
      var logo = (this.getAttribute("logo") || "").trim();
      if (logo) body.logo = logo;

      fetch(this.apiBase + "/donate/sessions", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Platform: "DoarBox",
          "Platform-Version": "5",
        },
        body: JSON.stringify(body),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { res: res, data: data };
          });
        })
        .then(function (out) {
          if (!out.res.ok || !out.data.url) {
            throw new Error(
              (out.data && out.data.message) ||
                "Não foi possível abrir o pagamento."
            );
          }
          window.location.href = out.data.url;
        })
        .catch(function (err) {
          self._busy = false;
          self._error = err.message || "Erro ao criar doação.";
          self.render();
        });
    }

    escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    escapeAttr(str) {
      return this.escapeHtml(str).replace(/'/g, "&#39;");
    }
  }

  if (!customElements.get("doar-box")) {
    customElements.define("doar-box", DoarBox);
  }
})();
