/*
# Revoke EXECUTE on trigger functions from authenticated

## Changes
- Revoke EXECUTE on `handle_new_user()` and `set_updated_at()` from the
  `authenticated` role. These are trigger-only functions and should not be
  callable directly via the Data API RPC endpoint.
- The other SECURITY DEFINER functions (`book_appointment`, `upgrade_to_staff`,
  `update_appointment_status`) remain callable by `authenticated` as they are
  designed to be invoked from the frontend with internal authorization checks.
## Security
- Tightens EXECUTE permissions on internal trigger functions.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated;