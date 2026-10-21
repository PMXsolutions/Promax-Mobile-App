# PromaxCare staff mobile journey matrix

Date: 21 October 2026. Follow-up after the read-only reviews of `main` at `de4eb2f`.

Sign-in and session work is pull request 9. Roster, clock, and report drafts are pull request 10, including the later clock-in tap guard. The single acceptance matrix is `docs/staff-journey-matrix.md` on `cursor/mobile-acceptance-matrix-65b8`. This branch is profile, documents, trip mileage, and notification taps. Care OS branches were not edited. No mileage, document, email, push, or store submission was sent.

Follow-up on this branch: emergency and other-info edits use the same signed-in staff check as personal profile. A document detail is requested only after that document id is in the signed-in staff member's document list, and a payload still needs a matching user id or a matching company id. A shift is shown only when both its staff id and company id match the session, so a shift with either id missing cannot be clocked. Hosted denial was not run.

## Inspector evidence now covered here

| Source | Gap on main | Status on this branch |
| --- | --- | --- |
| [Documents profile gaps](bc-bcc55231-93af-5142-b9e7-3dff489bda35) | Profile tab error hidden; employment salary can throw; personal date of birth formatted before data exists; profile edit links had a trailing space; another staff id could be opened; document Others could submit blank; add errors were generic; download status was invisible; delete had no confirm; document detail had no error state; documents list was blank without a staff id | Lab for the pure checks. Screen wiring is in this branch. Device Blocked |
| [Trip maps mileage gaps](bc-cb08bea5-1f9f-5154-877a-ff2f40381344) | Save called `fill_mileage` with start 0 and the GPS distance as end. Resume reset the trip clock. Location denial at open was silent | Mileage is sent only when the end odometer is greater than a positive start. GPS distance stays labelled as an estimate. Resume keeps the original start. Opening a trip without location permission explains that tracking stays off. Device Blocked. Care OS branch `cursor/care-os-uat-app-id-466d` was not edited |
| [Notification deep link gaps](bc-5f87a3cf-791b-543e-acc9-9f7095c630e3) | A notification tap did nothing. Permission denial and a simulator raised a blocking alert. A missing project id threw | A tap opens the shift only when the payload includes a shift id. Otherwise it opens the inbox. Registration returns quietly when permission, a device, or a project id is missing, so it does not cover the staff UI. No push was sent. Device Blocked |
| [Release provenance inspector](bc-57d2ac8c-b8ed-584e-9f0e-c6132cb6826e) | `package.json` version `1.0.0` differs from `app.json` `1.1.0`. Runtime version and EAS remote version can diverge. `google-services.json` is gitignored. Several controls are under 44 points | Version, runtime, and Firebase file were left unchanged so this branch does not invent a store build. Profile links now have a button label. Other touch-size gaps remain |

## Verification

`npx jest --watchAll=false --forceExit --testPathPattern=profile-trip-follow-up` on 21 October 2026: 1 suite, 6 tests, passed. A pass is a unit pass only.

Android, iOS, disposable-user save, and hosted web read-back remain Blocked. Play production changes were not submitted.
