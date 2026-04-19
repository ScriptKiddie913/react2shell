export function renderUserCode(input) {
  // naive "security"
  if (
    input.includes("require") ||
    input.includes("process") ||
    input.includes("child_process")
  ) {
    throw new Error("Blocked keyword detected 🚫");
  }

  // 🔥 VULN: dynamic execution
  const fn = new Function(`return (${input})`);
  return fn();
}
