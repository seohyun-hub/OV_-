import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { ScheduleItem, PartnerDealItem, ReferenceSiteItem, PartnerPerformanceActivity, PartnerRecord, PartnerContactRecord, PartnerArchiveRecord } from '../src/types';

export interface MigrationStatus {
  status: 'completed' | 'failed' | 'not_started';
  migratedAt?: string;
  counts?: Record<string, number>;
  error?: string;
}

export interface FirestoreInitStatus {
  projectDetected: boolean;
  projectId: string | null;
  firestoreConnected: boolean;
  storageConnected: boolean;
  firestoreError?: string;
  storageError?: string;
  migrationStatus: MigrationStatus;
}

const DATA_DIR = path.join(process.cwd(), 'data');

class FirestoreService {
  private db: Firestore | null = null;
  private storage: Storage | null = null;
  private bucketName: string | null = null;
  private projectId: string | null = null;
  private isFirestoreReady: boolean = false;
  private isStorageReady: boolean = false;
  private initStatus: FirestoreInitStatus = {
    projectDetected: false,
    projectId: null,
    firestoreConnected: false,
    storageConnected: false,
    migrationStatus: { status: 'not_started' },
  };

  constructor() {
    // Initial sync setup from env if present
    this.projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || null;
  }

  private getCredentialsOptions(): { projectId?: string; credentials?: { client_email: string; private_key: string } } {
    // 1. Check for single JSON service account key
    if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
      try {
        let rawKey = process.env.GCP_SERVICE_ACCOUNT_KEY.trim();
        if ((rawKey.startsWith("'") && rawKey.endsWith("'")) || (rawKey.startsWith('"') && rawKey.endsWith('"'))) {
          rawKey = rawKey.slice(1, -1);
        }
        if (!rawKey.startsWith('{') && rawKey.length > 50) {
          try {
            const decoded = Buffer.from(rawKey, 'base64').toString('utf-8');
            if (decoded.startsWith('{')) rawKey = decoded;
          } catch (e) {}
        }
        const parsed = JSON.parse(rawKey);
        if (parsed.client_email && parsed.private_key) {
          return {
            projectId: parsed.project_id || this.projectId || undefined,
            credentials: {
              client_email: parsed.client_email,
              private_key: parsed.private_key.replace(/\\n/g, '\n'),
            },
          };
        }
      } catch (e) {
        console.warn('[FirestoreService] Failed to parse GCP_SERVICE_ACCOUNT_KEY JSON:', e);
      }
    }

    // 2. Check for individual pair: FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (clientEmail && privateKey) {
      return {
        projectId: this.projectId || undefined,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
      };
    }

    // 3. Fallback to ADC default options
    return this.projectId ? { projectId: this.projectId } : {};
  }

  public async initialize(): Promise<FirestoreInitStatus> {
    try {
      const credOptions = this.getCredentialsOptions();
      if (credOptions.projectId) {
        this.projectId = credOptions.projectId;
      }

      // 1. Detect Project ID via GoogleAuth ADC if not specified in env with strict timeout
      if (!this.projectId) {
        try {
          const auth = new GoogleAuth();
          const getProjPromise = auth.getProjectId();
          const timeoutPromise = new Promise<string | null>((resolve) =>
            setTimeout(() => resolve(null), 2000)
          );
          const detected = await Promise.race([getProjPromise, timeoutPromise]);
          if (detected) this.projectId = detected;
        } catch (authErr: any) {
          console.warn('[FirestoreService] Could not auto-detect Project ID via ADC:', authErr.message);
        }
      }

      if (this.projectId) {
        this.initStatus.projectDetected = true;
        this.initStatus.projectId = this.projectId;
      }

      // 2. Try initializing Firestore
      try {
        const firestoreOptions: any = { ...credOptions };
        if (this.projectId) {
          firestoreOptions.projectId = this.projectId;
        }
        this.db = new Firestore(firestoreOptions);

        // Test actual read/write connectivity with timeout
        const testCol = this.db.collection('_system');
        const testDoc = testCol.doc('connectivity_check');
        const setPromise = testDoc.set({
          lastChecked: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore connectivity check timed out (3000ms)')), 3000)
        );
        await Promise.race([setPromise, timeoutPromise]);
        
        this.isFirestoreReady = true;
        this.initStatus.firestoreConnected = true;
        console.log(`[FirestoreService] Successfully connected to Firestore (Project: ${this.projectId})`);
      } catch (fsErr: any) {
        this.isFirestoreReady = false;
        this.initStatus.firestoreConnected = false;
        this.initStatus.firestoreError = fsErr.message;
        console.warn(`[FirestoreService] Firestore connection failed (${fsErr.message}). Operating in Fail-safe mode with local persistence.`);
      }

      // 3. Try initializing Cloud Storage
      try {
        const storageOptions: any = { ...credOptions };
        if (this.projectId) {
          storageOptions.projectId = this.projectId;
        }
        this.storage = new Storage(storageOptions);
        
        this.bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.GCS_BUCKET_NAME || (this.projectId ? `${this.projectId}.appspot.com` : null);
        if (this.bucketName) {
          const bucket = this.storage.bucket(this.bucketName);
          const existsPromise = bucket.exists();
          const timeoutPromise = new Promise<[boolean]>((resolve) =>
            setTimeout(() => resolve([false]), 2500)
          );
          const [exists] = await Promise.race([existsPromise, timeoutPromise]);
          if (exists) {
            this.isStorageReady = true;
            this.initStatus.storageConnected = true;
            console.log(`[FirestoreService] Cloud Storage connected to bucket: ${this.bucketName}`);
          } else {
            this.initStatus.storageError = `Bucket ${this.bucketName} not found`;
          }
        }
      } catch (storageErr: any) {
        this.isStorageReady = false;
        this.initStatus.storageConnected = false;
        this.initStatus.storageError = storageErr.message;
      }

      // 4. Perform 1-time migration if Firestore is ready
      if (this.isFirestoreReady && this.db) {
        await this.runOneTimeMigration();
        await this.syncStoresFromFirestore();
      }

    } catch (err: any) {
      console.error('[FirestoreService] Initialization error:', err);
    }

    return this.initStatus;
  }

  private async syncStoresFromFirestore(): Promise<void> {
    if (!this.isFirestoreReady || !this.db) return;
    try {
      const { setMemorySchedules } = await import('./scheduleStore');
      const { setMemoryDeals } = await import('./partnerPipelineStore');
      const { setMemoryPerformanceActivities } = await import('./partnerPerformanceStore');
      const { setMemoryReferenceSites } = await import('./referenceSiteStore');
      const { setMemoryPartnerArchives } = await import('./partnerArchiveStore');

      const [schedules, deals, performance, referenceSites, partnerArchives] = await Promise.all([
        this.getSchedules(),
        this.getPartnerDeals(),
        this.getPartnerPerformance(),
        this.getReferenceSites(),
        this.getPartnerArchives(),
      ]);

      if (schedules && schedules.length > 0) setMemorySchedules(schedules);
      if (deals && deals.length > 0) setMemoryDeals(deals);
      if (performance && performance.length > 0) setMemoryPerformanceActivities(performance);
      if (referenceSites && referenceSites.length > 0) setMemoryReferenceSites(referenceSites);
      if (partnerArchives && partnerArchives.length > 0) setMemoryPartnerArchives(partnerArchives);

      console.log('[FirestoreService] Successfully loaded Firestore collections into memory stores.');
    } catch (err) {
      console.error('[FirestoreService] Error syncing stores from Firestore:', err);
    }
  }

  public getStatus(): FirestoreInitStatus {
    return this.initStatus;
  }

  public isReady(): boolean {
    return this.isFirestoreReady;
  }

  public isCloudStorageReady(): boolean {
    return this.isStorageReady;
  }

  // --- 1-TIME MIGRATION ---
  private async runOneTimeMigration(): Promise<void> {
    if (!this.isFirestoreReady || !this.db) return;

    try {
      const migrationDocRef = this.db.collection('_system').doc('migrations');
      const docSnap = await migrationDocRef.get();
      if (docSnap.exists && docSnap.data()?.jsonToFirestoreV1 === 'completed') {
        console.log('[FirestoreService] 1-time migration already completed previously. Skipping.');
        this.initStatus.migrationStatus = {
          status: 'completed',
          migratedAt: docSnap.data()?.migratedAt,
          counts: docSnap.data()?.counts,
        };
        return;
      }

      console.log('[FirestoreService] Starting 1-time JSON to Firestore migration...');
      const counts: Record<string, number> = {};

      // 1. Schedules
      const schedulesFile = path.join(DATA_DIR, 'schedules.json');
      if (fs.existsSync(schedulesFile)) {
        const data: ScheduleItem[] = JSON.parse(fs.readFileSync(schedulesFile, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) {
          const batch = this.db.batch();
          for (const item of data) {
            const ref = this.db.collection('schedules').doc(item.id);
            batch.set(ref, item, { merge: true });
          }
          await batch.commit();
          counts.schedules = data.length;
          console.log(`[FirestoreService] Migrated ${data.length} schedules to Firestore.`);
        }
      }

      // 2. Partner Deals
      const dealsFile = path.join(DATA_DIR, 'partner_deals.json');
      if (fs.existsSync(dealsFile)) {
        const data: PartnerDealItem[] = JSON.parse(fs.readFileSync(dealsFile, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) {
          const batch = this.db.batch();
          for (const item of data) {
            const ref = this.db.collection('partnerDeals').doc(item.id);
            batch.set(ref, item, { merge: true });
          }
          await batch.commit();
          counts.partnerDeals = data.length;
          console.log(`[FirestoreService] Migrated ${data.length} partner deals to Firestore.`);
        }
      }

      // 3. Reference Sites
      const refSitesFile = path.join(DATA_DIR, 'reference_sites.json');
      if (fs.existsSync(refSitesFile)) {
        const data: ReferenceSiteItem[] = JSON.parse(fs.readFileSync(refSitesFile, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) {
          const batch = this.db.batch();
          for (const item of data) {
            const ref = this.db.collection('referenceSites').doc(item.id);
            batch.set(ref, item, { merge: true });
          }
          await batch.commit();
          counts.referenceSites = data.length;
          console.log(`[FirestoreService] Migrated ${data.length} reference sites to Firestore.`);
        }
      }

      // 4. Partner Performance
      const perfFile = path.join(DATA_DIR, 'partner_performance.json');
      if (fs.existsSync(perfFile)) {
        const data: PartnerPerformanceActivity[] = JSON.parse(fs.readFileSync(perfFile, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) {
          const batch = this.db.batch();
          for (const item of data) {
            const ref = this.db.collection('partnerPerformance').doc(item.id);
            batch.set(ref, item, { merge: true });
          }
          await batch.commit();
          counts.partnerPerformance = data.length;
          console.log(`[FirestoreService] Migrated ${data.length} partner performance records to Firestore.`);
        }
      }

      // 5. Instagram Events
      const instaFile = path.join(DATA_DIR, 'instagram_events.json');
      if (fs.existsSync(instaFile)) {
        const parsed = JSON.parse(fs.readFileSync(instaFile, 'utf-8'));
        const events = parsed.events || [];
        if (Array.isArray(events) && events.length > 0) {
          const batch = this.db.batch();
          for (const item of events) {
            const ref = this.db.collection('instagramEvents').doc(item.id);
            batch.set(ref, item, { merge: true });
          }
          await batch.commit();
          counts.instagramEvents = events.length;
          console.log(`[FirestoreService] Migrated ${events.length} instagram events to Firestore.`);
        }
      }

      // 6. Knowledge Documents metadata
      const kbFile = path.join(DATA_DIR, 'knowledge_documents.json');
      if (fs.existsSync(kbFile)) {
        const data = JSON.parse(fs.readFileSync(kbFile, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) {
          const batch = this.db.batch();
          for (const item of data) {
            const ref = this.db.collection('knowledge_documents').doc(item.id);
            batch.set(ref, item, { merge: true });
          }
          await batch.commit();
          counts.knowledge_documents = data.length;
          console.log(`[FirestoreService] Migrated ${data.length} knowledge documents metadata to Firestore.`);
        }
      }

      // Save completion flag in _system/migrations
      const migratedAt = new Date().toISOString();
      await migrationDocRef.set({
        jsonToFirestoreV1: 'completed',
        migratedAt,
        counts,
      }, { merge: true });

      this.initStatus.migrationStatus = {
        status: 'completed',
        migratedAt,
        counts,
      };

      console.log('[FirestoreService] 1-time migration completed successfully!', counts);
    } catch (migErr: any) {
      console.error('[FirestoreService] Migration failed (existing data preserved):', migErr);
      this.initStatus.migrationStatus = {
        status: 'failed',
        error: migErr.message,
      };
    }
  }

  // --- REPOSITORY CRUD METHODS ---

  // Schedules
  public async getSchedules(): Promise<ScheduleItem[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('schedules').get();
      return snap.docs.map(doc => doc.data() as ScheduleItem);
    } catch (e) {
      console.error('[FirestoreService] getSchedules error:', e);
      return null;
    }
  }

  public async setSchedule(item: ScheduleItem): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('schedules').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setSchedule error:', e);
      return false;
    }
  }

  public async deleteSchedule(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('schedules').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deleteSchedule error:', e);
      return false;
    }
  }

  // Partner Deals
  public async getPartnerDeals(): Promise<PartnerDealItem[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('partnerDeals').get();
      return snap.docs.map(doc => doc.data() as PartnerDealItem);
    } catch (e) {
      console.error('[FirestoreService] getPartnerDeals error:', e);
      return null;
    }
  }

  public async setPartnerDeal(item: PartnerDealItem): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerDeals').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setPartnerDeal error:', e);
      return false;
    }
  }

  public async deletePartnerDeal(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerDeals').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deletePartnerDeal error:', e);
      return false;
    }
  }

  // Reference Sites
  public async getReferenceSites(): Promise<ReferenceSiteItem[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('referenceSites').get();
      return snap.docs.map(doc => doc.data() as ReferenceSiteItem);
    } catch (e) {
      console.error('[FirestoreService] getReferenceSites error:', e);
      return null;
    }
  }

  public async setReferenceSite(item: ReferenceSiteItem): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('referenceSites').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setReferenceSite error:', e);
      return false;
    }
  }

  public async deleteReferenceSite(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('referenceSites').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deleteReferenceSite error:', e);
      return false;
    }
  }

  // Partner Performance
  public async getPartnerPerformance(): Promise<PartnerPerformanceActivity[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('partnerPerformance').get();
      return snap.docs.map(doc => doc.data() as PartnerPerformanceActivity);
    } catch (e) {
      console.error('[FirestoreService] getPartnerPerformance error:', e);
      return null;
    }
  }

  public async setPartnerPerformance(item: PartnerPerformanceActivity): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerPerformance').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setPartnerPerformance error:', e);
      return false;
    }
  }

  public async deletePartnerPerformance(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerPerformance').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deletePartnerPerformance error:', e);
      return false;
    }
  }

  // Instagram Events
  public async getInstagramEvents(): Promise<any[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('instagramEvents').get();
      return snap.docs.map(doc => doc.data());
    } catch (e) {
      console.error('[FirestoreService] getInstagramEvents error:', e);
      return null;
    }
  }

  public async setInstagramEvent(item: any): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('instagramEvents').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setInstagramEvent error:', e);
      return false;
    }
  }

  public async deleteInstagramEvent(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('instagramEvents').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deleteInstagramEvent error:', e);
      return false;
    }
  }

  // Partners collection
  public async getPartners(): Promise<PartnerRecord[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('partners').get();
      return snap.docs.map(doc => doc.data() as PartnerRecord);
    } catch (e) {
      console.error('[FirestoreService] getPartners error:', e);
      return null;
    }
  }

  public async setPartner(item: PartnerRecord): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partners').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setPartner error:', e);
      return false;
    }
  }

  public async deletePartner(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partners').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deletePartner error:', e);
      return false;
    }
  }

  // Partner Contacts collection
  public async getPartnerContacts(): Promise<PartnerContactRecord[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('partnerContacts').get();
      return snap.docs.map(doc => doc.data() as PartnerContactRecord);
    } catch (e) {
      console.error('[FirestoreService] getPartnerContacts error:', e);
      return null;
    }
  }

  public async setPartnerContact(item: PartnerContactRecord): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerContacts').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setPartnerContact error:', e);
      return false;
    }
  }

  public async deletePartnerContact(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerContacts').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deletePartnerContact error:', e);
      return false;
    }
  }

  // Partner Archives collection
  public async getPartnerArchives(): Promise<PartnerArchiveRecord[] | null> {
    if (!this.isFirestoreReady || !this.db) return null;
    try {
      const snap = await this.db.collection('partnerArchives').get();
      return snap.docs.map(doc => doc.data() as PartnerArchiveRecord);
    } catch (e) {
      console.error('[FirestoreService] getPartnerArchives error:', e);
      return null;
    }
  }

  public async setPartnerArchive(item: PartnerArchiveRecord): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerArchives').doc(item.id).set(item, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreService] setPartnerArchive error:', e);
      return false;
    }
  }

  public async deletePartnerArchive(id: string): Promise<boolean> {
    if (!this.isFirestoreReady || !this.db) return false;
    try {
      await this.db.collection('partnerArchives').doc(id).delete();
      return true;
    } catch (e) {
      console.error('[FirestoreService] deletePartnerArchive error:', e);
      return false;
    }
  }

  // Cloud Storage Upload File
  public async uploadFile(destinationPath: string, buffer: Buffer, mimeType: string): Promise<string | null> {
    if (!this.isStorageReady || !this.storage || !this.bucketName) return null;
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(destinationPath);
      await file.save(buffer, {
        contentType: mimeType,
        resumable: false,
      });
      return `gs://${this.bucketName}/${destinationPath}`;
    } catch (e) {
      console.error('[FirestoreService] uploadFile error:', e);
      return null;
    }
  }
}

export const firestoreService = new FirestoreService();
