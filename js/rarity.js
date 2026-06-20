export function getEchoRarity(echo) {

  const type =
    (echo.type || "").toLowerCase();

  if (
    type.includes("battle") ||
    type.includes("battlefield")
  ) {
    return "⚔️ Epic";
  }

  if (
    type.includes("castle")
  ) {
    return "🏰 Rare";
  }

  if (
    type.includes("archaeological")
  ) {
    return "🏺 Legendary";
  }

  if (
    type.includes("memorial")
  ) {
    return "🪖 Rare";
  }

  return "📜 Common";
}