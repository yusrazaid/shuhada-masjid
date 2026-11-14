import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { interpretCoordinatorMessage } from "../src/lib/coordinator-agent";
import { buildEventsIcs, buildPresenceJson } from "../src/lib/feed-builder";
import { getLocalContentState } from "../src/lib/github-committer";

async function main() {
  const instruction = process.argv.slice(2).join(" ").trim();
  if (!instruction) {
    console.error('Usage: npm run coordinator -- "<plain-English instruction>"');
    process.exit(1);
  }

  const state = getLocalContentState();
  const result = await interpretCoordinatorMessage(instruction, state);

  console.log(result.replyText);

  if (result.kind === "mutation" && result.mutation) {
    const root = process.cwd();
    const targetPath = join(root, "content", `${result.mutation.targetFile}.json`);
    writeFileSync(
      targetPath,
      JSON.stringify(result.mutation.updatedContent, null, 2) + "\n",
    );

    const nextState = {
      ...state,
      [result.mutation.targetFile]: result.mutation.updatedContent,
    };
    writeFileSync(join(root, "public", "presence.json"), buildPresenceJson(nextState));
    writeFileSync(join(root, "public", "events.ics"), buildEventsIcs(nextState));

    console.log(
      `\nUpdated content/${result.mutation.targetFile}.json, public/presence.json, and public/events.ics.`,
    );
  }
}

void main();
