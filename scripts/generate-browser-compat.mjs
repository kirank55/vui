import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcd from '@mdn/browser-compat-data/forLegacyNode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'docs', 'browser-compat-data.js');

const BROWSERS = [
  { id: 'chrome', label: 'Chrome' },
  { id: 'edge', label: 'Edge' },
  { id: 'firefox', label: 'Firefox' },
  { id: 'safari', label: 'Safari' },
];

const COMPONENT_FEATURES = {
  modal: [
    { label: '<dialog> element', path: ['html', 'elements', 'dialog'] },
  ],
  accordion: [
    { label: '<details> element', path: ['html', 'elements', 'details'] },
    { label: '<summary> element', path: ['html', 'elements', 'summary'] },
    { label: 'details[name]', path: ['api', 'HTMLDetailsElement', 'name'] },
  ],
  dropdown: [
    { label: 'popover', path: ['api', 'HTMLElement', 'popover'] },
    { label: 'popovertarget', path: ['api', 'HTMLButtonElement', 'popoverTargetElement'] },
  ],
  tooltip: [
    { label: 'popover', path: ['api', 'HTMLElement', 'popover'] },
    { label: 'popovertargetaction', path: ['api', 'HTMLButtonElement', 'popoverTargetAction'] },
    { label: 'anchor-name', path: ['css', 'properties', 'anchor-name'] },
    { label: 'position-anchor', path: ['css', 'properties', 'position-anchor'] },
  ],
  form: [
    { label: ':user-invalid', path: ['css', 'selectors', 'user-invalid'] },
  ],
};

function getFeatureCompat(pathParts) {
  const feature = pathParts.reduce((current, part) => current?.[part], bcd);
  return feature?.__compat ?? null;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<code>/g, '`')
    .replace(/<\/code>/g, '`')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeStatement(statement) {
  if (statement === false) {
    return { label: 'No', note: '' };
  }

  if (statement === true) {
    return { label: 'Yes', note: '' };
  }

  if (!statement || statement.version_added === false) {
    return { label: 'No', note: '' };
  }

  let label;
  if (statement.version_added === true) {
    label = 'Yes';
  } else if (statement.version_last && statement.version_removed) {
    label = `${statement.version_added}-${statement.version_last}`;
  } else {
    label = `${statement.version_added}+`;
  }

  if (statement.prefix) {
    label += ' prefixed';
  }
  if (statement.partial_implementation) {
    label += ' partial';
  }
  if (statement.flags?.length) {
    label += ' flagged';
  }

  return {
    label,
    note: stripHtml(statement.notes),
  };
}

function formatBrowserSupport(rawSupport) {
  if (Array.isArray(rawSupport)) {
    const parts = rawSupport.map(normalizeStatement).filter((entry) => entry.label);
    return {
      label: parts.map((entry) => entry.label).join(' / ') || 'No',
      note: parts.map((entry) => entry.note).filter(Boolean).join(' '),
    };
  }

  return normalizeStatement(rawSupport);
}

function buildRow(featureDef) {
  const compat = getFeatureCompat(featureDef.path);
  if (!compat) {
    throw new Error(`Missing MDN compat data for ${featureDef.path.join('.')}`);
  }

  const browsers = {};
  const browserNotes = [];

  for (const browser of BROWSERS) {
    const formatted = formatBrowserSupport(compat.support[browser.id]);
    browsers[browser.id] = formatted.label;
    if (formatted.note) {
      browserNotes.push(`${browser.label}: ${formatted.note}`);
    }
  }

  return {
    feature: featureDef.label,
    mdnUrl: compat.mdn_url || '',
    browsers,
    note: browserNotes.join(' '),
  };
}

const payload = {
  generatedAt: new Date().toISOString(),
  sourceVersion: bcd.__meta.version,
  components: Object.fromEntries(
    Object.entries(COMPONENT_FEATURES).map(([component, features]) => [
      component,
      { rows: features.map(buildRow) },
    ]),
  ),
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `window.VUI_BROWSER_COMPAT = ${JSON.stringify(payload, null, 2)};\n`,
  'utf8',
);

console.log(`Generated ${path.relative(rootDir, outputPath)} from MDN BCD ${bcd.__meta.version}`);