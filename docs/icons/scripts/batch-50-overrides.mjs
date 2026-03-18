import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../svg');
const BACKUP_DIR = path.resolve(__dirname, '../svg_backup');
const OVERRIDES_FILE = path.resolve(__dirname, 'bespoke-overrides.json');

const BATCH_50 = [
  'chevron-down.svg', 'chevron-up.svg', 'chevron-left.svg', 'chevron-right.svg',
  'arrow-down.svg', 'arrow-up.svg', 'arrow-left.svg', 'arrow-right.svg',
  'plus.svg', 'minus.svg', 'x.svg', 'play.svg', 'pause.svg', 'square.svg', 'circle.svg',
  'triangle.svg', 'star.svg', 'info.svg', 'help-circle.svg', 'alert-circle.svg',
  'alert-triangle.svg', 'check-circle.svg', 'x-circle.svg', 'plus-circle.svg', 'minus-circle.svg',
  'more-horizontal.svg', 'more-vertical.svg', 'user-plus.svg', 'user-minus.svg', 'user-check.svg',
  'user-x.svg', 'volume-1.svg', 'volume-2.svg', 'volume-x.svg', 'wifi.svg', 'wifi-off.svg',
  'battery.svg', 'battery-charging.svg', 'bluetooth.svg', 'cast.svg', 'airplay.svg', 'monitor.svg',
  'smartphone.svg', 'tablet.svg', 'tv.svg', 'watch.svg', 'headphones.svg', 'mic.svg', 'mic-off.svg', 'video.svg'
];

async function applyBatch() {
  let overridesRaw = await fs.readFile(OVERRIDES_FILE, 'utf-8');
  let overrides = JSON.parse(overridesRaw);
  let skipList = new Set(overrides.skip);
  let newlyProcessed = 0;

  for (const filename of BATCH_50) {
    if (skipList.has(filename)) continue;
    try {
      let content = await fs.readFile(path.join(BACKUP_DIR, filename), 'utf-8');
      const iconId = filename.replace('.svg', '-g');
      
      const svgInnerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      if (!svgInnerMatch) continue;
      
      let shapes = svgInnerMatch[1].match(/<[^>]+>/g) || [];
      shapes = shapes.filter(s => !s.startsWith('</') && /\S/.test(s));
      
      let newInnerHtml = `  <rect width="24" height="24" fill="transparent" stroke="none" pointer-events="all" />\n`;

      let shapeCount = 0;
      for (let shape of shapes) {
        shapeCount++;
        shape = shape.replace(/pointer-events="[^"]*"/, '').trim();
        shape = shape.replace(/\/?\s*>$/, '').trim();
        let tag = shape.match(/^<([a-z]+)/)?.[1];
        if (!tag || tag === 'rect' && shape.includes('fill="transparent"')) continue;
        
        let smil = '';

        // RULE: MORE-* dots staggered pop
        if (filename.startsWith('more-') && tag === 'circle') {
          let cx = shape.match(/cx="([^"]*)"/)?.[1] || "12";
          let cy = shape.match(/cy="([^"]*)"/)?.[1] || "12";
          let delay = shapeCount * 0.1;
          smil = `\n    <animateTransform attributeName="transform" type="scale" values="1 1; 1.4 1.4; 1 1" transform-origin="${cx} ${cy}" dur="0.4s" begin="${iconId}.mouseover+${delay}s" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />\n`;
        }
        // RULE: PLUS / X cross rotation
        else if (filename === 'plus.svg' || filename === 'x.svg') {
          smil = `\n    <animateTransform attributeName="transform" type="rotate" values="0 12 12; 90 12 12" dur="0.5s" begin="${iconId}.mouseover" calcMode="spline" keySplines="0.4 0 0.2 1" fill="freeze" />\n`;
        }
        // RULE: Arrows and Chevrons translations
        else if (filename.startsWith('arrow-') || filename.startsWith('chevron-')) {
          let x = 0, y = 0;
          if (filename.includes('up')) y = -3;
          if (filename.includes('down')) y = 3;
          if (filename.includes('left')) x = -3;
          if (filename.includes('right')) x = 3;
          smil = `\n    <animateTransform attributeName="transform" type="translate" values="0 0; ${x} ${y}; 0 0" dur="0.4s" begin="${iconId}.mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />\n    <animate attributeName="opacity" values="1; 0.5; 1" dur="0.4s" begin="${iconId}.mouseover" />\n`;
        }
        // RULE: Open path trace drawing
        else if ((tag === 'line' || tag === 'polyline') || (tag === 'path' && !/z|Z/i.test(shape))) {
          shape += ` pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"`;
          let delay = shapeCount * 0.05;
          smil = `\n    <animate attributeName="stroke-dashoffset" values="1; 0; 0" keyTimes="0; 0.6; 1" dur="0.6s" begin="${iconId}.mouseover+${delay}s" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" fill="freeze" />\n`;
        }
        // RULE: Closed path/rect/circle bouncing
        else {
          let cx = shape.match(/cx="([^"]*)"/)?.[1] || shape.match(/x="([^"]*)"/)?.[1] || "12";
          let cy = shape.match(/cy="([^"]*)"/)?.[1] || shape.match(/y="([^"]*)"/)?.[1] || "12";
          let delay = shapeCount * 0.05;
          smil = `\n    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -2; 0 0" dur="0.4s" begin="${iconId}.mouseover+${delay}s" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />\n`;
        }

        newInnerHtml += `  <g pointer-events="none">\n    ${shape}>${smil}  </${tag}>\n  </g>\n`;
      }

      content = content.replace(/(<svg[^>]*>)([\s\S]*?)(<\/svg>)/, `$1\n<g id="${iconId}">\n${newInnerHtml}</g>\n$3`);
      await fs.writeFile(path.join(SVG_DIR, filename), content, 'utf-8');
      
      overrides.skip.push(filename);
      newlyProcessed++;
    } catch(e) {
       console.log("Error processing", filename, e.message);
    }
  }

  await fs.writeFile(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), 'utf-8');
  console.log(`Processed ${newlyProcessed} icons via targeted Batch 50!`);
}

applyBatch();
