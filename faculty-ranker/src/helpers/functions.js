function normalizeFacultyData(raw) {
  if (!raw || !raw.data) return [];
  return raw.data.map((item) => {
    const a = item.attributes || {};
    return {
      id: item.id,
      name: a.Name || "Unknown",
      designation: a.Designation || "",
      department: a.Department || "",
      image: a.Image || "",
      specialization: a.Research_area_of_specialization || "",
      rawAttributes: a,
    };
  });
}

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

function levenshtein(a, b) {
  a = normalize(a);
  b = normalize(b);
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function fuzzyMatch(query, text) {
  const q = normalize(query);
  const t = normalize(text);
  if (!q) return true;
  if (t.includes(q)) return true;

  const words = t.split(/\s+/).filter(Boolean);
  for (const w of words) {
    const dist = levenshtein(q, w);
    const maxLen = Math.max(q.length, w.length);
    const threshold = Math.max(1, Math.floor(maxLen / 3));
    if (dist <= threshold) return true;
  }
  return false;
}

export { normalizeFacultyData, fuzzyMatch, normalize, levenshtein };