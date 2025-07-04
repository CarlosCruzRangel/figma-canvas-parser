"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// code.ts
figma.showUI(__html__, { width: 400, height: 280 });
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'export-dataset') {
        const nodes = figma.currentPage.findAll();
        const dataset = nodes.map(node => extractNodeData(node)).filter(Boolean);
        const jsonStr = JSON.stringify(dataset, null, 2);
        const csvStr = convertToCSV(dataset);
        figma.ui.postMessage({ type: 'dataset-ready', jsonStr, csvStr });
    }
});
function extractNodeData(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    try {
        const base = {
            id: node.id,
            name: node.name,
            type: node.type,
            parent: ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.id) || null,
            x: (_b = node.x) !== null && _b !== void 0 ? _b : null,
            y: (_c = node.y) !== null && _c !== void 0 ? _c : null,
            width: (_d = node.width) !== null && _d !== void 0 ? _d : null,
            height: (_e = node.height) !== null && _e !== void 0 ? _e : null,
            visible: node.visible,
            opacity: 'opacity' in node ? node.opacity : null,
            rotation: (_f = node.rotation) !== null && _f !== void 0 ? _f : 0,
        };
        if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
            const fill = node.fills[0];
            if (fill.type === "SOLID") {
                const { r, g, b } = fill.color;
                base.fillColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${(_g = fill.opacity) !== null && _g !== void 0 ? _g : 1})`;
            }
        }
        if ("strokes" in node && node.strokes && node.strokes.length > 0) {
            const stroke = node.strokes[0];
            if (stroke.type === "SOLID") {
                const { r, g, b } = stroke.color;
                base.strokeColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${(_h = stroke.opacity) !== null && _h !== void 0 ? _h : 1})`;
            }
            base.strokeWeight = (_j = node.strokeWeight) !== null && _j !== void 0 ? _j : null;
        }
        if ("effects" in node && node.effects.length > 0) {
            base.effects = node.effects.map(e => e.type);
        }
        if ("layoutMode" in node) {
            base.layoutMode = node.layoutMode;
            base.itemSpacing = (_k = node.itemSpacing) !== null && _k !== void 0 ? _k : null;
            base.paddingTop = (_l = node.paddingTop) !== null && _l !== void 0 ? _l : null;
            base.paddingBottom = (_m = node.paddingBottom) !== null && _m !== void 0 ? _m : null;
            base.paddingLeft = (_o = node.paddingLeft) !== null && _o !== void 0 ? _o : null;
            base.paddingRight = (_p = node.paddingRight) !== null && _p !== void 0 ? _p : null;
        }
        if ("constraints" in node) {
            base.constraints = node.constraints;
        }
        if (node.type === "TEXT") {
            const textNode = node;
            base.fontName = typeof textNode.fontName === "object" ? `${textNode.fontName.family} ${textNode.fontName.style}` : null;
            base.characters = textNode.characters;
        }
        if ("mainComponent" in node) {
            base.isComponentInstance = !!node.mainComponent;
        }
        return base;
    }
    catch (e) {
        console.error("Error extracting node", node, e);
        return null;
    }
}
function convertToCSV(data) {
    if (data.length === 0)
        return "";
    const headers = Object.keys(data[0]);
    const csvRows = data.map(row => headers.map(h => { var _a; return JSON.stringify((_a = row[h]) !== null && _a !== void 0 ? _a : ""); }).join(","));
    return [headers.join(","), ...csvRows].join("\n");
}
