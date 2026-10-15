# 0019: Inviting people and organisation roles are open source

- Status: accepted
- Date: 2026-10-14

## Context

Decision 0017 put members and roles in Enterprise and left the open-source edition as "one team, everyone is an admin", with no way to invite a teammate. A team running VoiceGateway needs to add people from day one, and Langfuse keeps organisation-level roles free while charging for project-level roles.

## Options

1. Keep all member management in Enterprise: more to sell, but the free product cannot be shared with a team.
2. Invites and organisation roles in OSS, project-level roles in Enterprise.

## Decision

Option 2. This replaces the "Members and roles per project" row of 0017; the rest of 0017 stands.

| | OSS | Enterprise |
|---|---|---|
| Invite people by email | yes | yes |
| Organisation roles: Admin, Member, Viewer | yes | yes |
| Different roles per project | no | yes |

- Admin: everything, including settings, projects, keys and members.
- Member: reads all calls and changes project settings such as thresholds and tags.
- Viewer: reads calls and traces; changes nothing.

## Consequences

- Settings has a Members page under Organisation with the member list and an Invite form. Until the Phase 2 server sends email, invites are kept in the browser and marked pending.
- Roles per project stay a locked Enterprise row.
