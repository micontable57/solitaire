import { createQueryKeyStore } from '@lukemorales/query-key-factory'
import { getAllFiles } from './file-storage'

// if you prefer to declare everything in one file
export const queries = createQueryKeyStore({
  images: {
    get: {
      queryKey: null,
      queryFn: () => getAllFiles(),
    },
  },
})
