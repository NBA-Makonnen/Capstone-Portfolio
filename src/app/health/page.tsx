async function getGitHubStatus() {
  const res = await fetch("https://api.github.com/users/NBA-Makonnen", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return { ok: false, message: `GitHub API returned ${res.status}` };
  }
  const data = await res.json();
  return { ok: true, publicRepos: data.public_repos, login: data.login };
}

export default async function HealthPage() {
  const status = await getGitHubStatus();

  return (
    <section className="px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Health Check</h1>
      {status.ok ? (
        <p>
          ✅ GitHub API reachable — <strong>{status.login}</strong> has{" "}
          <strong>{status.publicRepos}</strong> public repos.
        </p>
      ) : (
        <p>❌ {status.message}</p>
      )}
    </section>
  );
}