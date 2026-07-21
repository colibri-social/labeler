# colibri-labeler

A standalone AT Protocol labeler service used to manually hand out badges (e.g. `team`, `play-store-tester`) to Colibri users. Badges are `com.atproto.label` labels served over the standard label firehose/query endpoints via [`@skyware/labeler`](https://github.com/skyware-js/labeler).

## One-time setup

1. Create a fresh atproto account dedicated to this labeler. **Do not use an existing personal or Colibri account**.
2. Convert it into a labeler and generate its label declarations:
   ```sh
   pnpm install
   pnpm dlx @skyware/labeler setup
   ```
   Follow the prompts (handle/app password, then define the label set). This writes the `app.bsky.labeler.service` declaration record and adds the `#atproto_label` signing key + `#atproto_labeler` service endpoint to the account's DID document.
3. Copy `.env.example` to `.env` and fill in:
   - `LABELER_DID` / `LABELER_SIGNING_KEY`: printed by the `setup` command.
   - `LABELER_DB_URL` / `LABELER_DB_TOKEN`: a remote libSQL database.
   - `LABELER_PORT`: defaults to `14831`.
   - `LABELER_HOST`: defaults to `0.0.0.0`.

## Running

```sh
pnpm dev                   # tsx watch, for local development
pnpm build && pnpm start   # production
```

The service must be reachable at a stable public HTTPS URL (matching the service endpoint declared in step 2), reverse-proxied with TLS. ATproto clients resolve the labeler's DID document to find this URL.

## Assigning a badge

Run the interactive TUI:

```sh
pnpm label
```

It walks you through: resolving a handle or DID, picking a badge (or entering a custom value), granting or revoking it, and a confirmation step before applying.

To define new label metadata (name, description, severity) rather than just applying existing ones, use the CLI instead:

```sh
pnpm dlx @skyware/labeler label add
```

Programmatically, granting/revoking is `server.createLabels({ uri: "did:plc:target-user" }, { create: ["team"] })` (use `negate` instead of `create` to revoke) — this is what `pnpm label` does under the hood.

## Reading badges

Any atproto client can read labels via:

- `com.atproto.label.queryLabels`: HTTP query by subject DID (used by the Colibri client, see `colibri.social/packages/client/src/atproto/labeler-lookup.ts`).
- `com.atproto.label.subscribeLabels`: WebSocket firehose, for live updates.
