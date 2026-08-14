// ==UserScript==
// @name         Steam to SteamDB Button
// @namespace    https://store.steampowered.com/
// @version      1.3.1
// @description  Adds three buttons to Steam game, bundle and package pages. SteamDB links to that exact product (price history, technical data, package contents, change tracking), built from the ID in the URL. GG.deals searches the title among Steam-DRM deals, with no store-rating floor so nothing is hidden. PCGamingWiki searches the title for compatibility and fixes. The last two are title searches and say so in a tooltip drawn by the store's own tooltip system. All three use Steam's own button classes.
// @author       g31w0fw0rld
// @license      MIT
// @match        https://store.steampowered.com/app/*
// @match        https://store.steampowered.com/bundle/*
// @match        https://store.steampowered.com/sub/*
// @downloadURL  https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js
// @updateURL    https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =============================================
    // CONSTANTES
    // =============================================
    const STEAMDB_BASE_URL = 'https://steamdb.info/';
    const PATH_REGEX = /\/(app|bundle|sub)\/(\d+)/;
    const STEAMDB_BUTTON_ID = 'steamdbButtonContainer';
    const STYLES_ID = 'steamdbButtonStyles';
    const ICON_CLASS = 'sdbx-ico';
    // Clase con la que la tienda viste sus propios tooltips. Es literalmente lo que
    // cada ficha le pasa a SetupTooltips() en su DOMContentLoaded, así que pasarla
    // aquí es lo que hace que el nuestro salga idéntico y no un div sin estilo.
    // Su CSS (store.css) le da max-width 275px, white-space normal y word-wrap, o
    // sea que los textos largos de aquí abajo caben sin retocarlos.
    const STEAM_TOOLTIP_CLASS = 'store_tooltip';

    // GG.deals filtra por DRM con un bitmask numérico en la query, no por nombre:
    // 1 Steam, 8 GOG, 16 sin DRM, 32 otros, 128 Microsoft Store. Aquí solo interesa
    // Steam, que es el DRM de todo lo que se vende en esta tienda.
    // Va a /deals/ (la lista de ofertas), que es la que acepta el filtro de DRM;
    // /games/ lo ignora. Y minRating=0 desactiva el mínimo de valoración de tienda
    // que trae por defecto, que si no esconde parte de las ofertas.
    const GGDEALS_SEARCH_URL = 'https://gg.deals/deals/';
    const GGDEALS_STEAM_DRM = '1';
    const GGDEALS_MIN_RATING = '0';
    const PCGW_SEARCH_URL = 'https://www.pcgamingwiki.com/w/index.php';

    // Icono SVG oficial de SteamDB
    const STEAMDB_SVG = '<svg width="16" height="16" viewBox="0 0 128 128" class="octicon octicon-steamdb" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M63.9 0C30.5 0 3.1 11.9.1 27.1l35.6 6.7c2.9-.9 6.2-1.3 9.6-1.3l16.7-10c-.2-2.5 1.3-5.1 4.7-7.2 4.8-3.1 12.3-4.8 19.9-4.8 5.2-.1 10.5.7 15 2.2 11.2 3.8 13.7 11.1 5.7 16.3-5.1 3.3-13.3 5-21.4 4.8l-22 7.9c-.2 1.6-1.3 3.1-3.4 4.5-5.9 3.8-17.4 4.7-25.6 1.9-3.6-1.2-6-3-7-4.8L2.5 38.4c2.3 3.6 6 6.9 10.8 9.8C5 53 0 59 0 65.5c0 6.4 4.8 12.3 12.9 17.1C4.8 87.3 0 93.2 0 99.6 0 115.3 28.6 128 64 128c35.3 0 64-12.7 64-28.4 0-6.4-4.8-12.3-12.9-17 8.1-4.8 12.9-10.7 12.9-17.1 0-6.5-5-12.6-13.4-17.4 8.3-5.1 13.3-11.4 13.3-18.2 0-16.5-28.7-29.9-64-29.9zm22.8 14.2c-5.2.1-10.2 1.2-13.4 3.3-5.5 3.6-3.8 8.5 3.8 11.1 7.6 2.6 18.1 1.8 23.6-1.8s3.8-8.5-3.8-11c-3.1-1-6.7-1.5-10.2-1.5zm.3 1.7c7.4 0 13.3 2.8 13.3 6.2 0 3.4-5.9 6.2-13.3 6.2s-13.3-2.8-13.3-6.2c0-3.4 5.9-6.2 13.3-6.2zM45.3 34.4c-1.6.1-3.1.2-4.6.4l9.1 1.7a10.8 5 0 1 1-8.1 9.3l-8.9-1.7c1 .9 2.4 1.7 4.3 2.4 6.4 2.2 15.4 1.5 20-1.5s3.2-7.2-3.2-9.3c-2.6-.9-5.7-1.3-8.6-1.3zM109 51v9.3c0 11-20.2 19.9-45 19.9-24.9 0-45-8.9-45-19.9v-9.2c11.5 5.3 27.4 8.6 44.9 8.6 17.6 0 33.6-3.3 45.2-8.7zm0 34.6v8.8c0 11-20.2 19.9-45 19.9-24.9 0-45-8.9-45-19.9v-8.8c11.6 5.1 27.4 8.2 45 8.2s33.5-3.1 45-8.2z"></path></svg>';

    // Icono de GG.deals: favicon remoto (su CDN permite el hotlink). Si algún día
    // el CSP de Steam lo bloqueara, el onerror lo quita y queda solo la etiqueta.
    const GGDEALS_ICON_URL = 'https://gg.deals/favicon.ico';
    // Icono de PCGamingWiki: SVG inline. Su favicon.ico responde 403 al hotlink
    // (Cloudflare) desde otros dominios, así que como <img> remoto no se ve; el SVG
    // inline es markup y siempre pinta, sin depender del CSP ni del hotlink.
    const PCGW_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 827 1158" width="13" height="18" aria-hidden="true" style="vertical-align:middle;flex:0 0 auto"><path d="M0 166.2 448.9-1.1 827.4 56.1l0 1023.9 0.1 28.9L452.1 1158.9 0 1008.4z" fill="#365798"/><path d="M25.3 985.5 24.1 190.5 413 46.8 412 1107.6zM478.1 1108.6 478.3 52.3 788.1 94.3l0 975.8z" fill="#a5b6d9"/><path d="M215.5 737 41.5 727 40.3 420.5 215.9 404.1zm16.7-334.5 156.1-19.4-1.2 359.8-155.2-4.8zM39.3 399.9l0-194.4 176-57.4 1.2 232.1zm350.8-317.2 0.9 274.5-158.7 20.4 0-238zm-253 909.7 0-235.1 141.7 9.3 0 268.4zm247 80.8-17.3-6.4c3.8-22.5-18.9-31.9-19.1-5.7l-18.7-5.5c-0.9-22.1-13.9-31.7-21.2-6.8l-9.7-3-0.6-277.7 12.3 0.9c-4.3 27.5 23.5 28.2 20.3 1.7L350.4 772c-4.4 28.6 23.2 28.9 20.4 1.3l12.7 0.8zM42.8 751.1l82.2 5.9-0.5 108-81.9-11.2zm83.1 129.3-0.9 110.4-82.7-20.2 0-102.4zM494.3 70l278.6 36.6 0 950-278.3 35.1z" fill="#365798"/><path d="m279 507.5c-0.1-5.1 0-10 3.2-14.2 6 0.2 4.9 9.7 5 14.3 10.3 5.1 4.9-10.8 10.2-15.3 7.6-0.8-0.6 16 6.9 15.8 4.9-0.1 3.9-2.4 3.8-6.7-0.1-3.9 0.4-7.8 3.8-10.3 8.2 3.1 0.8 18.2 11.2 15.8 0-6.4-1-14.2 5.8-17.6 2.6 5.2-0.1 14.8 5.4 16.1 7.4 1.7 8.4 3.6 10.2 10.5 0.8 3.1-0.4 4.6 2.8 6.4 3.5 2 7.6 1.4 7.7 6.1 0.1 6.4-2.7 5.5-7.6 5.5-1.8 0-2.4 3.4-2.5 4.7-0.4 4.7 0.4 5.7 5 7 5.9 1.7 4.9 3.3 4.9 8.7 0 2.7 0.5 1.2-3.1 1.9-5.7 1.1-7 0.3-6.7 6.8 0.4 7.8 13.4 1.4 9.7 12.6-1.6 4.8-9.5 1.1-9.5 5.3 0 5.3-1.1 7.7 5.4 8.2 6.4 0.5 6 9.1 0.4 11-3.4 1.2-4.6-0.1-5.8 4-1.2 4.1-1.1 8.4-2.6 12.5-6.1 4.5-11.6-1.7-11.6 8.4 0 2.7-0.6 4.7-1.1 7.3-0.9 5-2.2 0.7-5.8 1.8-1-1.2 0-7.9 0-9.5 0-4.7-1.6-5.8-7-5.4-0.3 5.8-0.2 12-4.9 16.2-2.9-1.9-4-4.8-4.2-8.1-0.3-6.5 0.2-6.7-6.5-8.3-1.2 2.9-2 11.4-1.5 14.5-5.2 2.6-6-5.4-6-8.6 0-2.7 1.1-5.7-2.3-6.7-3.4-0.9-4.6 0.8-4.7 3.9-0.2 6.1-0.5 8.8-5.3 12.2-1.9-5.4-0.3-14.7-6.6-16.4-7-1.8-7.9-6.9-8-13.6-0.1-7.3-8.9-0.3-8.9-8.2 0-0.8-0.6-4.9 0-5.5 2.9-2.1 5.8 1.2 8.5 0.1 1.3-3.6 1.8-9-2.1-9.9-4-0.9-7.8-1.4-6.9-6 1.1-5.7 0.1-5.4 6.3-5.8 4.7-0.3 3-5.2 3.1-8.4-6.2-2.9-8.8 0.8-8.8-7.4 0-5.6-0.4-5.1 5.2-5.1 4.8 0 3.4-1.7 3.4-6.3 0-5.1-9.2-0.6-9.6-7.6-0.2-3 1-5.6 3.9-6.7 5.1-2 5.7-2.3 5.9-7.8 0.3-8 5.6-8.9 12-12.1l0 0 0 0zM88.3 368.3l24.3-92.2-15.7 7.5 21.6-79 25.5-7.3-19.1 53.1 19.2-10.3-55.7 128.3 0 0z" fill="#a5b6d9"/><path d="m278.8 317.9c1.2-3.2 2.5-6.5 3.8-9.9 13.8 5.9 26.4 10.2 40.6 1.9 13.7-8 22.8-24.3 28-38.8 10.2-28.4 10.2-66.8-8.3-91.8-22.5-30.5-54.5-14.5-69.8 13.9-4.7 8.8-11.2 31.3-12.1 45.3-0.5 6.9-0.2 14.1 0.8 21.3 1 8.1 5.2 16.5 4.2 24.7-0.3 2.5-1.8 4.1-4.6 4.6-16.7-28-7.6-72.9 4.9-100.6 12.5-27.6 47.9-55.5 75.9-29 25.7 24.2 28.2 68.1 21.3 100.3-6.2 28.8-26 71.4-61.9 68.2-6.4-0.6-19.1-3.8-22.7-10l0 0zM299.3 272c-3.2-11.6 11.5-19.5 14.8-28.4 1.9-5.2-0.1-9.6-2.2-14-4.9-2.6-9-1.1-10.8 4-3.2 8.9-6.5 14.9-12.6 22.1-3.3-13.7-1.4-29.1 6.6-40.9 4.3-6.3 12.9-9.4 19.4-6.9 20.5 7.8 14.2 42.7 5.3 56.4-4.7 7.3-12.7 7.6-20.5 7.6L299.3 272zm3.4-25.8c0.5 0.7 0.5 1.4 0.2 2-9.4 21.3-18.7 42.6-28.2 64-0.9-0.4-1.4-0.4-1.7-0.7-3.3-3.9-5.6-8.5-7.8-13.1-0.9-1.8 0.1-3.6 1.2-5.1l32.8-43.7c0.9-1.3 2-2.6 3.4-3.4l0 0z" fill="#a5b6d8"/><path d="m188.7 921.7c-6.1 11.9-4.4 25.1-6 38-9.7-2.4-16.7-21.7-18.6-30 1.7-9.9 6.9-17.2 12.9-24.9 2.8-3.6 3.7-7.2 1.9-11.4-0.7-1.6-0.6-3.6-2-4.9-8.7 1.5-13.9 8.2-19.9 14-6.7-7-5.2-33.4 0.2-41.1 8.4-1.5 15.8 1 22.6 5.8 5.3-5.2 5.6-10.3 0.9-15.7-3.6-4.1-14.7-8.9-16.7-13.1-1.6-6.3 10.2-27.5 17.3-27.2 7.8 11.5 12.4 24.5 15 38.1 2.7 1.1 5.1 2.1 8.2 1.5 1.6-15.5-1.9-30.3-6.8-44.8 0.5-0.5 0.8-0.9 1-0.9 8.6 0.6 16.8 2.3 23.4 8.6 14.9 14.2-11.5 41.7 0.4 58.4 10.7-10.3 10.5-23.1 18.6-34 8 10.3 15 31 13.7 44.1-6.9 8.3-12.4 13-28.9 14.2 0.5 3.7-1.8 7.2-0.8 11.5 8.8 9.4 18.5 7.9 30.1 7.2 1.6 8.2-6.7 33.6-12.9 39.7-12.6-5.7-19.1-17.9-26.1-29.1-2.5 1.9-4.6 3.7-6.4 6.1 1.7 12.9 18 29.3 15.9 40.7-5.5 2.6-11.4 4.3-17.7 3.4-6.2-0.9-8.7-4.3-10.2-10.9-3.3-14.7 3.2-32.8-9.2-43.3zm118.5 22.1 0-63.8 67.8 10.9 0 67.4zM307.1 804.2 375 811.3 375 878.1 307.1 868.2zm67.7 165.5 0 66.8-67.6-18.6 0-63.6zm-320.5-31.7 0-28.9 13.7 2 16.5-16.6 0.7 67.6-16.3-20.9z" fill="#a5b6d9"/><path d="m89.1 914.4c1.4-0.6 2.3-0.5 3.4-0.2 2.8 6.5 3.9 13.4 3.6 20.5-0.1 2.7-1.1 5.1-1.7 7.6-0.5 1.9-1.8 3-3.4 3.9-1.3-1.3-0.9-2.5-0.6-3.8 0.8-3.7 1.6-7.3 1.7-11.1 0.2-5.8-1.6-11.2-2.9-16.9l0 0 0 0zm7 42.4c-0.3-3.3 0.9-6.2 1.6-9.1 1-4.4 2.5-8.8 3.1-13.2 0.8-5.6-1-11-2.4-16.4-0.7-2.5-1.5-5-2.2-7.5-0.4-1.6-0.7-3.1 0.2-4.5 1.3-0.1 1.8 0.6 2.1 1.3 2.1 4.3 3.6 8.6 4.5 13.3 1 5.5 0.5 10.9 0.9 16.3 0.3 3.5-0.8 6.9-1.3 10.2-0.6 3.8-2.6 7.4-6.6 9.6l0 0zm7.6 10.4c-1.9-3.7-1.4-6.5-0.1-9.8 3.1-8.1 5.9-16.4 5.3-25.2-0.5-7.7-1.8-15.2-4.6-22.4-1.2-3-2.3-6.1-3.3-9 0.8-1.2 1.7-2 3.4-1.6 1.8 4.1 3.9 8.3 5.1 12.8 5 19 5 37.4-5.7 55.3l0 0z" fill="#a5b6d9"/><path d="m598.7 1047.1-70.3 8.4-0.2-378.8 70.5-3.8zM688.5 533.1c-11 50.3-65.8 45.6-78.3 2.8l-92.4 3.1-0.2-67.9 89.4-3.3c22.8-54 64.5-46.2 81.8 0.2l66.2 0.4 1.6 61.8zm-172.4-237.1 0-24 241.7 7.5 0.1 19.4z" fill="#a5b6d9"/><path d="m52.3 827.5 62.6 9.7-19.2-43.4-8.2 15-13.4-29.3-21.8 48.1zM116.4 788c0 4.4-3.5 7.9-7.9 7.9-4.4 0-7.9-3.5-7.9-7.9 0-4.4 3.5-7.9 7.9-7.9 4.4 0 7.9 3.5 7.9 7.9z" fill="#a5b6d9"/><ellipse cx="649.4" cy="501.8" rx="31" ry="51.8" fill="#365798"/><path d="m177.7 627.1c-1.8 3-1.6 6.7 0.4 9.3l-26.3 40 6.6-0.1 25-36.7c3.2 0.6 6.6-0.9 8.5-3.8 2.4-3.9 1.2-9-2.7-11.4-3.9-2.4-9-1.2-11.5 2.7zm-110.8 29.7-9.7 12.9 4.6 4.3 7.9-11 7.1 0.3c0.4 0.7 0.9 1.4 1.5 2 3.3 3.3 8.6 3.3 11.8 0 3.3-3.3 3.3-8.6 0-11.8-3.3-3.3-8.6-3.3-11.8 0-1 1-1.7 2.3-2.1 3.6zm20.1-68.7c-4.4 0-8 3.6-8 8 0 4.4 3.6 8 8 8 3.7 0 6.8-2.5 7.7-6l44.5 1.3 17.4 21.5c-0.2 0.8-0.4 1.6-0.4 2.4 0 4.6 3.8 8.4 8.4 8.4 4.6 0 8.4-3.8 8.4-8.4 0-4.6-3.8-8.4-8.4-8.4-1.5 0-2.9 0.4-4.1 1.1l-18.9-22.9-48-1.3c-1.4-2.2-3.9-3.7-6.8-3.7zm13.5 27c-4.6 0.1-8.3 4-8.1 8.6 0.1 4.6 4 8.3 8.6 8.1 3.3-0.1 6-2.1 7.3-4.9l22.2-0.5c1.4 2.9 4.4 4.8 7.8 4.7 4.6-0.1 8.3-4 8.1-8.6-0.1-4.6-4-8.3-8.6-8.1-3.6 0.1-6.6 2.5-7.7 5.7l-21.5 0.5c-1.2-3.3-4.4-5.7-8.1-5.6zm-26 16.7c0 4.4-3.6 8-8 8-4.4 0-8-3.6-8-8 0-4.4 3.6-8 8-8 4.4 0 8 3.6 8 8zM87.6 476.5c-3.5 0.2-6.4 2.5-7.5 5.6l-22.6 1 0.3 6.2 22.6-1c1.4 3 4.4 5 7.9 4.9 4.6-0.2 8.1-4.1 7.9-8.7-0.2-4.6-4.1-8.2-8.7-8zm56.3 20c-4.6 0.1-8.3 4-8.1 8.6 0.1 4.6 4 8.3 8.6 8.1 3.3-0.1 6-2.1 7.3-4.9l25.3-0.7c1.4 2.9 4.4 4.8 7.8 4.7 4.6-0.1 8.3-4 8.1-8.6-0.1-4.6-4-8.3-8.6-8.1-3.6 0.1-6.6 2.5-7.7 5.7l-24.6 0.7c-1.2-3.3-4.4-5.7-8.1-5.6zm-44.4-30.4-4.1 4.7 19.8 17.1 80.9-3-0.5-6.2-78.3 2.8zm-41.6 51.7-0.2-6 68.2-4 71.4 103.9-5.3 3.3-70.1-101.1zm132.6 25.4c2.3-2.6 2.6-6.3 1.1-9.3l6.6-9.5 0.4-9-11.7 14.4c-3.1-1.1-6.7-0.2-9 2.4-3 3.5-2.7 8.7 0.8 11.7 3.5 3 8.7 2.7 11.8-0.8zm-32.3 0.4c2 2.9 5.5 4.1 8.7 3.3l30.7 44.3-0.1-9.8-25.5-38c1.8-2.8 1.8-6.4-0.2-9.3-2.6-3.8-7.8-4.7-11.6-2-3.8 2.6-4.7 7.8-2.1 11.6zm-34.8-9.6c-3.5 0.2-6.4 2.5-7.5 5.6l-57.2 2.9 0.3 6.2 57.2-2.9c1.4 3 4.4 5 7.9 4.9 4.6-0.2 8.1-4.1 7.9-8.7-0.2-4.6-4.1-8.2-8.7-8zm17.5 33-81.3 2 0.2 6.3 78.7-2 17.5 22.3c-0.2 0.8-0.4 1.6-0.4 2.4 0 4.6 3.8 8.4 8.4 8.4 4.6 0 8.4-3.8 8.4-8.4 0-4.6-3.8-8.4-8.4-8.4-1.5 0-2.9 0.4-4.1 1.1zM179.2 672.5c1.2 2.6 5 0.2 5.7 3.6-1 4.1-8.9 0.5-11.6 0.9-1.4-4.3 8.4-15.3 10.9-18.8 2.8-1.4 9.4 0 12.6 0 0.3 2.8 0.5 5.3-1.5 7.8-3.4 0.1-6.7-1.4-10.1-1.7-2 2.7-4 5.5-6 8.2zM67.3 604.9l-8.1 0 0-6.7c6.2 0 9.7-1.6 13.2 3.9 6.6 10.3 12.8 20.9 19.1 31.4 3.1 5.2 6.3 10.4 9.5 15.5 4.6 7.4 5.8 8 14.6 8.6 6.3 0.4 12.7 0.4 19.1 0.4 6.6 0 6.4-5.5 12.7-4.9 5.4 5.1 5.4 11.7 0 16.8-6 0.4-5.3-5.8-9.8-5.8l-19.2 0c-9.5 0-12.4 2.1-17.3-5.6-11.2-17.9-22.4-35.7-33.6-53.6z" fill="#a5b6d9"/><path d="m339.3 257.1c0 3.2-2.6 5.9-5.9 5.9-3.2 0-5.9-2.6-5.9-5.9 0-3.2 2.6-5.9 5.9-5.9 3.2 0 5.9 2.6 5.9 5.9zm14.4-13.7c0 3.2-2.6 5.9-5.9 5.9-3.2 0-5.9-2.6-5.9-5.9 0-3.2 2.6-5.9 5.9-5.9 3.2 0 5.9 2.6 5.9 5.9zm23 0c0 3.2-2.6 5.9-5.9 5.9-3.2 0-5.9-2.6-5.9-5.9 0-3.2 2.6-5.9 5.9-5.9 3.2 0 5.9 2.6 5.9 5.9zm-12.9 46.6c0 3.2-2.6 5.9-5.9 5.9-3.2 0-5.9-2.6-5.9-5.9 0-3.2 2.6-5.9 5.9-5.9 3.2 0 5.9 2.6 5.9 5.9zm14.7-11.5c0 3.2-2.6 5.9-5.9 5.9-3.2 0-5.9-2.6-5.9-5.9 0-3.2 2.6-5.9 5.9-5.9 3.2 0 5.9 2.6 5.9 5.9zm7.4-18.3c0 3.2-2.6 5.9-5.9 5.9-3.2 0-5.9-2.6-5.9-5.9 0-3.2 2.6-5.9 5.9-5.9 3.2 0 5.9 2.6 5.9 5.9z" transform="matrix(0.59478444,0,0,0.93466127,95.788817,-7.8295466)" fill="#365798"/></svg>';

    // Mapa de contenedores según el tipo de página de Steam
    // - app: usa 'queueActionsCtn' (se clona para crear sección separada)
    // - bundle/sub: usa 'game_area_purchase_top' (se añade directamente)
    const CONTAINER_IDS = {
        app: 'queueActionsCtn',
        bundle: 'game_area_purchase_top',
        sub: 'game_area_purchase_top'
    };

    // Fuentes del nombre, en orden de preferencia: el encabezado del hub existe en
    // /app/, y el de la cabecera de página en /bundle/ y /sub/. En /app/ también hay
    // un .pageheader ("Comprar …"), por eso el del hub va primero.
    const TITLE_SELECTORS = ['#appHubAppName', '.apphub_AppName', '.pageheader'];

    // Limpieza del título del juego antes de buscarlo fuera de Steam.
    const TRADEMARK_REGEX = /[™®©]/g;
    // Prefijo que Steam pone en las cabeceras de compra y en document.title según
    // el idioma de la tienda ("Comprar Portal 2" / "Buy Portal 2").
    const TITLE_PREFIX_REGEX = /^\s*(?:comprar|compra|buy|acheter|kaufen|acquista|comprar agora|koop|köp|kup)\s+/i;
    // Sufijo que Steam añade en og:title y document.title según el idioma de la
    // tienda ("Portal 2 on Steam" / "Portal 2 en Steam").
    const STEAM_TITLE_SUFFIX = /\s+(?:on|en|sur|auf|su|em|no|op|i|na|w)\s+Steam\s*$/i;
    // Diacríticos combinados, para quitarlos tras normalizar a NFD.
    const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

    // =============================================
    // IDIOMA (solo para los tooltips)
    // =============================================
    // Steam sirve la tienda en 30 idiomas y refleja el elegido en <html lang>, así
    // que ese atributo ES la elección del usuario en el selector del pie: no hay
    // que mapear a mano los códigos raros de `l=` (schinese, brazilian, latam…).
    // Verificado pidiendo la ficha con cada parámetro:
    //   ?l=spanish -> "es"   ?l=german    -> "de"
    //   ?l=schinese -> "zh-cn"  ?l=brazilian -> "pt-br"
    // Es lo contrario de IndieGala, que fija su propio lang e ignora al usuario.
    //
    // Las claves del diccionario son códigos BCP-47 en minúsculas.
    const I18N = {
        en: {
            ggTip: 'Searches the title on GG.deals with the Steam DRM filter. Being a title search, it may not hit the exact game.',
            pcgwTip: 'Searches the title on PCGamingWiki (compatibility and fixes). Being a title search, it may not hit the exact article.'
        },
        es: {
            ggTip: 'Busca el título en GG.deals con el filtro de DRM de Steam. Al buscar por nombre, puede no dar con el juego exacto.',
            pcgwTip: 'Busca el título en PCGamingWiki (compatibilidad y arreglos). Al buscar por nombre, puede no dar con el artículo exacto.'
        },
        'es-419': {
            ggTip: 'Busca el título en GG.deals con el filtro de DRM de Steam. Al buscar por nombre, puede que no encuentre el juego exacto.',
            pcgwTip: 'Busca el título en PCGamingWiki (compatibilidad y arreglos). Al buscar por nombre, puede que no encuentre el artículo exacto.'
        },
        de: {
            ggTip: 'Sucht den Titel auf GG.deals mit dem Steam-DRM-Filter. Da es eine Titelsuche ist, wird nicht immer das exakte Spiel getroffen.',
            pcgwTip: 'Sucht den Titel auf PCGamingWiki (Kompatibilität und Fixes). Da es eine Titelsuche ist, wird nicht immer der exakte Artikel getroffen.'
        },
        fr: {
            ggTip: 'Recherche le titre sur GG.deals avec le filtre DRM Steam. S’agissant d’une recherche par titre, le jeu exact peut ne pas être trouvé.',
            pcgwTip: 'Recherche le titre sur PCGamingWiki (compatibilité et correctifs). S’agissant d’une recherche par titre, l’article exact peut ne pas être trouvé.'
        },
        it: {
            ggTip: 'Cerca il titolo su GG.deals con il filtro DRM di Steam. Trattandosi di una ricerca per titolo, potrebbe non trovare il gioco esatto.',
            pcgwTip: 'Cerca il titolo su PCGamingWiki (compatibilità e correzioni). Trattandosi di una ricerca per titolo, potrebbe non trovare la voce esatta.'
        },
        nl: {
            ggTip: 'Zoekt de titel op GG.deals met het Steam-DRM-filter. Omdat het een titelzoekopdracht is, wordt niet altijd het exacte spel gevonden.',
            pcgwTip: 'Zoekt de titel op PCGamingWiki (compatibiliteit en fixes). Omdat het een titelzoekopdracht is, wordt niet altijd het exacte artikel gevonden.'
        },
        pt: {
            ggTip: 'Procura o título no GG.deals com o filtro de DRM da Steam. Sendo uma pesquisa por título, pode não encontrar o jogo exato.',
            pcgwTip: 'Procura o título no PCGamingWiki (compatibilidade e correções). Sendo uma pesquisa por título, pode não encontrar o artigo exato.'
        },
        'pt-br': {
            ggTip: 'Busca o título no GG.deals com o filtro de DRM da Steam. Por ser uma busca por título, pode não encontrar o jogo exato.',
            pcgwTip: 'Busca o título no PCGamingWiki (compatibilidade e correções). Por ser uma busca por título, pode não encontrar o artigo exato.'
        },
        pl: {
            ggTip: 'Wyszukuje tytuł w GG.deals z filtrem DRM Steam. Ponieważ to wyszukiwanie po tytule, może nie trafić w dokładną grę.',
            pcgwTip: 'Wyszukuje tytuł w PCGamingWiki (zgodność i poprawki). Ponieważ to wyszukiwanie po tytule, może nie trafić w dokładny artykuł.'
        },
        ru: {
            ggTip: 'Ищет название на GG.deals с фильтром DRM Steam. Это поиск по названию, поэтому нужная игра может не найтись.',
            pcgwTip: 'Ищет название на PCGamingWiki (совместимость и исправления). Это поиск по названию, поэтому нужная статья может не найтись.'
        },
        uk: {
            ggTip: 'Шукає назву на GG.deals із фільтром DRM Steam. Це пошук за назвою, тож потрібна гра може не знайтися.',
            pcgwTip: 'Шукає назву на PCGamingWiki (сумісність і виправлення). Це пошук за назвою, тож потрібна стаття може не знайтися.'
        },
        cs: {
            ggTip: 'Vyhledá název na GG.deals s filtrem DRM Steam. Protože jde o vyhledávání podle názvu, nemusí najít přesnou hru.',
            pcgwTip: 'Vyhledá název na PCGamingWiki (kompatibilita a opravy). Protože jde o vyhledávání podle názvu, nemusí najít přesný článek.'
        },
        hu: {
            ggTip: 'Megkeresi a címet a GG.deals oldalon a Steam DRM-szűrőjével. Mivel cím szerinti keresés, előfordulhat, hogy nem a pontos játékot találja meg.',
            pcgwTip: 'Megkeresi a címet a PCGamingWikin (kompatibilitás és javítások). Mivel cím szerinti keresés, előfordulhat, hogy nem a pontos szócikket találja meg.'
        },
        ro: {
            ggTip: 'Caută titlul pe GG.deals cu filtrul DRM Steam. Fiind o căutare după titlu, este posibil să nu găsească jocul exact.',
            pcgwTip: 'Caută titlul pe PCGamingWiki (compatibilitate și remedieri). Fiind o căutare după titlu, este posibil să nu găsească articolul exact.'
        },
        bg: {
            ggTip: 'Търси заглавието в GG.deals с филтъра за DRM на Steam. Тъй като е търсене по заглавие, може да не намери точната игра.',
            pcgwTip: 'Търси заглавието в PCGamingWiki (съвместимост и поправки). Тъй като е търсене по заглавие, може да не намери точната статия.'
        },
        el: {
            ggTip: 'Αναζητά τον τίτλο στο GG.deals με το φίλτρο DRM του Steam. Καθώς πρόκειται για αναζήτηση με τίτλο, μπορεί να μη βρει το ακριβές παιχνίδι.',
            pcgwTip: 'Αναζητά τον τίτλο στο PCGamingWiki (συμβατότητα και διορθώσεις). Καθώς πρόκειται για αναζήτηση με τίτλο, μπορεί να μη βρει το ακριβές άρθρο.'
        },
        tr: {
            ggTip: 'Başlığı GG.deals üzerinde Steam DRM filtresiyle arar. Başlığa göre arama olduğu için tam olarak aradığınız oyunu bulamayabilir.',
            pcgwTip: 'Başlığı PCGamingWiki üzerinde arar (uyumluluk ve düzeltmeler). Başlığa göre arama olduğu için tam olarak aradığınız makaleyi bulamayabilir.'
        },
        sv: {
            ggTip: 'Söker efter titeln på GG.deals med Steams DRM-filter. Eftersom det är en titelsökning hittas inte alltid exakt rätt spel.',
            pcgwTip: 'Söker efter titeln på PCGamingWiki (kompatibilitet och fixar). Eftersom det är en titelsökning hittas inte alltid exakt rätt artikel.'
        },
        da: {
            ggTip: 'Søger efter titlen på GG.deals med Steams DRM-filter. Da det er en titelsøgning, rammer den ikke altid det præcise spil.',
            pcgwTip: 'Søger efter titlen på PCGamingWiki (kompatibilitet og rettelser). Da det er en titelsøgning, rammer den ikke altid den præcise artikel.'
        },
        no: {
            ggTip: 'Søker etter tittelen på GG.deals med Steams DRM-filter. Siden det er et tittelsøk, treffer det ikke alltid det eksakte spillet.',
            pcgwTip: 'Søker etter tittelen på PCGamingWiki (kompatibilitet og fikser). Siden det er et tittelsøk, treffer det ikke alltid den eksakte artikkelen.'
        },
        fi: {
            ggTip: 'Hakee nimen GG.deals-sivustolta Steamin DRM-suodattimella. Koska kyseessä on nimihaku, se ei aina osu täsmälleen oikeaan peliin.',
            pcgwTip: 'Hakee nimen PCGamingWikistä (yhteensopivuus ja korjaukset). Koska kyseessä on nimihaku, se ei aina osu täsmälleen oikeaan artikkeliin.'
        },
        ja: {
            ggTip: 'GG.deals で Steam の DRM フィルターを使ってタイトルを検索します。タイトル検索のため、目的のゲームに正確に一致しない場合があります。',
            pcgwTip: 'PCGamingWiki でタイトルを検索します（互換性と修正）。タイトル検索のため、目的の記事に正確に一致しない場合があります。'
        },
        ko: {
            ggTip: 'GG.deals에서 Steam DRM 필터로 제목을 검색합니다. 제목 검색이므로 정확한 게임을 찾지 못할 수 있습니다.',
            pcgwTip: 'PCGamingWiki에서 제목을 검색합니다(호환성 및 수정). 제목 검색이므로 정확한 문서를 찾지 못할 수 있습니다.'
        },
        'zh-cn': {
            ggTip: '在 GG.deals 上按 Steam DRM 筛选搜索该标题。由于是按标题搜索，可能无法精确匹配到该游戏。',
            pcgwTip: '在 PCGamingWiki 上搜索该标题（兼容性与修复）。由于是按标题搜索，可能无法精确匹配到对应条目。'
        },
        'zh-tw': {
            ggTip: '在 GG.deals 上以 Steam DRM 篩選搜尋該標題。由於是以標題搜尋，可能無法精確對應到該遊戲。',
            pcgwTip: '在 PCGamingWiki 上搜尋該標題（相容性與修正）。由於是以標題搜尋，可能無法精確對應到該條目。'
        },
        th: {
            ggTip: 'ค้นหาชื่อเกมบน GG.deals ด้วยตัวกรอง DRM ของ Steam เนื่องจากเป็นการค้นหาด้วยชื่อ จึงอาจไม่ตรงกับเกมที่ต้องการพอดี',
            pcgwTip: 'ค้นหาชื่อเกมบน PCGamingWiki (ความเข้ากันได้และการแก้ไข) เนื่องจากเป็นการค้นหาด้วยชื่อ จึงอาจไม่ตรงกับบทความที่ต้องการพอดี'
        },
        vi: {
            ggTip: 'Tìm tựa đề trên GG.deals với bộ lọc DRM của Steam. Vì là tìm theo tên, kết quả có thể không phải trò chơi chính xác.',
            pcgwTip: 'Tìm tựa đề trên PCGamingWiki (khả năng tương thích và bản sửa lỗi). Vì là tìm theo tên, kết quả có thể không phải bài viết chính xác.'
        },
        id: {
            ggTip: 'Mencari judul di GG.deals dengan filter DRM Steam. Karena ini pencarian berdasarkan judul, hasilnya mungkin bukan gim yang tepat.',
            pcgwTip: 'Mencari judul di PCGamingWiki (kompatibilitas dan perbaikan). Karena ini pencarian berdasarkan judul, hasilnya mungkin bukan artikel yang tepat.'
        },
        ms: {
            ggTip: 'Mencari tajuk di GG.deals dengan penapis DRM Steam. Oleh kerana ini carian mengikut tajuk, ia mungkin tidak menemui permainan yang tepat.',
            pcgwTip: 'Mencari tajuk di PCGamingWiki (keserasian dan pembetulan). Oleh kerana ini carian mengikut tajuk, ia mungkin tidak menemui artikel yang tepat.'
        }
    };

    // Familias donde la VARIANTE cambia el texto y no basta con el idioma base.
    // Existe para no depender de la forma exacta que escriba Steam: da igual que
    // mande 'zh-hant' o 'zh-tw', o 'es-MX' o 'es-419'; ambos caen en el mismo
    // diccionario. Lo no previsto se reduce a la base ('fr-CA' -> 'fr').
    const LANG_ALIASES = {
        'zh': 'zh-cn', 'zh-hans': 'zh-cn', 'zh-chs': 'zh-cn', 'zh-sg': 'zh-cn',
        'zh-hant': 'zh-tw', 'zh-cht': 'zh-tw', 'zh-hk': 'zh-tw', 'zh-mo': 'zh-tw',
        'pt-pt': 'pt',
        'es-la': 'es-419', 'es-mx': 'es-419', 'es-ar': 'es-419', 'es-cl': 'es-419',
        'es-co': 'es-419', 'es-pe': 'es-419', 'es-us': 'es-419',
        'nb': 'no', 'nn': 'no'
    };

    // Reduce un código BCP-47 a una clave de I18N probando de más específico a
    // menos: 'zh-Hant-TW' -> 'zh-hant' (alias) -> 'zh-tw'. Devuelve '' si no hay
    // nada, para que la cascada de detectLang() pase al siguiente paso.
    function normalizeLang(raw) {
        const code = (raw || '').trim().toLowerCase().replace(/_/g, '-');
        if (!code) return '';
        const parts = code.split('-');
        for (let n = parts.length; n >= 1; n--) {
            const candidate = parts.slice(0, n).join('-');
            if (LANG_ALIASES[candidate]) return LANG_ALIASES[candidate];
            if (I18N[candidate]) return candidate;
        }
        return '';
    }

    // Cascada, de la señal más fiel a la menos:
    //   1) <html lang>: el idioma que el usuario eligió en el selector de Steam.
    //   2) navigator.languages, por si la página no lo declarara.
    //   3) inglés.
    function detectLang() {
        const fromDoc = normalizeLang(document.documentElement.getAttribute('lang'));
        if (fromDoc) return fromDoc;
        for (const l of [navigator.language, ...(navigator.languages || [])]) {
            const n = normalizeLang(l);
            if (n) return n;
        }
        return 'en';
    }

    // Merge sobre `en`: una clave que falte en un idioma cae al inglés en vez de
    // quedar en undefined. Así se pueden añadir idiomas incompletos sin romper nada.
    const t = { ...I18N.en, ...(I18N[detectLang()] || {}) };

    // =============================================
    // FUNCIONES
    // =============================================

    /**
     * Extrae el tipo de página (app, bundle, sub) y el ID numérico
     * desde la URL actual de Steam.
     * @returns {{ type: string, id: string } | null} Objeto con tipo e ID, o null si no coincide.
     */
    function extractPageType() {
        const match = window.location.pathname.match(PATH_REGEX);
        if (!match) return null;
        return { type: match[1], id: match[2] };
    }

    /**
     * Nombre del producto (juego, bundle o paquete). Fuentes primarias: los
     * encabezados de TITLE_SELECTORS; como respaldo, og:title y document.title, a
     * los que hay que quitarles el "… on Steam". El respaldo puede traer el
     * "Save 75% on …" que Steam mete en document.title cuando hay oferta, pero solo
     * entra en juego si faltan todos los encabezados y og:title.
     * @returns {string} Título limpio, o cadena vacía si no se pudo leer.
     */
    function getGameTitle() {
        const heading = TITLE_SELECTORS
            .map((sel) => document.querySelector(sel)?.textContent)
            .find((text) => text && text.trim());
        const og = document.querySelector('meta[property="og:title"]')?.content;
        return (heading || og || document.title || '')
            .trim()
            .replace(TITLE_PREFIX_REGEX, '')
            .replace(STEAM_TITLE_SUFFIX, '')
            .replace(TRADEMARK_REGEX, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Normaliza el título para la búsqueda de GG.deals quitando los acentos:
     * GG.deals translitera en su índice, así que "Pokémon" se busca como "Pokemon".
     * @param {string} title - Título limpio del juego.
     * @returns {string} Título sin diacríticos.
     */
    function normalizeForGgDeals(title) {
        return title.normalize('NFD').replace(DIACRITICS_REGEX, '');
    }

    // =============================================
    // TOOLTIP NATIVO DE LA TIENDA
    // =============================================
    // Steam no dibuja los tooltips con el `title` del navegador: tiene el suyo, el
    // plugin v_tooltip de tooltip.js, y shared_global.js lo engancha a todo lo que
    // lleve `data-tooltip-text` (o `-html`). Poniendo ese atributo, el aviso de "esto
    // busca por nombre" sale con la caja gris de la tienda en vez de con la del
    // sistema operativo, que es la diferencia entre parecer parte de Steam y parecer
    // un añadido.
    //
    // Su BindTooltips() deja además un MutationObserver global que engancha lo que
    // aparezca después, así que en teoría bastaría el atributo. Pero engancha con
    // `$J('[data-tooltip-text]', addedNodes)`, que es un `.find()`: mira los
    // DESCENDIENTES de cada nodo añadido, no el nodo en sí. Como aquí los botones se
    // insertan de uno en uno, un atributo puesto en el <a> quedaría fuera. Por eso va
    // en el <span> interior —que sí es descendiente— y además se llama a BindTooltips
    // a mano sobre el contenedor ya montado: así el enganche no depende de un detalle
    // de su implementación.
    //
    // El `title` se pone siempre y solo se quita si el enganche se confirma. Es la
    // caída para cuando esto no exista (Steam cambia su JS, o su modo de pantalla
    // pequeña, que ignora todo lo que no lleve `data-tooltip-responsive`), y evita
    // que se vean los dos tooltips a la vez cuando sí existe.

    /**
     * Engancha el tooltip de la tienda a los botones ya insertados y retira el
     * `title` de los que hayan quedado enganchados. Silenciosa: si el sistema de
     * Steam no está, cada botón se queda con su `title` y nadie se entera.
     * @param {HTMLElement} root - Contenedor de los botones, ya en el documento.
     */
    function attachStoreTooltips(root) {
        if (typeof window.BindTooltips !== 'function' || typeof window.$J !== 'function') return;
        try {
            window.BindTooltips(root, { tooltipCSSClass: STEAM_TOOLTIP_CLASS });
        } catch (e) {
            return;  // su plugin no está o cambió: se queda el title
        }
        root.querySelectorAll('[data-tooltip-text]').forEach((el) => {
            // v_tooltip guarda sus ajustes en el elemento al engancharlo; si no están,
            // no se enganchó (modo pantalla pequeña) y el title tiene que seguir ahí.
            if (!window.$J(el).data('tooltip.settings')) return;
            const link = el.closest('a');
            if (link) link.removeAttribute('title');
        });
    }

    /**
     * Crea un botón con el estilo nativo de Steam (btn_black btn_medium) que abre
     * el destino en una pestaña nueva. Es un <a> real, así que funcionan el clic
     * central y "copiar dirección del enlace".
     * @param {{ label: string, url: string, iconSvg?: string, iconUrl?: string, tooltip?: string }} opts
     * @returns {HTMLAnchorElement} El botón listo para insertar.
     */
    function createBrandButton({ label, url, iconSvg, iconUrl, tooltip }) {
        const a = document.createElement('a');
        a.className = 'btn_black btn_medium';
        a.href = url;
        a.target = '_blank';
        a.rel = 'nofollow noopener external';
        if (tooltip) a.title = tooltip;

        const span = document.createElement('span');
        if (tooltip) span.dataset.tooltipText = tooltip;
        if (iconSvg) {
            const box = document.createElement('span');
            box.className = ICON_CLASS;
            box.innerHTML = iconSvg;
            span.appendChild(box);
        } else if (iconUrl) {
            const img = document.createElement('img');
            img.className = ICON_CLASS;
            img.src = iconUrl;
            img.alt = '';
            img.addEventListener('error', () => img.remove());  // sin icono si el CSP lo bloquea
            span.appendChild(img);
        }
        span.appendChild(document.createTextNode(label));
        a.appendChild(span);
        return a;
    }

    /**
     * Botón a la página de SteamDB del producto exacto. Se construye con el ID de
     * la URL, así que no puede fallar y no lleva tooltip.
     * @param {string} type - Tipo de página (app, bundle, sub).
     * @param {string} id - ID numérico del producto en Steam.
     * @returns {HTMLAnchorElement} El botón de SteamDB.
     */
    function createSteamDBButton(type, id) {
        return createBrandButton({
            label: 'SteamDB',
            url: `${STEAMDB_BASE_URL}${type}/${id}/`,
            iconSvg: STEAMDB_SVG
        });
    }

    /**
     * Botón a la búsqueda de GG.deals por título, filtrada al DRM de Steam.
     * @param {string} title - Título limpio del juego.
     * @returns {HTMLAnchorElement} El botón de GG.deals.
     */
    function createGgDealsButton(title) {
        const params = new URLSearchParams({
            drm: GGDEALS_STEAM_DRM,
            minRating: GGDEALS_MIN_RATING,
            title: normalizeForGgDeals(title)
        });
        return createBrandButton({
            label: 'GG.deals',
            url: `${GGDEALS_SEARCH_URL}?${params}`,
            iconUrl: GGDEALS_ICON_URL,
            tooltip: t.ggTip
        });
    }

    /**
     * Botón a la búsqueda de PCGamingWiki por título.
     * @param {string} title - Título limpio del juego.
     * @returns {HTMLAnchorElement} El botón de PCGamingWiki.
     */
    function createPcgwButton(title) {
        const params = new URLSearchParams({ search: title });
        return createBrandButton({
            label: 'PCGamingWiki',
            url: `${PCGW_SEARCH_URL}?${params}`,
            iconSvg: PCGW_ICON_SVG,
            tooltip: t.pcgwTip
        });
    }

    /**
     * Estilos propios: pone los botones en una fila, como la de Seguir/Ignorar que
     * tienen encima, y da al icono su hueco y su alineación. El espaciado vive aquí
     * (y no en el SVG) para que las tres marcas lo compartan.
     * Lleva flex-wrap para que, si las tres etiquetas no cupieran, bajen a una
     * segunda línea en vez de desbordar. Y justify-content explícito porque en /app/
     * el contenedor es un clon de queueActionsCtn: conserva sus clases, y con ellas
     * el space-between de Steam, que separaba los tres botones a los extremos.
     */
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        const style = document.createElement('style');
        style.id = STYLES_ID;
        style.textContent = `
            #${STEAMDB_BUTTON_ID} { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-start; gap: 6px; }
            #${STEAMDB_BUTTON_ID} .btn_medium { margin: 0; }
            .${ICON_CLASS} { display: inline-flex; align-items: center; margin-right: 8px; vertical-align: middle; flex: 0 0 auto; }
            img.${ICON_CLASS} { width: 16px; height: 16px; object-fit: contain; }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    /**
     * Obtiene el contenedor DOM donde debe insertarse el botón,
     * según el tipo de página de Steam.
     * @param {string} type - Tipo de página (app, bundle, sub).
     * @returns {HTMLElement|null} El contenedor encontrado o null.
     */
    function getContainer(type) {
        const containerId = CONTAINER_IDS[type];
        return containerId ? document.getElementById(containerId) : null;
    }

    /**
     * Inserta los botones en el contenedor apropiado.
     * Para páginas de tipo 'app', se clona el contenedor original para crear
     * una sección visual separada debajo. Para 'bundle' y 'sub',
     * el botón se añade directamente al contenedor existente.
     * @param {HTMLAnchorElement[]} buttons - Los botones a insertar, en orden.
     * @param {HTMLElement} container - El contenedor DOM de destino.
     * @param {string} type - Tipo de página (app, bundle, sub).
     */
    function insertButtons(buttons, container, type) {
        let box;
        if (type === 'app') {
            // Clonar contenedor para crear sección separada debajo
            box = container.cloneNode(true);
            box.id = STEAMDB_BUTTON_ID;
            box.innerHTML = '';
            box.style.paddingTop = 'unset';
            container.parentNode.insertBefore(box, container.nextSibling);
            buttons.forEach((b) => box.appendChild(b));
        } else {
            // En bundle/sub los botones van dentro de su propio bloque en vez de
            // sueltos en el contenedor: así forman su propia fila, con el mismo
            // estilo que en /app/, y no se mezclan con la caja de compra.
            box = document.createElement('div');
            box.id = STEAMDB_BUTTON_ID;
            buttons.forEach((b) => box.appendChild(b));
            container.appendChild(box);
        }
        // Con los botones ya en el documento: el tooltip de la tienda se mide al
        // mostrarlo, pero engancharlo sobre un árbol suelto sería enganchar en el aire.
        attachStoreTooltips(box);
    }

    /**
     * Punto de entrada: extrae el tipo de página, crea los botones
     * y los inserta en el contenedor correspondiente.
     */
    function init() {
        const pageInfo = extractPageType();
        if (!pageInfo) return;

        const { type, id } = pageInfo;
        const container = getContainer(type);
        if (!container) return;

        injectStyles();
        const buttons = [createSteamDBButton(type, id)];

        // GG.deals y PCGamingWiki en los tres tipos de página: GG.deals también
        // lista bundles y paquetes, así que la búsqueda por título tiene sentido
        // más allá de /app/. Si no hay título legible, quedan solo SteamDB.
        const title = getGameTitle();
        if (title) buttons.push(createGgDealsButton(title), createPcgwButton(title));

        insertButtons(buttons, container, type);
    }

    // =============================================
    // INICIALIZACIÓN
    // =============================================
    try {
        init();
    } catch (e) {
        console.error('(steam2steamdb): Error al crear los botones:', e);
    }
})();
