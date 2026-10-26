// ==UserScript==
// @name         Thieves Guild D&D Shop Basket (v2.4 - Inside Expanding Description)
// @author       Dayjo
// @version      2.4
// @description  Adds an 'Add to Basket' form inside the description panel with weight & Low/Normal/High totals
// @match        https://www.thievesguild.cc/shops*
// @match        https://www.thievesguild.cc/equipment*
// @match        https://thievesguild.cc/shops*
// @match        https://thievesguild.cc/equipment*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'tg_dnd_shop_basket_v2';
  const MAX_COIN_KEY = 'tg_dnd_max_coin';

  let basket = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let maxCoin = localStorage.getItem(MAX_COIN_KEY) || 'gp';

  // Convert a price string (e.g., "1 pp", "2 gp", "5 sp", "2 cp") into base Copper Pieces (cp)
  function parseToCopper(priceStr) {
    if (!priceStr) return 0;
    let totalCp = 0;
    const regex = /(\d+(?:,\d+)*)\s*(pp|gp|ep|sp|cp)/gi;
    let match;
    while ((match = regex.exec(priceStr)) !== null) {
      const val = parseInt(match[1].replace(/,/g, ''), 10);
      const unit = match[2].toLowerCase();
      if (unit === 'pp') totalCp += val * 1000;
      else if (unit === 'gp') totalCp += val * 100;
      else if (unit === 'ep') totalCp += val * 50;
      else if (unit === 'sp') totalCp += val * 10;
      else if (unit === 'cp') totalCp += val;
    }
    return totalCp;
  }

  // Parse weight strings like "4 lb.", "1/2 lb.", "0.5 lbs", "¼ lb.", or "—"
  function parseWeight(text) {
    if (!text || text.includes('—') || text.includes('-')) return 0;
    const clean = text
      .replace(/¼/g, '0.25')
      .replace(/½/g, '0.5')
      .replace(/¾/g, '0.75');

    const fracMatch = clean.match(/(\d+)\s*\/\s*(\d+)\s*lbs?\.?/i);
    if (fracMatch) {
      return parseFloat(fracMatch[1]) / parseFloat(fracMatch[2]);
    }

    const numMatch = clean.match(/(\d+(?:\.\d+)?)\s*lbs?\.?/i);
    if (numMatch) {
      return parseFloat(numMatch[1]);
    }
    return 0;
  }

  // Format base Copper Pieces respecting the chosen maximum denomination (pp, gp, sp, or cp)
  function formatCopper(totalCp) {
    if (!totalCp || totalCp <= 0) return '0cp';
    let rem = Math.round(totalCp);

    let pp = 0, gp = 0, sp = 0, cp = 0;

    if (maxCoin === 'pp') {
      pp = Math.floor(rem / 1000);
      rem %= 1000;
    }

    if (maxCoin === 'pp' || maxCoin === 'gp') {
      gp = Math.floor(rem / 100);
      rem %= 100;
    }

    if (maxCoin === 'pp' || maxCoin === 'gp' || maxCoin === 'sp') {
      sp = Math.floor(rem / 10);
      rem %= 10;
    }

    cp = rem;

    const parts = [];
    if (pp > 0) parts.push(`${pp.toLocaleString()}pp`);
    if (gp > 0) parts.push(`${gp.toLocaleString()}gp`);
    if (sp > 0) parts.push(`${sp.toLocaleString()}sp`);
    if (cp > 0) parts.push(`${cp.toLocaleString()}cp`);

    return parts.join(' + ');
  }

  function formatWeight(lb) {
    const rounded = Math.round(lb * 100) / 100;
    return `${rounded} lb.`;
  }

  function saveBasket() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
    renderBasketUI();
  }

  function addToBasket(name, pricesObj, weightLb, qty) {
    if (qty <= 0) return;
    const existing = basket.find((item) => item.name === name);
    if (existing) {
      existing.qty += qty;
      existing.prices = pricesObj;
      existing.weight = weightLb;
    } else {
      basket.push({ name, prices: pricesObj, weight: weightLb, qty });
    }
    saveBasket();
  }

  function updateItemQty(index, newQty) {
    if (newQty <= 0) {
      basket.splice(index, 1);
    } else {
      basket[index].qty = newQty;
    }
    saveBasket();
  }

  function clearBasket() {
    basket = [];
    saveBasket();
  }

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .tg-desc-form {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
      margin-top: 10px !important;
      padding: 8px 12px !important;
      background: #efe7dc !important;
      border: 1px solid #c8b7a6 !important;
      border-left: 4px solid #7a2021 !important;
      border-radius: 4px !important;
      font-family: Georgia, serif !important;
      color: #2c1e16 !important;
    }
    .tg-desc-meta {
      font-size: 12px !important;
      color: #4a3525 !important;
    }
    .tg-desc-controls {
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .tg-desc-controls label {
      font-size: 12px !important;
      font-weight: bold !important;
      margin: 0 !important;
      color: #2c1e16 !important;
    }
    .tg-qty-input {
      width: 54px !important;
      height: 26px !important;
      padding: 2px 6px !important;
      font-size: 13px !important;
      border: 1px solid #8b6b4a !important;
      border-radius: 3px !important;
      background: #fff !important;
      color: #222 !important;
      text-align: center !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }
    .tg-add-btn {
      background: #7a2021 !important;
      color: #fff !important;
      border: 1px solid #4a1011 !important;
      border-radius: 3px !important;
      padding: 3px 12px !important;
      height: 26px !important;
      line-height: 18px !important;
      font-size: 12px !important;
      cursor: pointer !important;
      font-weight: bold !important;
      transition: background 0.15s !important;
      white-space: nowrap !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }
    .tg-add-btn:hover {
      background: #9e2a2b !important;
    }
    #tg-basket-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 390px;
      max-height: 560px;
      background: #fdfaf6;
      border: 2px solid #5c4033;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      font-family: Georgia, serif;
      color: #2c1e16;
      overflow: hidden;
    }
    #tg-basket-header {
      background: #5c4033;
      color: #f4ece1;
      padding: 10px 12px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    #tg-basket-settings {
      background: #e9e0d4;
      padding: 6px 12px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #d4c5b3;
    }
    #tg-max-coin-select {
      font-size: 12px;
      padding: 2px 6px;
      border: 1px solid #8b6b4a;
      border-radius: 3px;
      background: #fff;
      color: #2c1e16;
      font-weight: bold;
      cursor: pointer;
    }
    #tg-basket-body {
      padding: 8px 12px;
      overflow-y: auto;
      max-height: 250px;
      font-size: 13px;
    }
    .tg-basket-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px dashed #d4c5b3;
      gap: 6px;
    }
    .tg-basket-item-info {
      flex: 1;
      line-height: 1.3;
    }
    .tg-basket-item-sub {
      font-size: 11px;
      color: #6e5a49;
    }
    .tg-basket-item-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tg-remove-btn {
      background: none;
      border: none;
      color: #a32222;
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
      padding: 0 4px;
    }
    #tg-basket-footer {
      background: #efe7dc;
      padding: 10px 12px;
      border-top: 2px solid #5c4033;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tg-summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 2px 0;
    }
    .tg-summary-row.tg-norm-row {
      font-size: 15px;
      font-weight: bold;
      color: #7a2021;
      border-top: 1px solid #d4c5b3;
      border-bottom: 1px solid #d4c5b3;
      padding: 4px 0;
      margin: 2px 0;
    }
    .tg-weight-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: bold;
      color: #3b2a1e;
      padding-bottom: 4px;
      border-bottom: 1px dashed #c8b7a6;
      margin-bottom: 2px;
    }
    .tg-footer-btns {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 6px;
    }
    .tg-footer-btn {
      flex: 1;
      padding: 5px 8px;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #8b6b4a;
      background: #fff;
      color: #2c1e16;
      font-weight: bold;
    }
    .tg-footer-btn:hover {
      background: #e2d5c4;
    }
    .tg-minimized #tg-basket-settings,
    .tg-minimized #tg-basket-body,
    .tg-minimized #tg-basket-footer {
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Build Floating Basket UI
  const widget = document.createElement('div');
  widget.id = 'tg-basket-widget';
  widget.innerHTML = `
    <div id="tg-basket-header">
      <span>🎒 Adventurer's Basket (<span id="tg-item-count">0</span>)</span>
      <span id="tg-collapse-icon">▼</span>
    </div>
    <div id="tg-basket-settings">
      <label for="tg-max-coin-select" style="font-weight:bold;color:#5c4033;margin:0;">Max Denomination:</label>
      <select id="tg-max-coin-select" title="Choose the highest coin type accepted by this town/shop">
        <option value="gp">Gold (gp, sp, cp) — Default</option>
        <option value="pp">Platinum (pp, gp, sp, cp)</option>
        <option value="sp">Silver only (sp, cp)</option>
        <option value="cp">Copper only (cp)</option>
      </select>
    </div>
    <div id="tg-basket-body"></div>
    <div id="tg-basket-footer">
      <div class="tg-weight-row">
        <span>⚖️ Carry Weight:</span>
        <span id="tg-total-weight">0 lb.</span>
      </div>
      <div class="tg-summary-row" title="Cheap / Discounted Shop Total">
        <span>Low (Cheap) Total:</span>
        <strong id="tg-total-low">0cp</strong>
      </div>
      <div class="tg-summary-row tg-norm-row" title="Standard Price Total">
        <span>Normal Cost Total:</span>
        <strong id="tg-total-norm">0cp</strong>
      </div>
      <div class="tg-summary-row" title="Expensive / Marked-Up Shop Total">
        <span>High (Expensive) Total:</span>
        <strong id="tg-total-high">0cp</strong>
      </div>
      <div class="tg-footer-btns">
        <button class="tg-footer-btn" id="tg-copy-btn">Copy Summary</button>
        <button class="tg-footer-btn" id="tg-clear-btn">Clear Basket</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const maxCoinSelect = document.getElementById('tg-max-coin-select');
  maxCoinSelect.value = maxCoin;
  maxCoinSelect.addEventListener('change', (e) => {
    maxCoin = e.target.value;
    localStorage.setItem(MAX_COIN_KEY, maxCoin);
    renderBasketUI();
  });

  document.getElementById('tg-basket-header').addEventListener('click', () => {
    widget.classList.toggle('tg-minimized');
    const isMin = widget.classList.contains('tg-minimized');
    document.getElementById('tg-collapse-icon').textContent = isMin ? '▲' : '▼';
  });

  document.getElementById('tg-clear-btn').addEventListener('click', () => {
    if (confirm('Empty your entire shopping basket?')) clearBasket();
  });

  document.getElementById('tg-copy-btn').addEventListener('click', () => {
    if (basket.length === 0) return;
    let normCp = 0, lowCp = 0, highCp = 0, totalWeight = 0;

    const lines = basket.map((item) => {
      const nSub = item.prices.normal * item.qty;
      const lSub = item.prices.low * item.qty;
      const hSub = item.prices.high * item.qty;
      const wSub = (item.weight || 0) * item.qty;

      normCp += nSub;
      lowCp += lSub;
      highCp += hSub;
      totalWeight += wSub;

      return `${item.qty}x ${item.name} — Low: ${formatCopper(lSub)} | Norm: ${formatCopper(nSub)} | High: ${formatCopper(hSub)} | Wt: ${formatWeight(wSub)}`;
    });

    lines.push(`----------------------------------------`);
    lines.push(`Carry Weight: ${formatWeight(totalWeight)}`);
    lines.push(`Low Total:    ${formatCopper(lowCp)}`);
    lines.push(`Normal Total: ${formatCopper(normCp)}`);
    lines.push(`High Total:   ${formatCopper(highCp)}`);

    navigator.clipboard.writeText(lines.join('\n'));

    const btn = document.getElementById('tg-copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy Summary'), 1500);
  });

  function renderBasketUI() {
    const body = document.getElementById('tg-basket-body');
    const countEl = document.getElementById('tg-item-count');
    const weightEl = document.getElementById('tg-total-weight');
    const lowEl = document.getElementById('tg-total-low');
    const normEl = document.getElementById('tg-total-norm');
    const highEl = document.getElementById('tg-total-high');

    body.innerHTML = '';
    let totalCount = 0;
    let totalWeight = 0;
    let grandLowCp = 0;
    let grandNormCp = 0;
    let grandHighCp = 0;

    if (basket.length === 0) {
      body.innerHTML = `<div style="color:#777;text-align:center;padding:14px 0;">Your basket is empty.</div>`;
    } else {
      basket.forEach((item, idx) => {
        const lineNorm = item.prices.normal * item.qty;
        const lineLow = item.prices.low * item.qty;
        const lineHigh = item.prices.high * item.qty;
        const lineWt = (item.weight || 0) * item.qty;

        grandNormCp += lineNorm;
        grandLowCp += lineLow;
        grandHighCp += lineHigh;
        totalWeight += lineWt;
        totalCount += item.qty;

        const row = document.createElement('div');
        row.className = 'tg-basket-row';
        row.innerHTML = `
          <div class="tg-basket-item-info">
            <div><strong>${item.name}</strong> <span style="font-size:11px;color:#666;">(${formatWeight(lineWt)})</span></div>
            <div class="tg-basket-item-sub">
              L: ${formatCopper(lineLow)} | <strong>N: ${formatCopper(lineNorm)}</strong> | H: ${formatCopper(lineHigh)}
            </div>
          </div>
          <div class="tg-basket-item-actions">
            <input type="number" min="1" class="tg-qty-input" value="${item.qty}" />
            <button class="tg-remove-btn" title="Remove item">✕</button>
          </div>
        `;

        row.querySelector('.tg-qty-input').addEventListener('change', (e) => {
          updateItemQty(idx, parseInt(e.target.value, 10) || 0);
        });

        row.querySelector('.tg-remove-btn').addEventListener('click', () => {
          updateItemQty(idx, 0);
        });

        body.appendChild(row);
      });
    }

    countEl.textContent = totalCount;
    weightEl.textContent = formatWeight(totalWeight);
    lowEl.textContent = formatCopper(grandLowCp);
    normEl.textContent = formatCopper(grandNormCp);
    highEl.textContent = formatCopper(grandHighCp);
  }

  // Create the Add-to-Basket form bar for inside the .coldesc.dmtabind panel
  function createDescriptionForm(itemName, pricesObj, weightLb) {
    const formBar = document.createElement('div');
    formBar.className = 'tg-desc-form';
    formBar.innerHTML = `
      <div class="tg-desc-meta">
        <strong>${itemName}</strong> —
        Low: ${formatCopper(pricesObj.low)} |
        <strong>Norm: ${formatCopper(pricesObj.normal)}</strong> |
        High: ${formatCopper(pricesObj.high)}
        (${formatWeight(weightLb)})
      </div>
      <div class="tg-desc-controls">
        <label>Qty:</label>
        <input type="number" min="1" value="1" class="tg-qty-input" title="Quantity" />
        <button type="button" class="tg-add-btn">+ Add to Basket</button>
      </div>
    `;

    const input = formBar.querySelector('.tg-qty-input');
    const btn = formBar.querySelector('.tg-add-btn');

    formBar.addEventListener('click', (e) => e.stopPropagation());

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const qty = parseInt(input.value, 10) || 1;
      addToBasket(itemName, pricesObj, weightLb, qty);
      btn.textContent = '✓ Added to Basket!';
      setTimeout(() => (btn.textContent = '+ Add to Basket'), 900);
    });

    return formBar;
  }

  // Find the matching .coldesc.dmtabind element for a given .flexrow.contentrow
  function findDescriptionElement(row) {
    // 1. Check onclick="toggle_visibility('desc55')" on the item link
    const link = row.querySelector('a[onclick*="toggle_visibility"]');
    if (link) {
      const onclickAttr = link.getAttribute('onclick') || '';
      const idMatch = onclickAttr.match(/toggle_visibility\(\s*['"]([^'"]+)['"]\s*\)/i);
      if (idMatch && idMatch[1]) {
        const byId = document.getElementById(idMatch[1]);
        if (byId) {
          // If #desc55 itself is .coldesc.dmtabind or wraps it
          if (byId.classList.contains('coldesc')) return byId;
          const innerDesc = byId.querySelector('.coldesc.dmtabind, .coldesc');
          return innerDesc || byId;
        }
      }
    }

    // 2. Fallback: look at the immediate next sibling or inside it
    const nextSib = row.nextElementSibling;
    if (nextSib) {
      if (nextSib.classList.contains('coldesc')) return nextSib;
      const innerDesc = nextSib.querySelector('.coldesc.dmtabind, .coldesc');
      if (innerDesc) return innerDesc;
    }

    return null;
  }

  function injectShopButtons() {
    const flexRows = document.querySelectorAll('.flexrow.contentrow');
    flexRows.forEach((row) => {
      if (row.dataset.tgInjected) return;

      const firstCell = row.querySelector('.firstcell, .col1');
      const costCell = row.querySelector('.colcost, .col2');
      if (!firstCell || !costCell) return;

      const lowCell = row.querySelector('.colcostlo, .col3');
      const highCell = row.querySelector('.colcosthi, .col4');
      const weightCell = row.querySelector('.colweight, .col5');

      const nameAnchor = firstCell.querySelector('a');
      const itemName = (nameAnchor ? nameAnchor.textContent : firstCell.textContent).trim();
      if (!itemName) return;

      const normalCp = parseToCopper(costCell.textContent);
      if (normalCp === 0) return;

      const lowCp = lowCell ? parseToCopper(lowCell.textContent) : normalCp;
      const highCp = highCell ? parseToCopper(highCell.textContent) : normalCp;
      const weightLb = weightCell ? parseWeight(weightCell.textContent) : 0;

      const pricesObj = {
        low: lowCp || normalCp,
        normal: normalCp,
        high: highCp || normalCp
      };

      const descEl = findDescriptionElement(row);
      if (descEl) {
        row.dataset.tgInjected = 'true';
        descEl.appendChild(createDescriptionForm(itemName, pricesObj, weightLb));
      }
    });
  }

  injectShopButtons();
  renderBasketUI();

  // Observe DOM changes in case shop tabs or descriptions render dynamically
  let scanTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(injectShopButtons, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();