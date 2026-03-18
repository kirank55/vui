import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../svg');
const OVERRIDES_FILE = path.resolve(__dirname, 'bespoke-overrides.json');

async function processSVGs() {
  const overridesRaw = await fs.readFile(OVERRIDES_FILE, 'utf-8');
  const overrides = JSON.parse(overridesRaw);
  const skipList = new Set(overrides.skip);

  const files = await fs.readdir(SVG_DIR);
  const svgFiles = files.filter(f => f.endsWith('.svg'));
  
  let processedCount = 0;

  for (const file of svgFiles) {
    if (skipList.has(file)) continue;

    const filePath = path.join(SVG_DIR, file);
    let content = await fs.readFile(filePath, 'utf-8');
    
    const svgInnerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (!svgInnerMatch) continue;
    
    let innerHtml = svgInnerMatch[1];
    
    // Clean out old wrappers and animate tags
    innerHtml = innerHtml.replace(/<g[^>]*>/g, '').replace(/<\/g>/g, '');
    innerHtml = innerHtml.replace(/<animate[^>]*\/>/g, '').replace(/<animateTransform[^>]*\/>/g, '');
    innerHtml = innerHtml.replace(/<animate[^>]*>[\s\S]*?<\/animate>/g, '');
    innerHtml = innerHtml.replace(/<rect\s+width="24"\s+height="24"[^>]*\/>/g, '');
    
    // Split into individual shapes
    let shapes = innerHtml.match(/<[^>]+>/g) || [];
    shapes = shapes.filter(s => !s.startsWith('</') && /\S/.test(s));

    const iconId = file.replace('.svg', '-g');
    let newInnerHtml = `  <rect width="24" height="24" fill="transparent" stroke="none" pointer-events="all" />\n`;

    // Process each shape based on its geometry
    for (let shape of shapes) {
      // Remove any existing pointer-events or self-closing tags safely
      shape = shape.replace(/pointer-events="[^"]*"/, '').trim();
      shape = shape.replace(/\/?\s*>$/, '').trim();
      
      let tagMatch = shape.match(/^<([a-z]+)/);
      if (!tagMatch) continue;
      let tag = tagMatch[1];

      let smil = '';

      if (tag === 'line' || tag === 'polyline') {
        // Enforce path drawing
        shape = shape.replace(/pathLength="[^"]*"/, '').replace(/stroke-dasharray="[^"]*"/, '').replace(/stroke-dashoffset="[^"]*"/, '');
        shape += ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"`;
        smil = `\n    <animate attributeName="stroke-dashoffset" values="1; 0; 0" keyTimes="0; 0.6; 1" dur="0.6s" begin="${iconId}.mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" fill="freeze" />\n`;
      } 
      else if (tag === 'circle') {
        // Enforce localized scale bounce centered precisely on the circle
        let cx = shape.match(/cx="([^"]*)"/)?.[1] || "12";
        let cy = shape.match(/cy="([^"]*)"/)?.[1] || "12";
        smil = `\n    <animateTransform attributeName="transform" type="scale" values="1 1; 1.15 1.15; 1 1" transform-origin="${cx} ${cy}" dur="0.5s" begin="${iconId}.mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />\n`;
      }
      else if (tag === 'path') {
        // If it's a path, calculate a subtle global slide-up or scale
        smil = `\n    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -1; 0 0" dur="0.4s" begin="${iconId}.mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />\n`;
      }
      else {
        // Polygons, etc.
        smil = `\n    <animate attributeName="opacity" values="1; 0.7; 1" dur="0.4s" begin="${iconId}.mouseover" />\n`;
      }

      newInnerHtml += `  <g pointer-events="none">\n    ${shape}>${smil}  </${tag}>\n  </g>\n`;
    }

    // Reconstruct the SVG wrapped in a trigger group
    content = content.replace(/(<svg[^>]*>)([\s\S]*?)(<\/svg>)/, `$1\n<g id="${iconId}">\n${newInnerHtml}</g>\n$3`);
    
    await fs.writeFile(filePath, content, 'utf-8');
    processedCount++;
  }
  
  console.log(`Successfully compiled bespoke geometry SMIL for ${processedCount} SVGs. (Skipped ${skipList.size} manual files)`);
}

processSVGs().catch(console.error);
