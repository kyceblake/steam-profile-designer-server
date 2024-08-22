import express from "express";
import cors from "cors";
import Fuse from "fuse.js";

import avatars from './json/avatars.json' with { type: "json" };
import backgrounds from './json/backgrounds.json' with { type: "json" };
import frames from './json/frames.json' with { type: "json" };

const data = [...avatars, ...backgrounds, ...frames];
const availableCategories = ["background", "avatar", "frame", "profile"];

function paginate(arr, size) {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size);
    let page = acc[idx] || (acc[idx] = []);

    page.push(val);
    return acc;
  }, []);
}

const PORT = process.env.PORT || 1337;

const app = express();
app.use(cors());

app.listen(PORT, () => {
  console.log(`server is ready on ${PORT}`);
});

//  params are:
//  - type : "background", "avatar", "frame", "profile"]
//  - search : string
//  - page : number
app.get("/getItems", (req, res, next) => {
  const { type, search, page } = req.query;
  let mutatedData = data;

  if (availableCategories.includes(type)) {
    mutatedData = data.filter((item) => item.type === type);
  }

  if (search) {
    const fuse = new Fuse(mutatedData, {
      threshold: 0.1,
      keys: ["title", "appid"],
    });
    mutatedData = fuse.search(search);
  }

  let pages = paginate(mutatedData, 20);

  res.json(
    JSON.stringify({
      page: pages[page],
      pages: pages.length,
    })
  );
});
