## Installation (Chrome Extension)
To install the Thieves Guild Basket extension in your browser, follow these steps:

1. Download or Clone the Thieves Guild Basket extension repository to your local machine.
2. Open your browser's extension manager (chrome://extensions)
3. Enable "Developer mode" if it is not already enabled. (top right)
4. Click "Load unpacked" and select the directory containing the Thieves Guild Basket extension.
5. The extension should now be loaded and active in your browser.

## Installation (Tampermonkey et al) 
If you use Tampermonkey or a similar userscript manager, you can install the Thieves Guild Basket extension as a userscript via GreasyFork: 

https://greasyfork.org/en/scripts/602282-thieves-guild-d-d-shop-basket

Alternatively you can install it manually.

1. Open your userscript manager and create a new script.
2. Copy the contents of the Thieves Guild Basket extension's `content.js` file into the new script.
3. Save the script and ensure it is enabled.
4. The extension should now be active on the Thieves Guild shop pages.

## Usage
1. Once installed, reload a thieves guild shop, when you click on an item, the Thieves Guild Basket extension will allow you to add it to your basket. 
2. The basket will appear on the page, showing the items you have added. You can view, remove, or adjust quantities of items directly from the basket.
3. It should show the cost, plus the additional weight of the items in your basket.

<img width="1322" height="547" alt="Zight 2026-10-25 at 23 59 47" src="https://github.com/user-attachments/assets/ba248f89-5a76-4b97-a843-8c90dafa0d7f" />

You can copy out the summary to send to your GM e.g.

```text
1x Flask or Tankard — Low: 2cp | Norm: 2cp | High: 4cp | Wt: 1 lb.
10x Rations (1 day) — Low: 4gp | Norm: 5gp | High: 10gp | Wt: 20 lb.
1x Waterskin (full) — Low: 2sp | Norm: 2sp | High: 4sp | Wt: 5 lb.
----------------------------------------
Carry Weight: 26 lb.
Low Total:    4gp + 2sp + 2cp
Normal Total: 5gp + 2sp + 2cp
High Total:   10gp + 4sp + 4cp
```
