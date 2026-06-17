# Browser console/static notes

- Frontend URL checked: http://127.0.0.1:5173/admin/e-booklets
- Root URL checked: http://127.0.0.1:5173/
- Browser snapshot: empty page, element_count=0.
- DOM state: `<div id="root"></div>` stayed empty after navigation.
- Console messages on navigation: Vite `[vite] connecting...`, `[vite] connected.`
- Browser tool reported JS errors with empty message/source on direct navigation.
- Manual browser eval `import('/src/main.jsx')` returned: `ReferenceError: $RefreshReg$ is not defined` at `http://127.0.0.1:5173/src/components/ui/loading-spinner.jsx:12:1`.
- Visual screenshot captured through browser_vision showed a completely blank white page; the tool response did not expose a filesystem screenshot path.
- Build sanity check: `npm run build` in frontend completed successfully; warning only about large chunks and externalized `crypto` from `@embedpdf/snippet`.
