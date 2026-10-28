/**
 * Konverterer amerikansk-engelsk staving til britisk-engelsk (UK / British English).
 * Bevarer alltid opprinnelig formatering og store/små bokstaver:
 * - color -> colour, Color -> Colour, COLOR -> COLOUR
 * - center -> centre, Center -> Centre
 * - organize -> organise, organization -> organisation
 * - analyze -> analyse
 * - modeling -> modelling
 * - gray -> grey
 */

function matchCase(source: string, target: string): string {
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source.charAt(0) === source.charAt(0).toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target.toLowerCase();
}

// Ordpar der hele ordet byttes ut (rot + bøyninger)
const EXACT_WORDS: Record<string, string> = {
  // -or -> -our
  color: 'colour',
  colors: 'colours',
  colored: 'coloured',
  coloring: 'colouring',
  colorful: 'colourful',
  colorless: 'colourless',
  favor: 'favour',
  favors: 'favours',
  favored: 'favoured',
  favoring: 'favouring',
  favorite: 'favourite',
  favorites: 'favourites',
  favorable: 'favourable',
  flavor: 'flavour',
  flavors: 'flavours',
  flavored: 'flavoured',
  flavoring: 'flavouring',
  honor: 'honour',
  honors: 'honours',
  honored: 'honoured',
  honoring: 'honouring',
  honorable: 'honourable',
  humor: 'humour',
  humors: 'humours',
  labor: 'labour',
  labors: 'labours',
  labored: 'laboured',
  laborer: 'labourer',
  laborers: 'labourers',
  neighbor: 'neighbour',
  neighbors: 'neighbours',
  neighboring: 'neighbouring',
  neighborhood: 'neighbourhood',
  neighborhoods: 'neighbourhoods',
  neighborly: 'neighbourly',
  odor: 'odour',
  odors: 'odours',
  rumor: 'rumour',
  rumors: 'rumours',
  splendor: 'splendour',
  vigor: 'vigour',
  behavior: 'behaviour',
  behaviors: 'behaviours',
  behavioral: 'behavioural',
  harbor: 'harbour',
  harbors: 'harbours',
  harbored: 'harboured',
  parlor: 'parlour',
  parlors: 'parlours',
  candor: 'candour',
  clamor: 'clamour',
  demeanor: 'demeanour',
  endeavor: 'endeavour',
  endeavors: 'endeavours',
  fervor: 'fervour',
  glamor: 'glamour',
  rancor: 'rancour',
  rigor: 'rigour',
  savior: 'saviour',
  saviors: 'saviours',
  valour: 'valour',
  vapor: 'vapour',
  vapors: 'vapours',

  // -er -> -re
  center: 'centre',
  centers: 'centres',
  centered: 'centred',
  centering: 'centring',
  centermost: 'centremost',
  theater: 'theatre',
  theaters: 'theatres',
  meter: 'metre',
  meters: 'metres',
  millimeter: 'millimetre',
  millimeters: 'millimetres',
  centimeter: 'centimetre',
  centimeters: 'centimetres',
  kilometer: 'kilometre',
  kilometers: 'kilometres',
  fiber: 'fibre',
  fibers: 'fibres',
  caliber: 'calibre',
  luster: 'lustre',
  somber: 'sombre',
  specter: 'spectre',
  specters: 'spectres',
  sepulcher: 'sepulchre',
  meager: 'meagre',
  saber: 'sabre',

  // -og -> -ogue
  catalog: 'catalogue',
  catalogs: 'catalogues',
  cataloged: 'catalogued',
  cataloging: 'cataloguing',
  dialog: 'dialogue',
  dialogs: 'dialogues',
  analog: 'analogue',
  analogs: 'analogues',
  monolog: 'monologue',
  prolog: 'prologue',

  // Dobbel l i bøyninger
  traveler: 'traveller',
  travelers: 'travellers',
  traveled: 'travelled',
  traveling: 'travelling',
  modeler: 'modeller',
  modelers: 'modellers',
  modeled: 'modelled',
  modeling: 'modelling',
  canceled: 'cancelled',
  canceling: 'cancelling',
  labeled: 'labelled',
  labeling: 'labelling',
  leveled: 'levelled',
  leveling: 'levelling',
  signaled: 'signalled',
  signaling: 'signalling',
  marshaled: 'marshalled',
  marshaling: 'marshalling',
  counseled: 'counselled',
  counseling: 'counselling',
  counselor: 'counsellor',
  counselors: 'counsellors',
  dialed: 'dialled',
  dialing: 'dialling',
  fueled: 'fuelled',
  fueling: 'fuelling',
  kidnaped: 'kidnapped',
  kidnaping: 'kidnapping',
  quarreled: 'quarrelled',
  quarreling: 'quarrelling',

  // Andre vanlige ord
  gray: 'grey',
  grays: 'greys',
  grayish: 'greyish',
  defense: 'defence',
  defenses: 'defences',
  defenseless: 'defenceless',
  offense: 'offence',
  offenses: 'offences',
  pretense: 'pretence',
  pretenses: 'pretences',
  aluminum: 'aluminium',
  cozy: 'cosy',
  cozier: 'cosier',
  coziest: 'cosiest',
  cozily: 'cosily',
  coziness: 'cosiness',
  curb: 'kerb', // fortauskant
  curbs: 'kerbs',
  fulfill: 'fulfil',
  fulfills: 'fulfils',
  fulfillment: 'fulfilment',
  skillful: 'skilful',
  skillfully: 'skilfully',
  whiskey: 'whisky',
  woolen: 'woollen',
  wooly: 'woolly',
  plow: 'plough',
  plows: 'ploughs',
  draft: 'draught', // trekk (luft) / fatøl
  drafts: 'draughts',
  aging: 'ageing',
  judgement: 'judgment',
  artifact: 'artefact',
  artifacts: 'artefacts',
};

// Prefikser eller mønstre som ikke skal erstattes
// E.g. "size", "prize", "capsize", "seize" må ikke bli "sise", "prise"
const IZE_EXCLUSIONS = new Set([
  'size', 'sizes', 'sized', 'sizing',
  'prize', 'prizes', 'prized', 'prizing',
  'seize', 'seizes', 'seized', 'seizing',
  'capsize', 'capsizes', 'capsized', 'capsizing',
  'assize', 'assizes',
  'maize',
  'graze', 'grazes', 'grazed', 'grazing',
  'braze', 'brazes', 'brazed', 'brazing',
  'glaze', 'glazes', 'glazed', 'glazing',
  'blaze', 'blazes', 'blazed', 'blazing',
  'craze', 'crazes', 'crazed', 'crazing',
  'daze', 'dazes', 'dazed', 'dazing',
  'gaze', 'gazes', 'gazed', 'gazing',
  'haze', 'hazes', 'hazed', 'hazing',
  'maze', 'mazes',
  'phase', 'phases',
  'raze', 'razes', 'razed', 'razing',
]);

/**
 * Gjør teksten om til britisk engelsk (British English)
 */
export function toBritishEnglish(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // 1. Erstatt eksakte ord fra ordboken (bevarer store/små bokstaver)
  let result = text.replace(/\b[a-zA-Z]+\b/g, (match) => {
    const lower = match.toLowerCase();
    if (EXACT_WORDS[lower]) {
      return matchCase(match, EXACT_WORDS[lower]);
    }
    return match;
  });

  // 2. Regelmessige endelser: -yze -> -yse (analyze -> analyse, paralyze -> paralyse osv.)
  result = result.replace(/\b([a-zA-Z]+)yz(e|es|ed|ing|er|ers)\b/g, (match, stem, ending) => {
    const target = `${stem}ys${ending}`;
    return matchCase(match, target);
  });

  // 3. Regelmessige endelser: -ize -> -ise (organize -> organise, visualizer -> visualiser osv.)
  result = result.replace(/\b([a-zA-Z]+)iz(e|es|ed|ing|er|ers|ation|ations|able|ability)\b/g, (match, stem, ending) => {
    const lower = match.toLowerCase();
    if (IZE_EXCLUSIONS.has(lower)) {
      return match;
    }
    const target = `${stem}is${ending}`;
    return matchCase(match, target);
  });

  return result;
}
