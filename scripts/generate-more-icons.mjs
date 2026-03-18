import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const svgDir = path.join(rootDir, 'docs', 'icons', 'svg');
const indexHtmlPath = path.join(rootDir, 'docs', 'icons', 'index.html');
const lucideIconsDir = path.join(rootDir, 'node_modules', 'lucide-static', 'icons');

async function run() {
  const existingFiles = new Set((await fs.readdir(svgDir)).map(f => f.replace('.svg', '')));
  const allLucideFiles = await fs.readdir(lucideIconsDir);
  
  const availableLucide = allLucideFiles
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''))
    .filter(name => !existingFiles.has(name));
    
  // pick exactly 300
  const chosenNames = availableLucide.slice(0, 300);
  
  if(chosenNames.length < 300) {
    console.warn(`Only found ${chosenNames.length} new icons available!`);
  }
  
  for (const name of chosenNames) {
    let content = await fs.readFile(path.join(lucideIconsDir, `${name}.svg`), 'utf-8');
    
    // Extract inner path content
    const innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    let innerContent = innerMatch ? innerMatch[1].trim() : '';
    
    // Stop interactive elements affecting hover
    innerContent = innerContent.replace(/<(path|circle|rect|line|polyline|polygon)/g, '<$1 pointer-events="none"');
    
    // Choose suitable animation
    let animation = '';
    if (name.includes('arrow') || name.includes('chevron') || name.includes('move')) {
      animation = `<animateTransform attributeName="transform" type="translate" values="0 0; 2 0; 0 0" dur="0.5s" begin="${name}-g.mouseover" />`;
    } else if (name.includes('rotate') || name.includes('sync') || name.includes('refresh') || name.includes('circle') || name.includes('sun')) {
      animation = `<animateTransform attributeName="transform" type="rotate" values="0 12 12; 90 12 12; 0 12 12" dur="0.5s" begin="${name}-g.mouseover" />`;
    } else if (name.includes('zoom') || name.includes('search') || name.includes('plus') || name.includes('maximize')) {
      animation = `<animateTransform attributeName="transform" type="scale" values="1 1; 1.2 1.2; 1 1" transform-origin="12 12" dur="0.5s" begin="${name}-g.mouseover" />`;
    } else if (name.includes('heart') || name.includes('star') || name.includes('bell')) {
      animation = `<animateTransform attributeName="transform" type="scale" values="1 1; 1.2 1.2; 1 1" transform-origin="12 12" dur="0.5s" begin="${name}-g.mouseover" />
  <animate attributeName="stroke" values="currentColor; #f59e0b; currentColor" dur="0.5s" begin="${name}-g.mouseover" />`;
    } else if (name.includes('check')) {
       animation = `<animateTransform attributeName="transform" type="scale" values="1 1; 1.2 1.2; 1 1" transform-origin="12 12" dur="0.5s" begin="${name}-g.mouseover" />
  <animate attributeName="stroke" values="currentColor; #10b981; currentColor" dur="0.5s" begin="${name}-g.mouseover" />`;
    } else if (name.includes('alert') || name.includes('x-') || name.includes('trash')) {
       animation = `<animateTransform attributeName="transform" type="scale" values="1 1; 1.2 1.2; 1 1" transform-origin="12 12" dur="0.5s" begin="${name}-g.mouseover" />
  <animate attributeName="stroke" values="currentColor; #ef4444; currentColor" dur="0.5s" begin="${name}-g.mouseover" />`;
    } else {
      animation = `<animateTransform attributeName="transform" type="scale" values="1 1; 1.1 1.1; 1 1" transform-origin="12 12" dur="0.5s" begin="${name}-g.mouseover" />`;
    }
    
    const finalSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="${name}">
<g id="${name}-g">
  <rect width="24" height="24" fill="transparent" stroke="none" pointer-events="all" />
  ${innerContent}
  ${animation}
</g>
</svg>`;
    
    await fs.writeFile(path.join(svgDir, `${name}.svg`), finalSvg, 'utf-8');
  }
  
  // Now update docs/icons/index.html
  let indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
  
  const arrayStart = indexHtml.indexOf('const iconNames = [');
  const arrayEnd = indexHtml.indexOf('];', arrayStart);
  
  if (arrayStart !== -1 && arrayEnd !== -1) {
    const existingArrayContent = indexHtml.substring(arrayStart, arrayEnd + 2);
    
    const newItems = ['        // Batch 8: New 300 Lucide Icons'];
    for(let i=0; i < chosenNames.length; i+= 10) {
      newItems.push(`        ` + chosenNames.slice(i, i+10).map(n => `'${n}'`).join(', ') + (i + 10 >= chosenNames.length ? '' : ','));
    }
    
    const insertionPoint = existingArrayContent.lastIndexOf(']');
    const modifiedArrayContent = existingArrayContent.substring(0, insertionPoint).replace(/,\s*$/, '') + `,\n` + newItems.join('\n') + `\n      ]`;
    
    indexHtml = indexHtml.slice(0, arrayStart) + modifiedArrayContent + indexHtml.slice(arrayEnd + 2);
    await fs.writeFile(indexHtmlPath, indexHtml, 'utf-8');
  } else {
      console.warn('Could not find const iconNames = [...] array in index.html to update.');
  }
  
  console.log(`Successfully generated and integrated ${chosenNames.length} new icons!`);
}

run().catch(console.error);
