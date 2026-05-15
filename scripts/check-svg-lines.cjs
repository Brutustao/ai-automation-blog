const fs = require("fs");
const dir = "public/images/articles";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".svg"));
for (const f of files) {
  const svg = fs.readFileSync(dir + "/" + f, "utf-8");
  const boldTags = svg.match(/font-weight="bold"/g);
  if (boldTags && boldTags.length > 3) {
    console.log(f + " - " + boldTags.length + " lines");
  }
}
