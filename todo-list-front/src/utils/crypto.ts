import CryptoJS from "crypto-js";

const AES_KEY = "my_todo_app_2026";

export function encrypt(pwd: string) {
  return CryptoJS.AES.encrypt(pwd, AES_KEY).toString();
}
