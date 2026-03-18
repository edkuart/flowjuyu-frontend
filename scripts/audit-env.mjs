/**
 * scripts/audit-env.mjs
 *
 * Audits the src/ directory for dangerous environment variable and fetch
 * patterns that cause "TypeError: Invalid URL" during next build.
 *
 * Usage:
 *   node scripts/audit-env.mjs
 *   node scripts/audit-env.mjs --fix   (auto-replaces ?? "" with || "http://localhost:8800")
 *
 * Add to package.json:
 *   "audit:env": "node scripts/audit-env.mjs",
 *   "audit:env:fix": "node scripts/audit-env.mjs --fix"
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

// ── Config ────────────────────────────────────────────────────────────────────

const SRC_DIR    = "./src"
const EXTENSIONS = new Set([".ts", ".tsx"])
const FIX_MODE   = process.argv.includes("--fix")

// ── Pattern definitions ───────────────────────────────────────────────────────

const PATTERNS = [
  {
    id:       "null-coalesce-empty",
    severity: "CRITICAL",
    label:    "?? \"\" fallback — silent empty string",
    regex:    /process\.env\.\w+\s*\?\?\s*""/g,
    why:      "?? only falls through on null/undefined. An explicit empty string passes silently.",
    fix:      (line) => line.replace(/(\?\?)\s*""/g, '|| "http://localhost:8800"'),
  },
  {
    id:       "non-null-assertion",
    severity: "CRITICAL",
    label:    "! non-null assertion — removed by TypeScript, undefined survives at runtime",
    regex:    /process\.env\.NEXT_PUBLIC_\w+!/g,
    why:      "TypeScript removes ! at compile time. The value is still undefined in the bundle.",
    fix:      null, // manual fix required
  },
  {
    id:       "no-fallback",
    severity: "HIGH",
    label:    "Direct interpolation with no fallback",
    regex:    /`\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g,
    why:      "If undefined, template literal produces 'undefined/api/...' which is an invalid URL in Node.js.",
    fix:      (line) =>
      line.replace(
        /\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g,
        '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}'
      ),
  },
  {
    id:       "module-scope-nullish",
    severity: "HIGH",
    label:    "?? with non-empty fallback at module scope (should be ||)",
    regex:    /^(?!.*\/\/).*process\.env\.NEXT_PUBLIC_\w+\s*\?\?\s*"http/m,
    why:      "?? doesn't handle explicit empty strings. Use || for consistent fallback behavior.",
    fix:      (line) => line.replace(/\?\?\s*"http/g, '|| "http'),
  },
  {
    id:       "next-auth-static-import",
    severity: "MEDIUM",
    label:    "Static import of next-auth/react at module level",
    regex:    /^import\s.*from\s+['"]next-auth\/react['"]/gm,
    why:      "next-auth/react is client-only. Static import in universal modules causes SSR errors.",
    fix:      null, // requires manual dynamic import refactor
  },
  {
    id:       "relative-fetch",
    severity: "HIGH",
    label:    "fetch() with relative path — invalid in Node.js",
    regex:    /fetch\s*\(\s*['"`]\/(?!\/)/g,
    why:      "Node.js fetch requires absolute URLs. Relative paths crash with Invalid URL.",
    fix:      null,
  },
]

// ── File walker ───────────────────────────────────────────────────────────────

function* walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || entry === "node_modules" || entry === ".next") continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) yield* walkDir(full)
    else if (EXTENSIONS.has(extname(entry))) yield full
  }
}

// ── Audit ─────────────────────────────────────────────────────────────────────

const findings = []
let filesScanned = 0

for (const filePath of walkDir(SRC_DIR)) {
  filesScanned++
  let content = readFileSync(filePath, "utf8")
  const lines  = content.split("\n")
  let modified = false

  for (const pattern of PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line  = lines[i]
      // Reset lastIndex for global regexes
      pattern.regex.lastIndex = 0
      if (pattern.regex.test(line)) {
        findings.push({
          file:     filePath.replace(/\\/g, "/"),
          line:     i + 1,
          code:     line.trim(),
          ...pattern,
        })

        if (FIX_MODE && pattern.fix) {
          lines[i] = pattern.fix(line)
          modified  = true
        }
      }
    }
  }

  if (FIX_MODE && modified) {
    writeFileSync(filePath, lines.join("\n"), "utf8")
    console.log(`  ✅ Fixed: ${filePath.replace(/\\/g, "/")}`)
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

const bySeverity = { CRITICAL: [], HIGH: [], MEDIUM: [] }
for (const f of findings) bySeverity[f.severity]?.push(f)

console.log("\n" + "─".repeat(72))
console.log("  ENV & FETCH AUDIT REPORT")
console.log("─".repeat(72))
console.log(`  Files scanned: ${filesScanned}`)
console.log(`  Issues found:  ${findings.length}`)
console.log(`  CRITICAL:      ${bySeverity.CRITICAL.length}`)
console.log(`  HIGH:          ${bySeverity.HIGH.length}`)
console.log(`  MEDIUM:        ${bySeverity.MEDIUM.length}`)
console.log("─".repeat(72) + "\n")

for (const [sev, items] of Object.entries(bySeverity)) {
  if (!items.length) continue
  const icon = sev === "CRITICAL" ? "🔴" : sev === "HIGH" ? "🟡" : "🔵"
  console.log(`${icon}  ${sev} (${items.length} findings)\n`)

  for (const f of items) {
    console.log(`  📄 ${f.file}:${f.line}`)
    console.log(`     Pattern:  ${f.label}`)
    console.log(`     Code:     ${f.code}`)
    console.log(`     Why:      ${f.why}`)
    if (!f.fix) console.log(`     Action:   ⚠️  Manual fix required`)
    console.log()
  }
}

if (findings.length === 0) {
  console.log("  ✅ No dangerous patterns found. Build should be safe.\n")
} else if (!FIX_MODE) {
  console.log("  💡 Run with --fix to auto-correct fixable patterns:")
  console.log("     node scripts/audit-env.mjs --fix\n")
}

// Fail CI if critical issues exist
if (bySeverity.CRITICAL.length > 0) {
  process.exit(1)
}
