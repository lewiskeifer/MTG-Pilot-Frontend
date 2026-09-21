/**
 * Which server the app talks to.
 *
 * Flip this one line to work against a backend running on this machine, and flip it back before
 * committing. It used to be a commented out URL in each of the three services, so switching
 * meant editing three files and remembering all three on the way back - and a half finished
 * switch pointed one service at localhost while the other two stayed on production.
 */
const USE_LOCAL_API = false;

export const API_HOST = USE_LOCAL_API ? 'http://localhost:8080' : 'https://mtgpilot.com:8443';
