export const GROUPME_VERSION = 'v3'
export const GOOGLE_VERSION = 'v3'
export const BASE_GROUPME_URL = `https://api.groupme.com/${GROUPME_VERSION}/`

// added through groupme (https://dev.groupme.com -> "Access Token")
export const GROUPME_TOKEN_PATH = 'groupme_token'

// If modifying these scopes, delete token.json.
export const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
// generated from oAuth
export const GOOGLE_TOKEN_PATH = 'token.json'
// downloaded from https://console.cloud.google.com/apis/credentials?project=singular-citron-312417
export const GOOGLE_CREDENTIAL_PATH = 'credentials.json'
