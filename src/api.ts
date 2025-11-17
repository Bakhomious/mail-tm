import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
import { DomainsResponse, TempEmail, MessagesResponse, MessageDetail, AccountResponse, TokenResponse, GenerateEmailOptions } from "./types";
import { API, EXPIRATION_DAYS } from "./constants";

export async function getAvailableDomains(): Promise<string[]> {
  const domainsResponse = await fetch(`${API}/domains`);
  const domains: DomainsResponse = await domainsResponse.json() as DomainsResponse;
  return domains["hydra:member"].map(d => d.domain);
}

export async function generateEmail(options?: GenerateEmailOptions): Promise<TempEmail> {
  const domainsResponse = await fetch(`${API}/domains`);
  const domains: DomainsResponse = await domainsResponse.json() as DomainsResponse;

  const domain = options?.customDomain || domains["hydra:member"][0].domain;

  let address: string;
  if (options?.customAddress) {
    address = `${options.customAddress}@${domain}`;
  } else {
    const randomUsername = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      length: 3,
      style: 'lowerCase'
    });
    address = `${randomUsername}@${domain}`;
  }

  const password = options?.customPassword || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);

  const accountResponse = await fetch(`${API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password })
  });

  if (!accountResponse.ok) {
    console.log(accountResponse);

    if (accountResponse.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }

    throw new Error("Failed to create account");
  }

  const accountData = await accountResponse.json() as AccountResponse;
  const accountId = accountData.id;

  const tokenResponse = await fetch(`${API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password })
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get authentication token");
  }

  const tokenData = await tokenResponse.json() as TokenResponse;
  const token = tokenData.token;

  const createdAt = Date.now();
  const expiresAt = createdAt + (EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
  const id = `${address}-${createdAt}`;

  return { id, address, password, token, accountId, createdAt, expiresAt };
}

export async function deleteEmailFromAPI(accountId: string, token: string): Promise<void> {
  const response = await fetch(`${API}/accounts/${accountId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete account from API");
  }
}

export async function getMessages(token: string): Promise<MessagesResponse> {
  const response = await fetch(`${API}/messages?page=1`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }
    throw new Error("Failed to fetch messages");
  }

  return await response.json() as MessagesResponse;
}

export async function getMessageDetail(messageId: string, token: string): Promise<MessageDetail> {
  const response = await fetch(`${API}/messages/${messageId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }
    throw new Error("Failed to fetch message details");
  }

  return await response.json() as MessageDetail;
}
