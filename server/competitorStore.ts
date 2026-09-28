import fs from 'fs';
import path from 'path';
import { CompetitorWatchListItem, CompetitorRadarItem } from '../src/types';
import { filterOutInternalBrands } from './internalBrandFilter';
import { ALL_COMPETITOR_WATCHLIST } from './competitorWatchData';

const DATA_DIR = path.join(process.cwd(), 'data');
const WATCHLIST_FILE = path.join(DATA_DIR, 'competitor_watchlist.json');
const SAVED_CASES_FILE = path.join(DATA_DIR, 'saved_competitor_cases.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadWatchList(): CompetitorWatchListItem[] {
  try {
    ensureDataDir();
    if (fs.existsSync(WATCHLIST_FILE)) {
      const data = fs.readFileSync(WATCHLIST_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return filterOutInternalBrands(parsed);
      }
    }
  } catch (err) {
    console.error('Error reading watchlist file:', err);
  }
  const cleanDefault = filterOutInternalBrands(ALL_COMPETITOR_WATCHLIST);
  saveWatchList(cleanDefault);
  return cleanDefault;
}

export function saveWatchList(items: CompetitorWatchListItem[]) {
  try {
    ensureDataDir();
    const cleanItems = filterOutInternalBrands(items);
    fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(cleanItems, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving watchlist file:', err);
  }
}

export function loadSavedCases(): CompetitorRadarItem[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SAVED_CASES_FILE)) {
      const data = fs.readFileSync(SAVED_CASES_FILE, 'utf-8');
      return filterOutInternalBrands(JSON.parse(data));
    }
  } catch (err) {
    console.error('Error reading saved competitor cases file:', err);
  }
  return [];
}

export function saveSavedCases(items: CompetitorRadarItem[]) {
  try {
    ensureDataDir();
    const cleanItems = filterOutInternalBrands(items);
    fs.writeFileSync(SAVED_CASES_FILE, JSON.stringify(cleanItems, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving competitor cases file:', err);
  }
}
