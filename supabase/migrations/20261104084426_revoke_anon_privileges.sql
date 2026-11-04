/*
# Revoke anon role privileges on all tables

## Changes
- Revoke all privileges (SELECT, INSERT, UPDATE, DELETE) from the `anon` role
  on both `profiles` and `appointments` tables.
- This is a sign-in-only application: all access goes through the `authenticated`
  role with ownership-scoped RLS policies. The `anon` role has no policies and
  should not have table-level grants either.

## Security
- Removes unnecessary `anon` grants. RLS already blocked `anon` access (no
  matching policies), but removing the grants ensures defense-in-depth.
*/

REVOKE ALL ON profiles FROM anon;
REVOKE ALL ON appointments FROM anon;