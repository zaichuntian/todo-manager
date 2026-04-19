import CryptoJS from 'crypto-js'

const SECRET_KEY = 'my_todo_app_2026'

export function decrypt(encryptedPassword: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8) || null
  } catch (err) {
    console.error('解密失败', err)
    return null
  }
}