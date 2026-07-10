const fs = require("fs");
const https = require("https");

const INPUT_FILE = "catalogo_100_libros_premium_usd.json";
const OUTPUT_FILE = "catalogo_100_libros_premium_usd_con_portadas.json";

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function normalizeGoogleCover(url) {
  if (!url) return "";

  return url
    .replace("http://", "https://")
    .replace("&edge=curl", "")
    .replace("zoom=1", "zoom=2");
}

async function fetchGoogleBooksCover(book) {
  const title = book.title || "";
  const author = book.author || "";

  const query = encodeURIComponent(
    `intitle:${title} inauthor:${author}`
  );

  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5&printType=books`;

  const data = await requestJson(url);

  if (!data.items || !Array.isArray(data.items)) {
    return "";
  }

  for (const item of data.items) {
    const images = item.volumeInfo && item.volumeInfo.imageLinks;

    if (!images) continue;

    const cover =
      images.extraLarge ||
      images.large ||
      images.medium ||
      images.small ||
      images.thumbnail ||
      images.smallThumbnail ||
      "";

    if (cover) {
      return normalizeGoogleCover(cover);
    }
  }

  return "";
}

async function fetchOpenLibraryCover(book) {
  const query = encodeURIComponent(
    `${book.title} ${book.author || ""}`
  );

  const searchUrl = `https://openlibrary.org/search.json?q=${query}&limit=5`;

  const data = await requestJson(searchUrl);

  if (!data.docs || !data.docs.length) {
    return "";
  }

  const selected =
    data.docs.find((doc) => doc.cover_i) ||
    data.docs[0];

  if (!selected.cover_i) {
    return "";
  }

  return `https://covers.openlibrary.org/b/id/${selected.cover_i}-L.jpg`;
}

async function fetchBestCover(book) {
  const googleCover = await fetchGoogleBooksCover(book);

  if (googleCover) {
    return {
      url: googleCover,
      source: "Google Books",
    };
  }

  const openLibraryCover = await fetchOpenLibraryCover(book);

  if (openLibraryCover) {
    return {
      url: openLibraryCover,
      source: "OpenLibrary",
    };
  }

  return {
    url: "",
    source: "none",
  };
}

async function main() {
  const books = JSON.parse(
    fs.readFileSync(INPUT_FILE, "utf8")
  );

  let found = 0;
  let missing = 0;
  let google = 0;
  let openlibrary = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    try {
      const result = await fetchBestCover(book);

      book.currency = book.currency || "USD";
      book.price = Number(book.price);

      if (result.url) {
        book.thumbnail = result.url;
        book.coverSource = result.source;

        if (result.source === "Google Books") google++;
        if (result.source === "OpenLibrary") openlibrary++;

        found++;

        console.log(
          `✅ ${i + 1}/${books.length} ${book.title} — ${result.source}`
        );
      } else {
        missing++;

        console.log(
          `⚠️ Sin portada: ${book.title}`
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 150)
      );
    } catch (err) {
      missing++;

      console.log(
        `❌ Error con ${book.title}: ${err.message}`
      );
    }
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(books, null, 2),
    "utf8"
  );

  console.log("\n🎉 Archivo generado:");
  console.log(OUTPUT_FILE);
  console.log(`✅ Portadas encontradas: ${found}`);
  console.log(`📘 Google Books: ${google}`);
  console.log(`📗 OpenLibrary fallback: ${openlibrary}`);
  console.log(`⚠️ Sin portada: ${missing}`);
}

main();