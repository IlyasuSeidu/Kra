# Authentication Flows

## Identity Model
Firebase Authentication should handle identity proof, while the backend should resolve roles and station assignments.

## Supported Flows
- Sender sign up and sign in.
- Staff sign in after admin provisioning.
- Receiver delivery-link access without persistent account creation.
- Password reset or recovery.
- Session refresh.

## Recommended Methods
- Phone number for Ghana-friendly sender onboarding.
- Email and password for admin users.
- Optional phone plus PIN or password for staff if operationally appropriate.
- Secure delivery link plus phone verification for receiver-sensitive access in v1.

## Rule
Authentication proves who a user is. It does not, by itself, prove what that user may do.

## Approved V1 Decisions
- Receivers do not create or maintain full accounts in v1.
- Receiver access is delivery-scoped rather than account-scoped.
- Receiver link access may be granted through:
  - secure SMS link
  - sender-shared secure link
- Any action that reveals sensitive delivery detail or confirms receipt must require phone-based verification tied to the delivery record.

## Staff Sign-In Methods
- Sender: phone OTP
- Driver: provisioned phone number plus PIN
- Station Operator: provisioned phone number plus PIN
- Doorstep Personnel: provisioned phone number plus PIN
- Admin roles: email and password plus MFA

## Recovery And Lockout
- Sender recovery: phone OTP re-verification
- Staff recovery: admin-issued PIN reset
- Admin recovery: email reset plus MFA challenge
- Lockout after `5` failed attempts in `15 minutes`

## Provisioning Rule
- Staff accounts are created by `super_admin`.
- Role and station assignment are mandatory before first sign-in.
- Inactive staff sessions are revoked immediately on offboarding.

## Device And Session Policy
- Sender session duration: `30 days` unless revoked
- Staff session duration: `12 hours`
- Admin session duration: `8 hours`
- Shared-device use is allowed only for station devices that require explicit logout between operators

## Baseline Status
This file is now concrete enough to drive auth implementation and staff provisioning.
