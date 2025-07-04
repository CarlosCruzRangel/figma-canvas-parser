// code.ts
figma.showUI(__html__, { width: 400, height: 280 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-dataset') {
    const nodes = figma.currentPage.findAll();
    const dataset = nodes.map(node => extractNodeData(node)).filter(Boolean);

    const jsonStr = JSON.stringify(dataset, null, 2);
    const csvStr = convertToCSV(dataset);

    figma.ui.postMessage({ type: 'dataset-ready', jsonStr, csvStr });
  }
};

function extractNodeData(node: SceneNode): any | null {
  try {
    const base: any = {
      id: node.id,
      name: node.name,
      type: node.type,
      parent: node.parent?.id || null,
      x: (node as LayoutMixin).x ?? null,
      y: (node as LayoutMixin).y ?? null,
      width: (node as LayoutMixin).width ?? null,
      height: (node as LayoutMixin).height ?? null,
      visible: node.visible,
      opacity: 'opacity' in node ? node.opacity : null,
      rotation: (node as LayoutMixin).rotation ?? 0,
    };

    if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0] as Paint;
      if (fill.type === "SOLID") {
        const { r, g, b } = fill.color;
        base.fillColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${fill.opacity ?? 1})`;
      }
    }

    if ("strokes" in node && node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.type === "SOLID") {
        const { r, g, b } = stroke.color;
        base.strokeColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${stroke.opacity ?? 1})`;
      }
      base.strokeWeight = (node as GeometryMixin).strokeWeight ?? null;
    }

    if ("effects" in node && node.effects.length > 0) {
      base.effects = node.effects.map(e => e.type);
    }

    if ("layoutMode" in node) {
      base.layoutMode = node.layoutMode;
      base.itemSpacing = (node as FrameNode).itemSpacing ?? null;
      base.paddingTop = (node as FrameNode).paddingTop ?? null;
      base.paddingBottom = (node as FrameNode).paddingBottom ?? null;
      base.paddingLeft = (node as FrameNode).paddingLeft ?? null;
      base.paddingRight = (node as FrameNode).paddingRight ?? null;
    }

    if ("constraints" in node) {
      base.constraints = node.constraints;
    }

    if (node.type === "TEXT") {
      const textNode = node as TextNode;
      base.fontName = typeof textNode.fontName === "object" ? `${textNode.fontName.family} ${textNode.fontName.style}` : null;
      base.characters = textNode.characters;
    }

    if ("mainComponent" in node) {
      base.isComponentInstance = !!node.mainComponent;
    }

    return base;
  } catch (e) {
    console.error("Error extracting node", node, e);
    return null;
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = data.map(row =>
    headers.map(h => JSON.stringify(row[h] ?? "")).join(",")
  );
  return [headers.join(","), ...csvRows].join("\n");
}
