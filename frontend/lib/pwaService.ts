export class PWAService {
  private static dbName = 'StudiaOfflineDB';
  private static version = 1;
  private static db: IDBDatabase | null = null;

  // Initialisation de la BDD
  static async init(): Promise<void> {
    if (this.db) return; // Déjà initialisé

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject("Erreur ouverture DB");
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Création des tables (Object Stores)
        if (!db.objectStoreNames.contains('courses')) {
            db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('flashcards')) {
            db.createObjectStore('flashcards', { keyPath: 'id' });
        }
      };
    });
  }

  // --- SAUVEGARDE (Quand on est en ligne) ---

  static async saveCourseOffline(course: any) {
    try {
        await this.init();
        const tx = this.db!.transaction('courses', 'readwrite');
        tx.objectStore('courses').put(course);
    } catch (e) {
        console.error("Save Course Error:", e);
    }
  }

  static async saveFlashcardsOffline(deck: any) {
    try {
        await this.init();
        const tx = this.db!.transaction('flashcards', 'readwrite');
        tx.objectStore('flashcards').put(deck);
    } catch (e) {
        console.error("Save Flashcards Error:", e);
    }
  }

  // --- RÉCUPÉRATION (Quand on est hors ligne) ---

  static async getAllCoursesOffline(): Promise<any[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('courses', 'readonly');
      const request = tx.objectStore('courses').getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  static async getFlashcardDeckOffline(id: number): Promise<any> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('flashcards', 'readonly');
      const request = tx.objectStore('flashcards').get(Number(id));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }

  // --- UTILITAIRE ---
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }
}