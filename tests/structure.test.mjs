import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { business } from "../data/business.js";

const root = new URL("../", import.meta.url);
const pageFiles = (await readdir(root)).filter(
  (name) => name.endsWith(".html") && name !== "404.html",
);

test("all eight pages are static, self-canonical, linked and have unique SEO metadata", async () => {
  assert.equal(pageFiles.length, 8);
  const titles = new Set(),
    descriptions = new Set();
  for (const file of pageFiles) {
    const html = await readFile(new URL(file, root), "utf8");
    const { window } = new JSDOM(html);
    const doc = window.document;
    assert.equal(doc.querySelectorAll("h1").length, 1, file);
    assert.equal(doc.querySelectorAll("main").length, 1, file);
    assert.ok(doc.querySelector("nav[aria-label]"), file);
    titles.add(doc.title);
    descriptions.add(doc.querySelector('meta[name="description"]').content);
    const route =
      file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`;
    assert.equal(
      doc.querySelector('[rel="canonical"]').href,
      business.origin + route,
    );
    assert.match(
      doc.querySelector('meta[name="robots"]').content,
      /^index,follow/,
    );
    const ids = [...doc.querySelectorAll("[id]")].map((el) => el.id);
    assert.equal(ids.length, new Set(ids).size, `${file}: duplicate ID`);
    for (const element of doc.querySelectorAll(
      "[aria-controls], [aria-labelledby], [aria-describedby]",
    )) {
      for (const name of [
        "aria-controls",
        "aria-labelledby",
        "aria-describedby",
      ]) {
        for (const id of (element.getAttribute(name) || "")
          .split(/\s+/)
          .filter(Boolean))
          assert.ok(ids.includes(id), `${file}: ${name}=${id}`);
      }
    }
    for (const script of doc.querySelectorAll(
      'script[type="application/ld+json"]',
    )) {
      const data = JSON.parse(script.textContent);
      assert.ok(
        data["@graph"].some(
          (item) =>
            item["@type"] === "BeautySalon" &&
            item.telephone === "+50687030236",
        ),
      );
    }
    for (const image of doc.querySelectorAll("img[src]")) {
      assert.ok(image.hasAttribute("alt"), `${file}: missing alt`);
      assert.ok(
        image.width > 0 && image.height > 0,
        `${file}: missing image dimensions`,
      );
    }
    for (const element of doc.querySelectorAll("[href], [src]")) {
      const target =
        element.getAttribute("href") || element.getAttribute("src");
      if (!target || /^(https?:|tel:|mailto:|data:)/.test(target)) continue;
      if (target.startsWith("#")) {
        assert.ok(ids.includes(target.slice(1)), `${file}: ${target}`);
        continue;
      }
      const parsed = new URL(target, business.origin);
      let name = parsed.pathname.slice(1) || "index.html";
      if (!name.includes(".")) name += ".html";
      await assert.doesNotReject(
        access(new URL(name, root)),
        `${file}: ${target}`,
      );
      if (parsed.hash) {
        const linked = new JSDOM(await readFile(new URL(name, root), "utf8"));
        assert.ok(
          linked.window.document.getElementById(parsed.hash.slice(1)),
          `${file}: invalid target ${target}`,
        );
        linked.window.close();
      }
    }
    window.close();
  }
  assert.equal(titles.size, 8);
  assert.equal(descriptions.size, 8);
});

test("sitemap lists every public page and robots permits discovery", async () => {
  const sitemap = new JSDOM(
    await readFile(new URL("sitemap.xml", root), "utf8"),
    { contentType: "text/xml" },
  );
  const urls = [...sitemap.window.document.querySelectorAll("url > loc")].map(
    (el) => el.textContent,
  );
  assert.equal(urls.length, 8);
  assert.ok(urls.every((url) => url.startsWith(business.origin)));
  assert.ok(!urls.some((url) => url.includes("404")));
  const robots = await readFile(new URL("robots.txt", root), "utf8");
  assert.match(robots, /Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${business.origin}/sitemap.xml`));
  const notFound = new JSDOM(await readFile(new URL("404.html", root), "utf8"));
  assert.match(
    notFound.window.document.querySelector('meta[name="robots"]').content,
    /^noindex/,
  );
  sitemap.window.close();
  notFound.window.close();
});
