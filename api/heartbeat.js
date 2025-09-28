// api/heartbeat.js
export default async function handler(req, res) {
  const { GITHUB_TOKEN, OWNER, REPO, BRANCH, FILE_PATH } = process.env;

  // Ambil konten lama
  const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(FILE_PATH)}?ref=${BRANCH}`;
  let sha = undefined;
  let currentContent = "";
  const getResp = await fetch(getUrl, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, "User-Agent": "vercel-cron" },
  });

  if (getResp.ok) {
    const data = await getResp.json();
    sha = data.sha;
    currentContent = Buffer.from(data.content, "base64").toString("utf-8");
  }

  // Tambah baris heartbeat baru
  const now = new Date().toISOString();
  const newContent = currentContent + `Update: ${now}\n`;
  const b64 = Buffer.from(newContent, "utf-8").toString("base64");

  // Commit ke GitHub
  const putUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`;
  const body = {
    message: `auto: heartbeat ${now}`,
    content: b64,
    branch: BRANCH,
    sha,
  };

  const putResp = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "vercel-cron",
    },
    body: JSON.stringify(body),
  });

  if (!putResp.ok) {
    const err = await putResp.text();
    return res.status(500).json({ ok: false, error: err });
  }

  return res.status(200).json({ ok: true, message: `Committed at ${now}` });
}
