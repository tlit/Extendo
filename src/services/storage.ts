import { MicroExtension } from '../types';

export class StorageService {
    private static STORAGE_KEY = 'extendo_extensions';

    static async save(extension: MicroExtension): Promise<void> {
        const list = await this.getAll();
        list.push(extension);
        await chrome.storage.local.set({ [this.STORAGE_KEY]: list });
    }

    static async getAll(): Promise<MicroExtension[]> {
        const result = await chrome.storage.local.get(this.STORAGE_KEY);
        return result[this.STORAGE_KEY] || [];
    }

    static async delete(id: string): Promise<void> {
        const list = await this.getAll();
        const filtered = list.filter(ext => ext.id !== id);
        await chrome.storage.local.set({ [this.STORAGE_KEY]: filtered });
    }

    static async toggleAutoRun(id: string): Promise<void> {
        const list = await this.getAll();
        const index = list.findIndex(ext => ext.id === id);
        if (index !== -1) {
            list[index].autoRun = !list[index].autoRun;
            await chrome.storage.local.set({ [this.STORAGE_KEY]: list });
        }
    }
}
