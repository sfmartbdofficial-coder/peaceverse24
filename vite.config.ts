import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const suppressWsPlugin = () => ({
  name: 'suppress-hmr-ws-error',
  transformIndexHtml: {
    order: 'pre' as const,
    handler() {
      return [
        {
          tag: 'script',
          attrs: { type: 'text/javascript' },
          children: `
            (function() {
              var origError = console.error;
              console.error = function() {
                var str = Array.prototype.slice.call(arguments).map(function(a) {
                  return (a && a.message) || String(a);
                }).join(' ');
                if (str.indexOf('WebSocket') !== -1 || str.indexOf('vite-hmr') !== -1) {
                  return;
                }
                return origError.apply(console, arguments);
              };

              var origWarn = console.warn;
              console.warn = function() {
                var str = Array.prototype.slice.call(arguments).map(function(a) {
                  return (a && a.message) || String(a);
                }).join(' ');
                if (str.indexOf('WebSocket') !== -1 || str.indexOf('vite-hmr') !== -1) {
                  return;
                }
                return origWarn.apply(console, arguments);
              };

              window.addEventListener('unhandledrejection', function(event) {
                var msg = (event.reason && (event.reason.message || event.reason.toString())) || '';
                if (msg.indexOf('WebSocket') !== -1) {
                  event.preventDefault();
                }
              });

              window.addEventListener('error', function(event) {
                var msg = event.message || '';
                if (msg.indexOf('WebSocket') !== -1) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                  return true;
                }
              }, true);

              try {
                var OrigWS = window.WebSocket;
                if (OrigWS) {
                  window.WebSocket = function(url, protocols) {
                    var isHmr = (typeof url === 'string' && (url.indexOf('vite') !== -1 || url.indexOf('hmr') !== -1)) ||
                                protocols === 'vite-hmr';
                    if (isHmr) {
                      return {
                        readyState: 1,
                        send: function() {},
                        close: function() {},
                        addEventListener: function() {},
                        removeEventListener: function() {},
                        dispatchEvent: function() { return true; }
                      };
                    }
                    return protocols !== undefined ? new OrigWS(url, protocols) : new OrigWS(url);
                  };
                  window.WebSocket.prototype = OrigWS.prototype;
                  window.WebSocket.CONNECTING = OrigWS.CONNECTING;
                  window.WebSocket.OPEN = OrigWS.OPEN;
                  window.WebSocket.CLOSING = OrigWS.CLOSING;
                  window.WebSocket.CLOSED = OrigWS.CLOSED;
                }
              } catch(e) {}
            })();
          `,
          injectTo: 'head-prepend' as const,
        },
      ];
    },
  },
});

export default defineConfig(() => {
  return {
    plugins: [
      suppressWsPlugin(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    server: {
      // HMR is disabled in AI Studio to prevent WebSocket closed errors
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
