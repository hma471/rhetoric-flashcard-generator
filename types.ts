export type Language = 'en' | 'el' | 'es' | 'sv' | 'it';

export interface Activity {
  id: number;
  age: string;
  level: string;
  icon: string;
  title: string;
  theme: string;
  concept: string;
  materials: string;
  duration: string;
  focus: string;
  description: string;
  focusPoints: string[];
  examples: string[];
  rhetoric: string;
}

export interface TranslationDictionary {
  title: string;
  subtitle: string;
  badgeTitle: string;
  badgeDesc: string;
  badgeSub: string;
  statsTotal: string;
  statsSelected: string;
  statsGenerated: string;
  statsDownloaded: string;
  filterTitle: string;
  labelAge: string;
  labelLevel: string;
  labelSearch: string;
  optAllAges: string;
  optAllLevels: string;
  btnSelectAll: string;
  btnDeselectAll: string;
  btnGenerate: string;
  btnDownload: string;
  cardOverview: string;
  cardTheme: string;
  cardDuration: string;
  cardLevel: string;
  cardAge: string;
  cardConcept: string;
  cardMaterials: string;
  cardDescTitle: string;
  cardFocusTitle: string;
  cardExamplesTitle: string;
  cardRhetoricTitle: string;
  cardFooterAge: string;
  cardFooterCredit: string;
  cardFooterAuthor: string;
  yearsShort: string;
  yearsFull: string;
  loading: string;
  noResults: string;
  downloadSingle: string;
  alertSelect: string;
  alertGenerate: string;
  alertComplete: string;
  confirmDownload: string;
}