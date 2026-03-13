import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'docs', 'browser-compat-data.js');
const require = createRequire(import.meta.url);
const unpackFeature = require('caniuse-lite/dist/unpacker/feature.js');
const caniusePkg = require('caniuse-lite/package.json');

const BROWSERS = [
  { id: 'chrome', label: 'Chrome' },
  { id: 'edge', label: 'Edge' },
  { id: 'firefox', label: 'Firefox' },
  { id: 'safari', label: 'Safari' },
];

const COMPONENT_FEATURES = {
  modal: [
    {
      label: '<dialog> element',
      caniuseId: 'dialog',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dialog',
      note: 'Native modal and non-modal dialog support.',
    },
    {
      label: 'command + commandfor',
      manual: { chrome: '135+', edge: '135+', firefox: '144+', safari: '26.2+' },
      mdnUrl: 'https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/button',
      note: 'Declarative dialog invocation is newer than the dialog element itself.',
    },
  ],
  accordion: [
    {
      label: '<details> and <summary>',
      caniuseId: 'details',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/details',
      note: 'Native disclosure support for the component structure.',
    },
    {
      label: 'details[name]',
      manual: { chrome: '120+', edge: '120+', firefox: '130+', safari: '17.2+' },
      mdnUrl: 'https://developer.mozilla.org/docs/Web/API/HTMLDetailsElement/name',
      note: 'Enables exclusive accordion groups without JavaScript.',
    },
  ],
  dropdown: [
    {
      label: 'Popover API',
      manual: { chrome: '114+', edge: '114+', firefox: '125+', safari: '17+' },
      mdnUrl: 'https://developer.mozilla.org/docs/Web/API/Popover_API',
      note: 'Baseline 2025 feature for native, non-modal popup surfaces.',
    },
    {
      label: 'CSS anchor positioning',
      caniuseId: 'css-anchor-positioning',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/position-anchor',
      note: 'Used as a progressive enhancement for precise trigger-relative placement.',
    },
  ],
  tooltip: [
    {
      label: 'Popover API',
      manual: { chrome: '114+', edge: '114+', firefox: '125+', safari: '17+' },
      mdnUrl: 'https://developer.mozilla.org/docs/Web/API/Popover_API',
      note: 'Provides the declarative tooltip surface and toggle behavior.',
    },
    {
      label: 'CSS anchor positioning',
      caniuseId: 'css-anchor-positioning',
      mdnUrl: 'https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/position-anchor',
      note: 'Improves placement in newer engines while older browsers use a fallback.',
    },
    {
      label: 'interestfor',
      manual: { chrome: '142+', edge: '142+', firefox: 'No', safari: 'No' },
      mdnUrl: 'https://developer.mozilla.org/docs/Web/API/Popover_API',
      note: 'Hover and focus tooltip invocation remains too new for the current support target.',
    },
  ],
  form: [
    {
      label: 'Constraint validation',
      caniuseId: 'constraint-validation',
      mdnUrl: 'https://developer.mozilla.org/docs/Learn_web_development/Extensions/Forms/Form_validation',
      note: 'Covers built-in validation UI and submit blocking for native form controls.',
    },
  ],
};

function loadFeature(caniuseId) {
  return unpackFeature(require(`caniuse-lite/data/features/${caniuseId}.js`));
}

function normalizeVersion(version) {
  if (version == null) return null;

  return String(version)
    .replace(/^≤\s*/, '')
    .replace(/^TP$/i, 'TP')
    .trim();
}

function compareVersions(left, right) {
  if (left === 'TP') return 1;
  if (right === 'TP') return -1;

  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] || 0;
    const rightValue = rightParts[index] || 0;
    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

function getBrowserSupportLabel(featureStats, browserId) {
  const stats = featureStats[browserId] || {};
  const supportedVersions = Object.entries(stats)
    .filter(([, support]) => /(^|\s)(y|a|x)(\s|$)/.test(support))
    .map(([version]) => normalizeVersion(version))
    .filter(Boolean)
    .sort(compareVersions);

  const firstSupported = supportedVersions[0];
  return firstSupported ? `${firstSupported}+` : 'No';
}

function buildRow(featureDef) {
  if (featureDef.manual) {
    return {
      feature: featureDef.label,
      mdnUrl: featureDef.mdnUrl || '',
      browsers: featureDef.manual,
      note: featureDef.note || '',
    };
  }

  const compat = loadFeature(featureDef.caniuseId);
  const browsers = {};

  for (const browser of BROWSERS) {
    browsers[browser.id] = getBrowserSupportLabel(compat.stats, browser.id);
  }

  return {
    feature: featureDef.label,
    mdnUrl: featureDef.mdnUrl || '',
    browsers,
    note: featureDef.note || '',
  };
}

const payload = {
  generatedAt: new Date().toISOString(),
  sourceVersion: caniusePkg.version,
  sourceName: 'caniuse-lite',
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

console.log(`Generated ${path.relative(rootDir, outputPath)} from Can I Use ${caniusePkg.version}`);