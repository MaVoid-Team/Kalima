# Repository Guidelines                                       
                                                              
## Project Structure & Module Organization                    
This development app mirrors the Kalima platform split into ro
ot, backend, and frontend Node workspaces, each managed with `
package-lock.json`; use `npm` commands only. Frontend source i
s in `frontend/src`, public assets in `frontend/public`, and V
ite/TypeScript configuration in the frontend folder. The backe
nd uses TypeScript under `backend/src`, retains a legacy `back
end/server.js`, and groups implementation in `backend/controll
ers`, `backend/routes`, `backend/models`, `backend/middleware`
, `backend/utils`, and `backend/validations`. Put backend test
s in `backend/tests`. Documentation and handoff artifacts are 
in `docs`, `Documents`, and `reports`; production compose conf
iguration is `docker-compose.prod.yml`.                       
                                                              
## Build, Test, and Development Commands                      
At the repository root, `npm start`, `npm run build`, and `npm
 test` invoke the root React scripts. For frontend development
, run `cd frontend && npm run dev`; verify with `npm run build
`, `npm run lint`, and `npm run preview`. For backend developm
ent, run `cd backend && npm run dev` for the TypeScript dev se
rver, `npm run build` for `tsc`, `npm start` for the built ser
ver, and `npm test` for Jest.                                 
                                                              
## Coding Style & Naming Conventions                          
Follow the existing React/Vite style in `frontend/src`: small 
components, hooks for local state and side effects, and existi
ng localization patterns for visible strings. TypeScript confi
gs are present for the frontend and backend, so preserve exist
ing types and avoid weakening interfaces when touching `.ts` o
r `.tsx` code. Use `frontend/eslint.config.js` via `npm run li
nt` for frontend style checks. Backend changes should keep rou
te declarations in `routes`, request orchestration in `control
lers`, and data access in `models`, services, or existing util
ities.                                                        
                                                              
## Testing Guidelines                                         
Keep backend tests under `backend/tests`, following the existi
ng feature directories such as `cart` and `cart-purchase`. Kal
ima-Dev uses Jest through backend `npm test`; add narrow tests
 for changed controller behavior, validation, route responses,
 and model interactions.                                      
                                                              
## Commit & Pull Request Guidelines                           
Prefer short conventional-style commits such as `feat:`, `fix:
`, and `feat(scope):`. The history contains some loose message
s; keep new commits descriptive and reviewable. PRs should inc
lude a change summary, commands run and results, deployment or
 environment impact, linked issue when applicable, and screens
hots or screen recordings for UI changes.                     