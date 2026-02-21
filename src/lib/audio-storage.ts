
export class AudioStorage {
    private dbName = "FirstReadAudio";
    private storeName = "recordings";
    private db: IDBDatabase | null = null;

    async init() {
        if (this.db) return;
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveRecording(key: string, blob: Blob) {
        await this.init();
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(blob, key.toLowerCase());
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getRecording(key: string): Promise<Blob | null> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key.toLowerCase());
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteRecording(key: string) {
        await this.init();
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key.toLowerCase());
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllRecordings(): Promise<string[]> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result as string[]);
            request.onerror = () => reject(request.error);
        });
    }

    async clearAllRecordings() {
        await this.init();
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const audioStorage = new AudioStorage();
