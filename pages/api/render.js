import { renderUserCode } from "../../lib/renderer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { code } = req.body;

  try {
    const result = renderUserCode(code);

    // 🔥 If result is string → executed as shell command
    if (typeof result === "string") {
      const output = execSync(result).toString();
      return res.json({ output });
    }

    return res.json({ output: String(result) });
  } catch (e) {
    return res.json({ error: e.toString() });
  }
}
