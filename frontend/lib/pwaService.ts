export class PWAService {
  private static dbName = 'StudiaOfflineDB';
  private static version = 2;
  private static db: IDBDatabase | null = null;

  static async init(): Promise<void> {
    if (this.db) return;

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

        if (!db.objectStoreNames.contains('courses')) {
            db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('flashcards')) {
            db.createObjectStore('flashcards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizzes')) {
            db.createObjectStore('quizzes', { keyPath: 'id' });
        }
      };
    });
  }

  // --- SAUVEGARDE ---

  static async saveCourseOffline(course: any) {
    try {
        await this.init();
        const tx = this.db!.transaction('courses', 'readwrite');
        tx.objectStore('courses').put(course);
    } catch (e) { console.error(e); }
  }

  static async saveFlashcardsOffline(deck: any) {
    try {
        await this.init();
        const tx = this.db!.transaction('flashcards', 'readwrite');
        tx.objectStore('flashcards').put(deck);
    } catch (e) { console.error(e); }
  }

  static async saveQuizOffline(quiz: any) {
    try {
        await this.init();
        const tx = this.db!.transaction('quizzes', 'readwrite');
        tx.objectStore('quizzes').put(quiz);
    } catch (e) { console.error(e); }
  }

  // --- RÉCUPÉRATION ---

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

  // ✅ LES MÉTHODES MANQUANTES
  static async getAllQuizzesOffline(): Promise<any[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('quizzes', 'readonly');
      const request = tx.objectStore('quizzes').getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  static async deleteQuizOffline(id: string) {
    await this.init();
    const tx = this.db!.transaction('quizzes', 'readwrite');
    tx.objectStore('quizzes').delete(id);
  }

  // --- UTILITAIRE ---
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }
}