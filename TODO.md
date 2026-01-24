# Project Readiness TODOs

## 🔴 High Priority (Blockers)
- [ ] **Database**: Add `Tournament` and `TournamentMatch` models to `schema.prisma`.
- [ ] **Backend**: Refactor `controllers/chat.ts` -> Extract logic to `services/chat.ts`.
- [ ] **Game**: Implement server-side validation for paddle speed/movement (Anti-cheat).
- [ ] **Game**: Persist Tournament state to Database (currently in-memory only).

## 🟡 Medium Priority (Required for Spec)
- [ ] **Frontend**: Verify Tournament UI connects to new Backend endpoints.
- [ ] **Security**: Audit `handlePlayerMove` payload validation types (Zod?).
- [ ] **UX**: Add "Re-connect" feature for disconnects in `GameService`.

## 🟢 Low Priority (Polish)
- [ ] **Code Quality**: Add distinct `GameGateway` instead of mixing WS in Service/Controller.
- [ ] **Docs**: Update API definition (Swagger) for new Tournament routes.
