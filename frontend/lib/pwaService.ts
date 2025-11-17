export class PWAService {
  private static db: IDBDatabase | null = null;

  static async init() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker enregistré:', registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('Nouvelle version disponible ! Recharger ?')) {
                window.location.reload();
              }
            }
          });
        });

        // Background sync
        if ('sync' in registration) {
          console.log('✅ Background Sync supporté');
        }

        // Push notifications
        if ('pushManager' in registration) {
          console.log('✅ Push Notifications supportées');
        }

      } catch (error) {
        console.error('❌ Erreur Service Worker:', error);
      }
    }

    // Init IndexedDB
    await this.initDB();
  }

  static async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StudiaDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline courses
        if (!db.objectStoreNames.contains('courses')) {
          const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
          courseStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // Store for offline flashcards
        if (!db.objectStoreNames.contains('flashcards')) {
          const flashcardStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcardStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // Store for pending actions (sync queue)
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async saveCourseOffline(course: any) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('courses', 'readwrite');
      const store = tx.objectStore('courses');
      const request = store.put(course);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async getCourseOffline(id: number) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('courses', 'readonly');
      const store = tx.objectStore('courses');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async getCoursesOffline(userId: string) {
    if (!this.db) await this.initDB();

    return new Promise<any[]>((resolve, reject) => {
      const tx = this.db!.transaction('courses', 'readonly');
      const store = tx.objectStore('courses');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  static async addPendingAction(action: any) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingActions', 'readwrite');
      const store = tx.objectStore('pendingActions');
      const request = store.add(action);

      request.onsuccess = () => {
        // Try to sync immediately
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then((registration) => {
            return (registration as any).sync.register('sync-data');
          });
        }
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static async getInstallPrompt() {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    return deferredPrompt;
  }

  static async showInstallPrompt() {
    const deferredPrompt = await this.getInstallPrompt();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      return outcome === 'accepted';
    }

    return false;
  }
}