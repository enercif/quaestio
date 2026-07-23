
            import * as _w_c_0_0_ from './main.0.de.compiled.js'
import * as _w_c_0_1_ from './main.0.en.compiled.js'
            /** @typedef {import("wuchale/runtime").CatalogModule} CatalogMod */
            /** @type {{[locale: string]: CatalogMod[]}} */
            const catalogs = {de: [_w_c_0_0_],en: [_w_c_0_1_]}
            export const loadCatalog = (/** @type {number} */ loadID, /** @type {string} */ locale) => {
                return /** @type {CatalogMod} */ (/** @type {CatalogMod[]} */ (catalogs[locale])[loadID])
            }
            export const loadCount = 1
            // not essential. in case it is needed and for debugging
            export const patterns = ["js"]
        