import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { contentSchemas } from "../src/lib/schemas";

const root = process.cwd();
const contentDirectory = join(root, "content");
const outputDirectory = join(root, "public", "schemas");

mkdirSync(outputDirectory, { recursive: true });

for (const [fileName, schema] of Object.entries(contentSchemas)) {
  const sourcePath = join(contentDirectory, fileName + ".json");
  const raw = JSON.parse(readFileSync(sourcePath, "utf8")) as unknown;
  const result = schema.safeParse(raw);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => "  - " + issue.path.join(".") + ": " + issue.message)
      .join("\n");
    throw new Error("Invalid content in " + fileName + ".json:\n" + details);
  }

  const jsonSchema = zodToJsonSchema(schema, {
    name: fileName.replace(/(^|-)([a-z])/g, (_match, _dash: string, letter: string) => letter.toUpperCase()) + "Content",
    target: "jsonSchema7",
  });
  writeFileSync(
    join(outputDirectory, fileName + ".schema.json"),
    JSON.stringify(jsonSchema, null, 2) + "\n",
  );
  console.log("Validated " + fileName + ".json");
}
