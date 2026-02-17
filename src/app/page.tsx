"use client";

import { useEffect, useState } from "react";

function getBookmarkletCode(appUrl: string) {
  // The bookmarklet scrapes read.amazon.com/notebook and POSTs data to our API.
  // It must be a self-contained IIFE that runs in the Amazon page context.
  const code = `
(async function() {
  if (!location.hostname.endsWith('amazon.com') || !location.pathname.includes('notebook')) {
    alert('Please navigate to read.amazon.com/notebook first, then click this bookmarklet.');
    return;
  }

  const APP_URL = '${appUrl}';

  /* --- overlay UI --- */
  const overlay = document.createElement('div');
  overlay.id = 'kh-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:12px;padding:32px 40px;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
  box.innerHTML = '<h2 style="margin:0 0 8px;font-size:20px;">Kindle Highlights</h2><p id="kh-status" style="color:#666;margin:0;font-size:14px;">Starting...</p><div style="margin-top:16px;height:4px;background:#eee;border-radius:2px;overflow:hidden;"><div id="kh-bar" style="height:100%;width:0%;background:#3b82f6;transition:width 0.3s;border-radius:2px;"></div></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const status = document.getElementById('kh-status');
  const bar = document.getElementById('kh-bar');
  function progress(msg, pct) { status.textContent = msg; bar.style.width = pct + '%'; }

  try {
    /* --- scrape book list from sidebar --- */
    progress('Reading your library...', 5);
    const bookEls = document.querySelectorAll('.kp-notebook-library-each-book');
    if (!bookEls.length) { progress('No books found. Make sure you are on read.amazon.com/notebook.', 0); return; }

    const bookList = [];
    bookEls.forEach(function(el) {
      var asinEl = el.querySelector('[id^="B0"], [id^="B1"]') || el;
      var asin = '';
      var inner = el.innerHTML;
      var m = inner.match(/asin['"\\s]*:['"\\s]*([A-Z0-9]{10})/);
      if (m) { asin = m[1]; }
      if (!asin) {
        var id = el.id || asinEl.id;
        if (id && /^[A-Z0-9]{10}$/.test(id)) asin = id;
      }
      if (!asin) {
        var link = el.querySelector('a[href*="asin="]');
        if (link) { var u = new URL(link.href, location.origin); asin = u.searchParams.get('asin') || ''; }
      }
      if (!asin) return;

      var titleEl = el.querySelector('h2') || el.querySelector('span.kp-notebook-searchable');
      var authorEl = el.querySelector('p:not(.kp-notebook-searchable)') || el.querySelector('p');
      var imgEl = el.querySelector('img');
      bookList.push({
        asin: asin,
        title: titleEl ? titleEl.textContent.trim() : 'Unknown Title',
        author: authorEl ? authorEl.textContent.trim() : '',
        imageUrl: imgEl ? imgEl.src : null
      });
    });

    if (!bookList.length) { progress('Could not parse books. DOM may have changed.', 0); return; }
    progress('Found ' + bookList.length + ' books', 10);

    /* --- fetch highlights for each book --- */
    var allBooks = [];
    for (var i = 0; i < bookList.length; i++) {
      var b = bookList[i];
      var pct = 10 + Math.round((i / bookList.length) * 85);
      progress('Fetching ' + (i + 1) + '/' + bookList.length + ': ' + b.title.substring(0, 40), pct);

      var highlights = [];
      var pageUrl = '/notebook?asin=' + b.asin + '&contentLimitState=&';

      while (pageUrl) {
        var resp = await fetch(pageUrl, { credentials: 'include' });
        var html = await resp.text();
        var doc = new DOMParser().parseFromString(html, 'text/html');

        /* better title/author from the detail page */
        if (highlights.length === 0) {
          var t = doc.querySelector('h3.kp-notebook-metadata');
          var a = doc.querySelector('p.kp-notebook-metadata');
          if (t) b.title = t.textContent.trim();
          if (a) b.author = a.textContent.trim().replace(/^By:\\s*/i, '');
        }

        var rows = doc.querySelectorAll('#kp-notebook-annotations .a-row');
        rows.forEach(function(row) {
          var hEl = row.querySelector('#highlight');
          if (!hEl || !hEl.textContent.trim()) return;
          var nEl = row.querySelector('#note span:last-child');
          var locEl = row.querySelector('#annotationNoteHeader');
          var colEl = row.querySelector('#annotationHighlightHeader');
          highlights.push({
            id: b.asin + '-' + highlights.length,
            text: hEl.textContent.trim(),
            note: nEl && nEl.textContent.trim() ? nEl.textContent.trim() : null,
            location: locEl ? locEl.textContent.trim() : null,
            color: colEl ? colEl.textContent.trim().toLowerCase().replace(/\\s*highlight.*$/i, '') : null
          });
        });

        /* pagination */
        var nextEl = doc.querySelector('#kp-notebook-annotations-next-page-start');
        var limitEl = doc.querySelector('#kp-notebook-content-limit-state');
        if (nextEl && nextEl.value) {
          pageUrl = '/notebook?asin=' + b.asin + '&contentLimitState=' + encodeURIComponent(limitEl ? limitEl.value : '') + '&index=' + nextEl.value;
        } else {
          pageUrl = null;
        }
      }

      allBooks.push({
        asin: b.asin,
        title: b.title,
        author: b.author,
        imageUrl: b.imageUrl,
        highlightCount: highlights.length,
        lastImported: new Date().toISOString(),
        highlights: highlights
      });
    }

    /* --- send to app --- */
    progress('Sending to app...', 97);
    var res = await fetch(APP_URL + '/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ books: allBooks })
    });

    if (res.ok) {
      progress('Done! Opening your library...', 100);
      setTimeout(function() { window.open(APP_URL + '/library', '_blank'); overlay.remove(); }, 800);
    } else {
      /* fallback: download as JSON */
      progress('Could not reach app. Downloading JSON file instead...', 100);
      var blob = new Blob([JSON.stringify({ books: allBooks }, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url; link.download = 'kindle-highlights.json';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function() { overlay.remove(); }, 2000);
    }
  } catch (err) {
    progress('Error: ' + err.message, 0);
    console.error(err);
  }
})();
`.trim();

  return "javascript:" + encodeURIComponent(code);
}

export default function HomePage() {
  const [bookmarklet, setBookmarklet] = useState("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    setBookmarklet(getBookmarkletCode(window.location.origin));
  }, []);

  async function handleUpload() {
    if (!jsonFile) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const text = await jsonFile.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setUploadMsg(`Imported ${result.imported} books.`);
        setTimeout(() => (window.location.href = "/library"), 1000);
      } else {
        const err = await res.json();
        setUploadMsg("Error: " + err.error);
      }
    } catch (e) {
      setUploadMsg("Invalid JSON file: " + (e as Error).message);
    }
    setUploading(false);
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-stone-800">
          Kindle Highlights
        </h1>
        <p className="mt-2 text-stone-500">
          Export and browse your Kindle highlights in a clean interface
        </p>
      </section>

      {/* Bookmarklet method */}
      <section className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-stone-800">
          Import from Amazon
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Use the bookmarklet to pull highlights directly from your Amazon
          Kindle Notebook.
        </p>

        <ol className="mt-6 space-y-4 text-sm text-stone-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              1
            </span>
            <span>
              Drag this link to your bookmarks bar:{" "}
              {bookmarklet ? (
                <a
                  href={bookmarklet}
                  onClick={(e) => e.preventDefault()}
                  className="inline-block rounded bg-blue-600 px-3 py-1 font-medium text-white hover:bg-blue-700"
                >
                  Get Highlights
                </a>
              ) : (
                <span className="text-stone-400">Loading...</span>
              )}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              2
            </span>
            <span>
              Go to{" "}
              <a
                href="https://read.amazon.com/notebook"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline"
              >
                read.amazon.com/notebook
              </a>{" "}
              and sign in with your Amazon account.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              3
            </span>
            <span>
              Click the <strong>Get Highlights</strong> bookmark. It will scrape
              your highlights and send them here.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              4
            </span>
            <span>
              Your library will open automatically once the import is complete.
            </span>
          </li>
        </ol>
      </section>

      {/* JSON upload fallback */}
      <section className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-stone-800">
          Import JSON File
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Already have a JSON export? Upload it here. Works with files from this
          app or other Kindle export tools.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="file"
            accept=".json"
            onChange={(e) => setJsonFile(e.target.files?.[0] ?? null)}
            className="block text-sm text-stone-500 file:mr-3 file:rounded file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
          />
          <button
            onClick={handleUpload}
            disabled={!jsonFile || uploading}
            className="rounded bg-stone-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-900 disabled:opacity-40"
          >
            {uploading ? "Importing..." : "Upload"}
          </button>
        </div>
        {uploadMsg && (
          <p className="mt-2 text-sm text-stone-600">{uploadMsg}</p>
        )}
      </section>

      {/* View library link */}
      <div className="text-center">
        <a
          href="/library"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View your library &rarr;
        </a>
      </div>
    </div>
  );
}
