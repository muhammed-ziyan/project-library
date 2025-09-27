import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

const STORAGE_DIR = process.env.FILE_STORAGE_DIR || path.join(process.cwd(), 'storage', 'projects')

export class LocalFileStorage {
  constructor() {
    this.ensureStorageDir()
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
  }

  async saveFile(buffer: Buffer, originalName: string): Promise<string> {
    const extension = path.extname(originalName)
    const filename = `${randomUUID()}${extension}`
    const filepath = path.join(STORAGE_DIR, filename)
    
    await fs.promises.writeFile(filepath, buffer)
    return filename
  }

  async deleteFile(filename: string): Promise<void> {
    const filepath = path.join(STORAGE_DIR, filename)
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath)
    }
  }

  getFileUrl(filename: string): string {
    return `/files/${filename}`
  }

  getFilePath(filename: string): string {
    return path.join(STORAGE_DIR, filename)
  }
}

export const storage = new LocalFileStorage()