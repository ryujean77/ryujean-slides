/* 가이드북 신청 게이트 — [data-guidebook] 버튼을 누르면 신청 창을 연다.
   GAS_URL 이 비어 있으면 문의 메일로 안내한다. 입력값은 textContent 로만 다룬다(XSS 방지). */
(function () {
  var GAS_URL = "https://script.google.com/macros/s/AKfycbyRIsBdm4tdJRf9I9Los9UqRmqwnHvySQXR3wNhcetPFCPRWXXwwIYLZQBWDOkwXFU/exec"; // Apps Script 웹앱 (gate/Code.gs, clasp 배포 @1)
  var CONTACT = "ryujean77@gmail.com";
  var L = {
    ko: { t: "가이드북 신청", d: "입력하신 이메일로 사상체질 생활풍수 가이드북(PDF)을 보내드립니다.", n: "이름", e: "이메일", o: "소속 (선택)",
      c: "[필수] 가이드북 발송을 위한 개인정보 수집·이용에 동의합니다. 항목: 이름·이메일·소속 / 보유: 동의 철회 시까지 / 동의하지 않으면 발송할 수 없습니다.",
      m: "[선택] 체질 라이프 소식(월 1회 이내)을 이메일로 받겠습니다.", s: "신청하기", ok: "메일을 보냈습니다. 받은편지함(또는 스팸함)을 확인해 주세요.",
      err: "잠시 후 다시 시도해 주세요.", pre: "신청 접수를 준비하고 있습니다. 아래 주소로 '가이드북 신청'이라고 메일을 보내 주시면 보내드립니다.", x: "닫기" },
    en: { t: "Request the guidebook", d: "We will email the Sasang Constitution Feng Shui guidebook (PDF) to you.", n: "Name", e: "Email", o: "Organization (optional)",
      c: "[Required] I agree to the collection and use of my name, email and organization to receive the guidebook, kept until I withdraw consent.",
      m: "[Optional] Send me occasional news from the institute (at most monthly).", s: "Send me the guidebook", ok: "Sent. Please check your inbox (or spam folder).",
      err: "Please try again in a moment.", pre: "Online requests open soon. Email us with the subject 'Guidebook request' and we will send it.", x: "Close" },
    ja: { t: "ガイドブックのお申し込み", d: "ご入力のメールアドレスに四象体質の生活風水ガイドブック(PDF)をお送りします。", n: "お名前", e: "メールアドレス", o: "ご所属（任意）",
      c: "［必須］ガイドブック送付のため、お名前・メール・ご所属の収集と利用に同意します（同意撤回まで保管）。",
      m: "［任意］体質ライフのお知らせ（月1回以内）をメールで受け取ります。", s: "申し込む", ok: "送信しました。受信箱（または迷惑メール）をご確認ください。",
      err: "しばらくしてからもう一度お試しください。", pre: "受付を準備中です。件名「ガイドブック申込」で下記へメールをお送りください。", x: "閉じる" },
    "zh-Hans": { t: "申请指南", d: "我们将把四象体质生活风水指南（PDF）发送到您填写的邮箱。", n: "姓名", e: "电子邮箱", o: "单位（选填）",
      c: "【必选】为发送指南，同意收集并使用姓名、邮箱、单位，保存至撤回同意为止。",
      m: "【可选】通过邮件接收体质生活资讯（每月不超过一次）。", s: "提交申请", ok: "已发送，请查看收件箱（或垃圾邮件）。",
      err: "请稍后再试。", pre: "在线申请即将开放。请以“申请指南”为主题发邮件至以下地址。", x: "关闭" },
    it: { t: "Richiedi la guidebook", d: "Ti invieremo via email la guidebook (PDF) del Feng Shui delle costituzioni Sasang.", n: "Nome", e: "Email", o: "Organizzazione (facoltativo)",
      c: "[Obbligatorio] Acconsento al trattamento di nome, email e organizzazione per ricevere la guidebook, conservati fino alla revoca del consenso.",
      m: "[Facoltativo] Desidero ricevere notizie occasionali dall'istituto (al massimo mensili).", s: "Invia la guidebook", ok: "Inviata. Controlla la posta in arrivo (o lo spam).",
      err: "Riprova tra poco.", pre: "Le richieste online apriranno a breve. Scrivici con oggetto 'Richiesta guidebook'.", x: "Chiudi" }
  };
  // data-guidebook="spa" 버튼은 사상 라이프 소개서를 신청한다 (제목·설명만 바뀌고 나머지 문구는 공통)
  var DOCS = {
    spa: {
      ko: { t: "자료 신청", d: "입력하신 이메일로 사상 라이프스타일 웰니스 소개서(PDF)를 보내드립니다.", s: "신청하기" },
      en: { t: "Request the brochure", d: "We will email the Sasang Lifestyle Wellness brochure (PDF) to you.", s: "Send me the brochure" },
      ja: { t: "資料請求", d: "ご入力のメールアドレスに四象ライフスタイル・ウェルネスのご紹介資料(PDF)をお送りします。", s: "申し込む" }
    }
  };
  var doc = "guidebook";
  var lang = document.documentElement.lang || "ko";
  var T = L[lang] || L.en;
  var code = { ko: "ko", en: "en", ja: "ja", "zh-Hans": "zh", it: "it" }[lang] || "en";

  var css = document.createElement("style");
  css.textContent = ".gb-d{border:0;padding:0;max-width:440px;width:calc(100% - 32px);background:#efe8dc;color:#2a1a14;font:15px/1.6 inherit}" +
    ".gb-d::backdrop{background:rgba(42,26,20,.6)}.gb-d form,.gb-d .gb-b{padding:26px}.gb-d h3{margin:0 0 6px;color:#7a1508;font-size:20px}" +
    ".gb-d label{display:block;margin:12px 0 0;font-size:13px;font-weight:700}.gb-d input[type=text],.gb-d input[type=email]{width:100%;padding:10px;border:1px solid rgba(122,21,8,.3);background:#fff;font:inherit;margin-top:4px}" +
    ".gb-d .gb-c{display:flex;gap:8px;font-weight:400;font-size:12px;align-items:flex-start}.gb-d .gb-c input{margin-top:3px}" +
    ".gb-d button{margin-top:16px;padding:12px 18px;border:0;background:#7a1508;color:#efe8dc;font-weight:700;cursor:pointer}" +
    ".gb-d .gb-x{background:transparent;color:#7a1508;float:right;margin:0;padding:4px 8px}.gb-d .gb-msg{margin-top:12px;font-weight:700}.gb-hp{position:absolute;left:-9999px}";
  document.head.appendChild(css);

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }

  var dlg = el("dialog", { "class": "gb-d", "aria-labelledby": "gb-t" });
  var close = el("button", { type: "button", "class": "gb-x", "aria-label": T.x }, "×");
  close.onclick = function () { dlg.close(); };

  var body;
  if (!GAS_URL) {
    body = el("div", { "class": "gb-b" });
    body.appendChild(close);
    body.appendChild(el("h3", { id: "gb-t" }, T.t));
    body.appendChild(el("p", {}, T.pre));
    var a = el("a", { href: "mailto:" + CONTACT }, CONTACT);
    body.appendChild(a);
  } else {
    body = el("form", { novalidate: "" });
    body.appendChild(close);
    body.appendChild(el("h3", { id: "gb-t" }, T.t));
    body.appendChild(el("p", { id: "gb-d" }, T.d));
    var fName = el("input", { type: "text", name: "name", required: "", autocomplete: "name", maxlength: "60" });
    var fMail = el("input", { type: "email", name: "email", required: "", autocomplete: "email", maxlength: "120" });
    var fOrg = el("input", { type: "text", name: "org", autocomplete: "organization", maxlength: "80" });
    var fHp = el("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off", "class": "gb-hp", "aria-hidden": "true" });
    var fC = el("input", { type: "checkbox", required: "" }), fM = el("input", { type: "checkbox" });
    [[T.n, fName], [T.e, fMail], [T.o, fOrg]].forEach(function (p) { var l = el("label", {}, p[0]); l.appendChild(p[1]); body.appendChild(l); });
    var lc = el("label", { "class": "gb-c" }); lc.appendChild(fC); lc.appendChild(el("span", {}, T.c)); body.appendChild(lc);
    var lm = el("label", { "class": "gb-c" }); lm.appendChild(fM); lm.appendChild(el("span", {}, T.m)); body.appendChild(lm);
    body.appendChild(fHp);
    var btn = el("button", { type: "submit", id: "gb-s" }, T.s), msg = el("p", { "class": "gb-msg", role: "status" });
    body.appendChild(btn); body.appendChild(msg);
    body.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!body.reportValidity()) return;
      btn.disabled = true; msg.textContent = "…";
      fetch(GAS_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name: fName.value.trim(), email: fMail.value.trim(), org: fOrg.value.trim(), website: fHp.value,
          consent: fC.checked, newsletter: fM.checked, lang: code, doc: doc, page: location.pathname })
      }).then(function (r) { return r.json(); }).then(function (j) {
        msg.textContent = j && j.ok ? T.ok : T.err; if (!(j && j.ok)) btn.disabled = false;
      }).catch(function () { msg.textContent = T.err; btn.disabled = false; });
    });
  }
  dlg.appendChild(body);
  document.body.appendChild(dlg);
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-guidebook]");
    if (!t) return;
    e.preventDefault();
    doc = DOCS[t.getAttribute("data-guidebook")] ? t.getAttribute("data-guidebook") : "guidebook";
    var D = doc === "guidebook" ? T : ((DOCS[doc] || {})[code] || DOCS[doc].en);
    [["gb-t", D.t], ["gb-d", D.d], ["gb-s", D.s]].forEach(function (x) { var n = document.getElementById(x[0]); if (n) n.textContent = x[1]; });
    dlg.showModal();
  });
  // 이미지 우클릭·끌어 저장 막기 (텍스트 복사는 막지 않는다)
  var noSave = document.createElement("style");
  noSave.textContent = "img{-webkit-user-drag:none;user-select:none;-webkit-touch-callout:none}";
  document.head.appendChild(noSave);
  ["contextmenu", "dragstart"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target && e.target.tagName === "IMG") e.preventDefault(); });
  });
})();
