// fileStorage.js
import { openDB } from 'idb'

const DB_NAME = 'FileStorageDB'
const STORE_NAME = 'files'

// 🔹 Interface para os dados armazenados
export interface StoredFile {
  id?: number // Opcional porque é autoIncrement
  name: string
  type: string
  size: number
  lastModified: number
  extension: string
  content: ArrayBuffer
  createdAt: Date
  updatedAt?: Date
}

// 🔹 Inicializa (ou abre) o banco
export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('name', 'name', { unique: false })
      }
    },
  })
}

// 🔹 CREATE — adiciona novo arquivo
export async function addFile(file: File) {
  const db = await initDB()
  const blob = await file.arrayBuffer()
  const extension = file.name.split('.').pop() || ''
  const fileData = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    extension,
    content: blob,
    createdAt: new Date(),
  } satisfies StoredFile
  await db.add(STORE_NAME, fileData)
}

// 🔹 READ — obtém todos os arquivos
export async function getAllFiles(): Promise<StoredFile[]> {
  const db = await initDB()
  return db.getAll(STORE_NAME)
}

// 🔹 READ — obtém um arquivo por ID
export async function getFileById(id: number): Promise<StoredFile | undefined> {
  const db = await initDB()
  return db.get(STORE_NAME, id)
}

// 🔹 UPDATE — substitui o conteúdo de um arquivo existente
export async function updateFile(id: number, newFile: File) {
  const db = await initDB()
  const existing = await db.get(STORE_NAME, id)
  if (!existing) throw new Error('Arquivo não encontrado.')

  const blob = await newFile.arrayBuffer()
  const extension = newFile.name.split('.').pop() || ''
  const updated = {
    ...existing,
    name: newFile.name,
    type: newFile.type,
    size: newFile.size,
    lastModified: newFile.lastModified,
    extension,
    content: blob,
    updatedAt: new Date(),
  }

  await db.put(STORE_NAME, updated)
}

// 🔹 DELETE — remove arquivo pelo ID
export async function deleteFile(id: number) {
  const db = await initDB()
  await db.delete(STORE_NAME, id)
}

// 🔹 UTIL — converte o conteúdo armazenado de volta em Blob (para download)
export function fileFromRecord(record: StoredFile): Blob {
  return new Blob([record.content], { type: record.type })
}

// 🔹 UTIL — cria URL temporário do Blob (útil para <img> e <video>)
export function createObjectURL(record: StoredFile): string {
  console.log('Creating object URL for record:', record)
  const blob = fileFromRecord(record)
  const url = URL.createObjectURL(blob)
  return `${url}#.${record.extension}`
}

// 🔹 UTIL — limpa todos os arquivos do banco
export async function clearAllFiles() {
  const db = await initDB()
  await db.clear(STORE_NAME)
}
