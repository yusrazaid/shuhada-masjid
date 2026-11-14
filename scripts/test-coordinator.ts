import assert from "node:assert/strict";
import test from "node:test";
import {
  interpretCoordinatorMessage,
  parseFlexibleClockTime,
} from "../src/lib/coordinator-agent";
import { getLocalContentState } from "../src/lib/github-committer";

test("parseFlexibleClockTime normalizes 12h and 24h formats", () => {
  assert.equal(parseFlexibleClockTime("12:30 PM"), "12:30");
  assert.equal(parseFlexibleClockTime("1:20 pm"), "13:20");
  assert.equal(parseFlexibleClockTime("8:30 AM"), "08:30");
  assert.equal(parseFlexibleClockTime("13:45"), "13:45");
  assert.equal(parseFlexibleClockTime("invalid"), null);
});

test("Status and Help commands return clean replies without mutating", async () => {
  const state = getLocalContentState();
  const status = await interpretCoordinatorMessage("Status", state);
  assert.equal(status.kind, "status");
  assert.match(status.replyText, /Shuhada Foundation Live Status/);

  const help = await interpretCoordinatorMessage("Help", state);
  assert.equal(help.kind, "help");
  assert.match(help.replyText, /Shaheed Bilal Masjid/);
});

test("Announce and Clear announcement validate against announcementsSchema", async () => {
  const state = getLocalContentState();
  const announce = await interpretCoordinatorMessage(
    "Announce: Eid prayers at 8:30 AM and 9:30 AM at Warrenstown House",
    state,
  );
  assert.equal(announce.kind, "mutation");
  assert.equal(announce.mutation?.targetFile, "announcements");
  const updated = announce.mutation?.updatedContent as {
    announcements: { message: string; active: boolean }[];
  };
  assert.equal(updated.announcements[0]?.active, true);
  assert.match(updated.announcements[0]?.message ?? "", /Eid prayers/);

  const clear = await interpretCoordinatorMessage("Clear announcement", state);
  assert.equal(clear.kind, "mutation");
  assert.equal(clear.mutation?.targetFile, "announcements");
});

test("Jummah update normalizes afternoon PM times and updates prayer-config", async () => {
  const state = getLocalContentState();
  const jummah = await interpretCoordinatorMessage(
    "Set 2nd Jummah Khutbah 1:30 PM Iqamah 1:55 PM",
    state,
  );
  assert.equal(jummah.kind, "mutation");
  assert.equal(jummah.mutation?.targetFile, "prayer-config");
  const updated = jummah.mutation?.updatedContent as {
    jummah: { name: string; khutbah: string; iqamah: string }[];
  };
  assert.equal(updated.jummah[1]?.khutbah, "13:30");
  assert.equal(updated.jummah[1]?.iqamah, "13:55");
});

test("Add event validates ISO offset date and clears cleanly", async () => {
  const state = getLocalContentState();
  const added = await interpretCoordinatorMessage(
    "Add event: Community Iftar | 2026-03-07 18:00 | Family Iftar at Shaheed Bilal Masjid",
    state,
  );
  assert.equal(added.kind, "mutation");
  assert.equal(added.mutation?.targetFile, "events");
  const updated = added.mutation?.updatedContent as {
    events: { id: string; start: string }[];
  };
  assert.equal(updated.events[0]?.id, "community-iftar");
  assert.equal(updated.events[0]?.start, "2026-03-07T18:00:00+00:00");
});
