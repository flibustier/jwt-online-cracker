const numberFormatter = Intl.NumberFormat('en', { notation: 'compact' }).format

const SUPPORTED_FILE_FORMAT = ['txt', 'lst']
const API_LIST = 'https://api.github.com/repos/danielmiessler/SecLists/contents/Passwords'


export const listDictionaries = async () => {
  const resp = await fetch(API_LIST)
  const list = await resp.json()

  return list
    .filter(
      (file: any) => !!file.download_url && SUPPORTED_FILE_FORMAT.includes(file.name.slice(-3))
    )
    .map((file: any) => ({
      name: file.name,
      dictionaryURL: file.download_url,
      size: numberFormatter(file.size).toLowerCase() + 'o'
    }))
}

// 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/xato-net-10-million-passwords-10.txt'
export const downloadDictionary = async (dictionaryURL: string) => {
  const resp = await fetch(dictionaryURL)
  resp.body?.pipeThrough
}
