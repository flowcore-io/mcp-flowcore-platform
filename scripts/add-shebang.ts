#!/usr/bin/env bun
/**
 * This script adds a shebang line to the dist/index.js file
 * It's used as part of the build process
 */

import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

// Read the built file
const filePath = join("dist", "index.js")
const content = await readFile(filePath, "utf-8")

// Add shebang line if it doesn't exist
if (!content.startsWith("#!/usr/bin/env node")) {
  const newContent = `#!/usr/bin/env node\n${content}`
  await writeFile(filePath, newContent)
  console.log("✅ Added shebang line to dist/index.js")
} else {
  console.log("✅ Shebang line already exists in dist/index.js")
}
