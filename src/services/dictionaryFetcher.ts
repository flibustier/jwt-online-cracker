import { ref } from 'vue'
import type { Dictionary } from './store'

const numberFormatter = Intl.NumberFormat('en', { notation: 'compact' }).format

const SUPPORTED_FILE_FORMAT = ['txt', 'lst']
const AUTHORIZED_SUBDIRECTORIES = ['Common-Credentials', 'Default-Credentials']
const API_LIST = 'https://api.github.com/repos/danielmiessler/SecLists/contents/Passwords'

interface ApiFile {
  name: string

  download_url: string
  size: number
  type: 'file' | 'dir'
  url: string
}

export const dictionaryList = ref<Dictionary[]>([
  {
    name: 'scraped-JWT-secrets.txt',
    dictionaryURL: '/SecLists/scraped-JWT-secrets.txt',
    rawSize: 1127778,
    size: '1.1mo'
  },
  {
    name: '100k-most-used-passwords-NCSC.txt',
    dictionaryURL: '/SecLists/100k-most-used-passwords-NCSC.txt',
    rawSize: 835538,
    size: '836ko'
  },
  {
    name: 'xato-net-10-million-passwords-1000000.txt',
    dictionaryURL: '/SecLists/xato-net-10-million-passwords-1000000.txt',
    rawSize: 8557632,
    size: '8.6mo'
  },
  {
    name: 'xato-net-10-million-passwords.txt',
    dictionaryURL: '/SecLists/xato-net-10-million-passwords.txt',
    rawSize: 48312893,
    size: '48.3mo'
  },
  {
    name: 'Pwdb_top-1000000.txt',
    dictionaryURL: '/SecLists/Pwdb_top-1000000.txt',
    rawSize: 8755171,
    size: '8.8mo'
  },
  {
    name: 'Pwdb_top-10000000.txt',
    dictionaryURL: '/SecLists/Pwdb_top-10000000.txt',
    rawSize: 94461698,
    size: '94.5mo'
  }
])

const formatDictionaryList = (list: ApiFile[]): Dictionary[] =>
  list
    .filter((file) => !!file.download_url && SUPPORTED_FILE_FORMAT.includes(file.name.slice(-3)))
    .map((file) => ({
      name: file.name,
      dictionaryURL: file.download_url,
      rawSize: file.size,
      size: numberFormatter(file.size).toLowerCase() + 'o'
    }))

export const listDictionaries = async (endpoint?: string): Promise<void> => {
  try {
    const resp = await fetch(endpoint || API_LIST)
    const list = (await resp.json()) as ApiFile[]

    if (!endpoint) {
      // we replace the first time
      dictionaryList.value = formatDictionaryList(list)
    } else {
      // we add for the others
      dictionaryList.value = dictionaryList.value
        .concat(formatDictionaryList(list))
        .sort((a: Dictionary, b: Dictionary) => a.name.localeCompare(b.name))
    }

    // recursive
    list
      .filter(({ type, name }) => type === 'dir' && AUTHORIZED_SUBDIRECTORIES.includes(name))
      .forEach(({ url }) => listDictionaries(url))
  } catch (error) {
    console.error('Error fetching dictionary list:', error)
  }
}

// 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/xato-net-10-million-passwords-10.txt'
export const readDictionary = async (dictionaryURL: string) => {
  const resp = await fetch(dictionaryURL)
  return resp.body
}
