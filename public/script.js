// -----------------------------
// Fetch all links
// -----------------------------
async function loadLinks() {
  const res = await fetch('/api/links');
  return res.json();
}

// -----------------------------
// Render dashboard table
// -----------------------------
function renderTable(rows) {
  const wrap = document.getElementById('tableWrap');

  if (!rows.length) {
    wrap.innerHTML = '<p>No links found.</p>';
    return;
  }

  let html = `
    <table>
      <tr>
        <th>Code</th>
        <th>URL</th>
        <th>Clicks</th>
        <th>Last Click</th>
        <th>Actions</th>
      </tr>
  `;

  rows.forEach(r => {
    const lastClick = r.last_clicked
      ? new Date(r.last_clicked.replace(" ", "T")).toLocaleString()
      : "-";

    html += `
      <tr>
        <td>
          <a href="/${r.code}" target="_blank">${r.code}</a>
        </td>

        <td class="truncate">
          <a href="${r.url}" target="_blank">${r.url}</a>
        </td>

        <td>${r.clicks}</td>
        <td>${lastClick}</td>

        <td>
          <button onclick="deleteCode('${r.code}')">Delete</button>
        </td>
      </tr>
    `;
  });

  html += '</table>';
  wrap.innerHTML = html;
}

// -----------------------------
// Delete a link
// -----------------------------
async function deleteCode(code) {
  if (!confirm("Delete " + code + "?")) return;

  const res = await fetch("/api/links/" + code, { method: "DELETE" });

  if (res.status === 204) {
    alert("Deleted!");
    loadAndRender();
  } else {
    const err = await res.json();
    alert("Delete failed: " + err.error);
  }
}


// -----------------------------
// Handle search + reload table
// -----------------------------
async function loadAndRender() {
  const search = document.getElementById("search").value.toLowerCase();
  const rows = await loadLinks();

  const filtered = rows.filter(r =>
    r.code.toLowerCase().includes(search) ||
    r.url.toLowerCase().includes(search)
  );

  renderTable(filtered);
}

// -----------------------------
// On page load
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadAndRender();

  // search input event
  document.getElementById("search").addEventListener("input", loadAndRender);

  // create form submit handler
  document.getElementById("createForm").addEventListener("submit", async e => {
    e.preventDefault();

    const url = document.getElementById("url").value.trim();
    const code = document.getElementById("code").value.trim();
    const msg = document.getElementById("message");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code: code || undefined })
    });

    if (res.status === 201) {
      const d = await res.json();
      msg.textContent = `Created: /${d.code}`;
      document.getElementById("url").value = "";
      document.getElementById("code").value = "";
      loadAndRender();
    } else {
      const err = await res.json();
      msg.textContent = err.error;
    }
  });
});
