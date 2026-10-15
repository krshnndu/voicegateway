# 0018: Show Enterprise settings as locked rows

- Status: accepted
- Date: 2026-10-14

## Context

Decision 0017 drew the line between OSS, Enterprise and Cloud, and said Settings would show OSS sections only until `ee/` exists. Once Settings was regrouped into Account, Organisation and Project, the owner wanted the Organisation group to show the whole picture, so a team can see what Enterprise adds where it would live.

## Options

1. Keep Enterprise sections hidden until `ee/` ships: a cleaner sidebar, but the upgrade path is invisible.
2. Show them in the Organisation group as locked rows: the scope model is visible today, at the cost of rows that do nothing in the open-source edition.

## Decision

Option 2. This replaces the Settings consequence of 0017; the rest of 0017 stands.

## Consequences

- Members, Single sign-on, Audit log and License appear under Organisation with a lock and an "Enterprise" badge. Each says what it does and what the open-source edition does instead. None of them gates or hides an OSS feature.
- When `ee/` ships, the same rows become the real sections; a license key unlocks them.
