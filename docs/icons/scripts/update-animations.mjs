import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../svg');

const ARCHETYPES = {
  ELASTIC_DRAW: 'elastic_draw',
  ROTATE: 'rotate',
  SLIDE: 'slide',
  PULSE: 'pulse',
  PEEK: 'peek',
  WIGGLE: 'wiggle',
  EXPAND: 'expand',
  SQUASH: 'squash',
  FLOAT: 'float',
  BLOOM: 'bloom',
  DEFAULT: 'default'
};

function getArchetype(filename) {
  const name = filename.replace('.svg', '');
  
  if (/^(check|x|plus|minus)$|-(check|x|plus|minus)$/.test(name)) return ARCHETYPES.ELASTIC_DRAW;
  if (/settings|refresh|sun|compass|loader|pie-chart|aperture|cog|rotate|fan/.test(name)) return ARCHETYPES.ROTATE;
  if (/arrow|chevron|corner|log-in|log-out|download|upload/.test(name)) return ARCHETYPES.SLIDE;
  if (/heart|star|bell(?!-ring)|alert|shield|badge|info|thumbs-up|award|circle|hexagon|octagon|square|triangle/.test(name)) return ARCHETYPES.PULSE;
  if (/folder|mail|inbox|archive|package|book/.test(name)) return ARCHETYPES.PEEK;
  if (/zap|phone|smartphone|radio|alarm|bell-ring/.test(name)) return ARCHETYPES.WIGGLE;
  if (/maximize|minimize|grid|layout|columns|sidebar|layers/.test(name)) return ARCHETYPES.EXPAND;
  if (/play|pause|stop|menu|toggle|mic|video|camera|speaker|volume/.test(name)) return ARCHETYPES.SQUASH;
  if (/cloud|wind|anchor|balloon|snowflake|umbrella|droplet/.test(name)) return ARCHETYPES.FLOAT;
  if (/bold|italic|underline|type|edit|pen|scissors|crop|align-/.test(name)) return ARCHETYPES.BLOOM;
  
  return ARCHETYPES.DEFAULT;
}

function getSmilForArchetype(archetype, innerMarkup) {
  // We wrap the paths in a group and apply standard SMIL hover states
  switch (archetype) {
    case ARCHETYPES.ELASTIC_DRAW:
      return `<g stroke-dasharray="100" stroke-dashoffset="0">
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animate attributeName="stroke-dashoffset" values="50; -20; 0" dur="0.6s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" keyTimes="0; 0.5; 1" fill="remove" />
</g>`;

    case ARCHETYPES.ROTATE:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="rotate" values="0 12 12; 180 12 12; 0 12 12" keyTimes="0; 0.5; 1" dur="0.8s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" fill="freeze" />
</g>`;

    case ARCHETYPES.SLIDE:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 4 0; 0 0; 2 0; 0 0" keyTimes="0; 0.3; 0.6; 0.8; 1" dur="0.6s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" fill="freeze" />
</g>`;

    case ARCHETYPES.PULSE:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="scale" values="1; 1.2; 0.9; 1.05; 1" keyTimes="0; 0.3; 0.6; 0.8; 1" dur="0.6s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" transform-origin="center" fill="freeze" />
</g>`;

    case ARCHETYPES.PEEK:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" keyTimes="0; 0.5; 1" dur="0.5s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" fill="freeze" />
</g>`;

    case ARCHETYPES.WIGGLE:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="rotate" values="0 12 12; -15 12 12; 15 12 12; -10 12 12; 10 12 12; 0 12 12" keyTimes="0; 0.2; 0.4; 0.6; 0.8; 1" dur="0.5s" begin="mouseover" fill="freeze" />
</g>`;

    case ARCHETYPES.EXPAND:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="scale" values="1; 1.1; 1" keyTimes="0; 0.5; 1" dur="0.5s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" transform-origin="center" fill="freeze" />
</g>`;

    case ARCHETYPES.SQUASH:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="scale" values="1 1; 1.15 0.8; 0.8 1.15; 1.05 0.95; 1 1" keyTimes="0; 0.3; 0.6; 0.8; 1" dur="0.6s" begin="mouseover" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" transform-origin="center" fill="freeze" />
</g>`;

    case ARCHETYPES.FLOAT:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" keyTimes="0; 0.5; 1" dur="1.5s" begin="mouseover" calcMode="ease-in-out" fill="freeze" />
</g>`;

    case ARCHETYPES.BLOOM:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animate attributeName="stroke-width" values="2; 3; 2" dur="0.4s" begin="mouseover" fill="freeze" />
</g>`;

    case ARCHETYPES.DEFAULT:
      return `<g>
    <rect width="24" height="24" fill="transparent" stroke="none" />
    <g pointer-events="none">
        ${innerMarkup}
    </g>
    <animate attributeName="opacity" values="1; 0.6; 1" dur="0.4s" begin="mouseover" fill="freeze" />
</g>`;
  }
}

async function processSVGs() {
  const files = await fs.readdir(SVG_DIR);
  const svgFiles = files.filter(f => f.endsWith('.svg'));
  
  let processedCount = 0;

  for (const file of svgFiles) {
    const filePath = path.join(SVG_DIR, file);
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Parse the inner graphics (ignoring the root <svg>, the container <g>, the transparent rect, and animate tags)
    // First, let's strictly extract all actual path/shape data.
    // It's safer to extract <path>, <circle>, <rect> (not 24x24), <line>, <polyline>, <polygon>
    
    // Quick regex to extract shape tags. 
    // Wait, the safest way is to grab the inside of the <svg> tag, remove `<animate...>`, `<rect width="24"...>`, `<g...>` and `</g>` wrappers.
    
    const svgInnerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (!svgInnerMatch) continue;
    
    let innerHtml = svgInnerMatch[1];
    
    // Remove wrapper <g> and </g>
    innerHtml = innerHtml.replace(/<g[^>]*>/g, '').replace(/<\/g>/g, '');
    
    // Remove <animate> and <animateTransform>
    innerHtml = innerHtml.replace(/<animate[^>]*\/>/g, '').replace(/<animateTransform[^>]*\/>/g, '');
    innerHtml = innerHtml.replace(/<animate[^>]*>[\s\S]*?<\/animate>/g, '');
    
    // Remove the 24x24 rect
    innerHtml = innerHtml.replace(/<rect\s+width="24"\s+height="24"[^>]*\/>/g, '');
    
    // Clean up empty lines
    innerHtml = innerHtml.split('\\n').map(l => l.trim()).filter(l => l).join('\\n        ');
    
    const archetype = getArchetype(file);
    const newInnerHtml = getSmilForArchetype(archetype, innerHtml);
    
    // Reconstruct the SVG
    content = content.replace(/(<svg[^>]*>)([\s\S]*?)(<\/svg>)/, `$1\n$2$3`);
    // Need to handle aria-label to make sure attributes are untouched in <svg>
    const rootMatch = content.match(/<svg[^>]*>/);
    const newSvg = `${rootMatch[0]}\n${newInnerHtml}\n</svg>`;
    
    await fs.writeFile(filePath, newSvg, 'utf-8');
    processedCount++;
  }
  
  console.log(`Successfully processed ${processedCount} SVGs.`);
}

processSVGs().catch(console.error);
