export function buildNarrative(
  title,
  summary
) {

  if (!summary) {
    return "Historical information is limited for this Echo.";
  }

  return `
Why this Echo matters

${summary}
`;
}