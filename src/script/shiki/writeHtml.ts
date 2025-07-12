import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { codeToHtml } from "shiki";

async function writeHtml(fileName: string) {
  const code = readFileSync(
    path.resolve("./src/script/shiki/" + fileName),
    "utf8",
  );
  const html = await codeToHtml(code, {
    lang: "javascript",
    theme: "github-dark",
  });
  const outputPath = `./src/shiki-output/${fileName}.html`;

  writeFileSync(outputPath, html);
  console.log(`✅ Highlighted HTML saved to ${outputPath}`);
}

writeHtml("getApiKey.code.js");
