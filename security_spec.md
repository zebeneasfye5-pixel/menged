# Security Specification & Payload-First TDD (`security_spec.md`)

## 1. Data Invariants
1. **Identity Integrity**: Every client-created document (`vehicles`, `drivers`, `owners`, `queues`, `routes`, `safetyReports`, `payments`, `exitFees`, `settlements`, `contracts`) MUST bind `createdBy == request.auth.uid` and require `request.auth.token.email_verified == true`.
2. **Authority Admin Isolation**: Only verified authority admins (`zebeneasfye5@gmail.com` or UIDs listed in `/admins/{uid}`) may list/read/modify all-fleet PII collections (`drivers`, `owners`, `payments`, `exitFees`, `settlements`, `contracts`) or resolve/fine `safetyReports`.
3. **Immutable Ownership & Temporal Integrity**: `createdBy` and `createdAt` cannot be modified after creation; `createdAt == request.time` on create and `updatedAt == request.time` on update.
4. **No Blanket List Scraping**: Every `allow list` rule evaluates `resource.data` directly (either `resource.data.visibility == 'public'` or `resource.data.createdBy == request.auth.uid` or bootstrapped verified admin token) without calling `get()`/`exists()`.
5. **Terminal State Locking**: Once `payments.paymentStatus == 'completed'` or `settlements.status == 'paid'` or `contracts.isSigned == true`, non-admin users cannot modify the record.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Fail with `PERMISSION_DENIED`)
1. Unauthenticated read or write on `/vehicles/{id}` or `/payments/{id}`.
2. Spoofed `createdBy` (`createdBy: "someone_else_uid"`) during `create` on `/vehicles` or `/safetyReports`.
3. Unverified email (`email_verified: false`) attempting to pass admin or write gates.
4. Ghost/Shadow field injection (`{ ..., "isAdmin": true, "extraField": "hack" }`) rejected by `hasOnly(...)`.
5. Oversized document ID (`> 128` chars or special characters like `../admin`) rejected by `isValidId()`.
6. Oversized string payload (`> maxLength`) in `description`, `plateNumber`, or `fullName`.
7. Client-forged timestamp (`createdAt` or `updatedAt` != `request.time`).
8. Mutating `createdBy` or `createdAt` during an `update`.
9. Non-admin attempting to mark their own `/safetyReports/{id}` as `fine_issued` or `resolved`.
10. Non-admin attempting to edit a finalized `settlement` (`status == 'paid'`) or `contract` (`isSigned == true`).
11. Non-admin attempting `list` or `get` on `/users/{otherUserId}` or `/payments` belonging to another user.
12. Non-admin attempting to write directly to `/admins/{uid}`.
