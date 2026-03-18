import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../svg');

async function fixDashOffsets() {
  const files = await fs.readdir(SVG_DIR);
  let fixedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.svg')) continue;

    const filePath = path.join(SVG_DIR, file);
    let content = await fs.readFile(filePath, 'utf-8');

    // ONLY replace stroke-dashoffset="1" if it's an attribute on an actual shape (line, polyline, path)
    // We check for pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"
    if (content.includes('stroke-dashoffset="1"')) {
      const original = content;
      // Replace the static attribute on the shapes
      content = content.replace(/stroke-dashoffset="1"/g, 'stroke-dashoffset="0"');
      
      // But KEEP it as "1; 0; 0" or "1; 0" inside the animate tag's values attribute!
      // Wait, the previous replace changed the <animate> NO wait, the animate tag is:
      // <animate attributeName="stroke-dashoffset" values="1; 0; 0" ... /> -> it does not have stroke-dashoffset="1"!
      // It has values="1; 0; 0". So the regex /stroke-dashoffset="1"/g will ONLY match the static attribute.
      
      if (original !== content) {
        await fs.writeFile(filePath, content, 'utf-8');
        fixedCount++;
      }
    }
  }

  console.log(`Successfully fixed static visibility on ${fixedCount} SVGs!`);
}

fixDashOffsets().catch(console.error);
