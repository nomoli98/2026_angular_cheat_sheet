// Used by `ng build` (production).
// `ng serve` uses environment.development.ts instead (see "fileReplacements" in angular.json).
export const environment = {
  apiUrl: 'http://localhost:3000',
  authUrl: 'http://localhost:3001', // the auth server (fake-api/auth-server.js): bcrypt + JWT
};
