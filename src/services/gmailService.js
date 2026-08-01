// src/services/gmailService.js
import { generateEmailHTML } from './emailService';

const GMAIL_TOKEN_KEY = 'cupid_english_gmail_access_token';
const GMAIL_CLIENT_ID_KEY = 'cupid_english_gmail_client_id';

/**
 * Get stored Gmail Access Token
 */
export function getStoredGmailToken() {
  try {
    return localStorage.getItem(GMAIL_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save Gmail Access Token
 */
export function saveStoredGmailToken(token) {
  try {
    localStorage.setItem(GMAIL_TOKEN_KEY, (token || '').trim());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get stored Google Client ID
 */
export function getStoredGoogleClientId() {
  try {
    return localStorage.getItem(GMAIL_CLIENT_ID_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save Google Client ID
 */
export function saveStoredGoogleClientId(clientId) {
  try {
    localStorage.setItem(GMAIL_CLIENT_ID_KEY, (clientId || '').trim());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Base64URL encoder for RFC 822 MIME message (required by Gmail API)
 */
function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends email directly using official Google Gmail API (users/me/messages/send)
 */
export async function sendEmailViaGmailAPI(result, senderEmail, recipientEmails, accessToken) {
  const token = accessToken || getStoredGmailToken();
  if (!token) {
    throw new Error('Gmail 인증 토큰(Google Access Token)이 등록되지 않았습니다.');
  }

  const subject = result.english || result.arrowKorean || 'Cupid English Report';
  const htmlBody = generateEmailHTML(result, senderEmail);

  // Encode subject to UTF-8 Base64 for RFC 2047 compatibility
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const rawMimeParts = [
    senderEmail ? `From: ${senderEmail}` : `From: me`,
    `To: ${recipientEmails.join(', ')}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    htmlBody
  ];

  const rawMimeString = rawMimeParts.join('\r\n');
  const base64UrlRaw = base64UrlEncode(rawMimeString);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64UrlRaw
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      // Token expired
      saveStoredGmailToken('');
      throw new Error('Gmail 로그인 인증 토큰이 만료되었습니다. 다시 [Gmail 계정 연동]을 해주세요.');
    }
    throw new Error(`Gmail API 전송 실패 (${response.status}): ${errorText}`);
  }

  const responseData = await response.json();
  return responseData;
}

/**
 * Initiates Google OAuth 2.0 Implicit Grant / Token Client flow
 */
export function requestGoogleGmailToken(clientId, onSuccess, onError) {
  if (!clientId) {
    onError(new Error('Google OAuth Client ID가 지정되지 않았습니다.'));
    return;
  }

  // Load Google GIS script dynamically if needed
  const initFlow = () => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            saveStoredGmailToken(tokenResponse.access_token);
            onSuccess(tokenResponse.access_token);
          } else {
            onError(new Error('Google OAuth 인증에 실패했습니다.'));
          }
        },
        error_callback: (err) => {
          onError(err);
        }
      });
      client.requestAccessToken();
    } else {
      onError(new Error('Google OAuth 라이브러리를 불러오지 못했습니다.'));
    }
  };

  if (!window.google || !window.google.accounts) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initFlow;
    script.onerror = () => onError(new Error('Google OAuth 스크립트 로드 실패'));
    document.body.appendChild(script);
  } else {
    initFlow();
  }
}
