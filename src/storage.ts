import { LocalStorage } from "@raycast/api";
import { TempEmail } from "./types";
import { STORAGE_KEYS } from "./constants";

const STORAGE_KEY = STORAGE_KEYS.TEMP_EMAILS;

export async function saveEmail(email: TempEmail): Promise<void> {
  const emails = await getEmails();
  emails.push(email);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
}

export async function getEmails(): Promise<TempEmail[]> {
  const stored = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!stored) return [];

  const emails: TempEmail[] = JSON.parse(stored);
  const now = Date.now();
  const validEmails = emails.filter((email) => email.expiresAt > now);

  if (validEmails.length !== emails.length) {
    await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(validEmails));
  }

  return validEmails;
}

export async function deleteEmail(id: string): Promise<void> {
  const emails = await getEmails();
  const filtered = emails.filter((email) => email.id !== id);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearExpiredEmails(): Promise<void> {
  await getEmails();
}
