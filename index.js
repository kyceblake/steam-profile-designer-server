import Fuse from "fuse.js";
import express from "express";
import cors from "cors";

import avatars from './json/avatars.json' with { type: "json" };
import backgrounds from './json/backgrounds.json' with { type: "json" };
import frames from './json/frames.json' with { type: "json" };
import profileThemes from './json/profileThemes.json' with { type: "json" };

const data = [...avatars, ...backgrounds, ...frames, ...profileThemes];
const categories = {
  1: 3, // backgrounds
  2: 14, // frames
  3: 15, // avatars
  4: 8, // profiles
};

const PORT = process.env.PORT || 1337;
const app = express();
app.use(cors());

function paginate(arr, size) {
  return arr.reduce((acc, val, i) => {
    let idx = Math.floor(i / size);
    let page = acc[idx] || (acc[idx] = []);
    page.push(val);

    return acc;
  }, []);
}

app.listen(PORT, () => {
  console.log(`server is ready on ${PORT}`);
});

app.get("/getPointshopItems", (req, res, next) => {
  let pageNumber = req.query.page ? req.query.page : 0;
  let searchQuery = req.query.query;
  let isAnimated = req.query.isAnimated;
  let categoryId =
    categories[req.query.category] !== undefined
      ? categories[req.query.category]
      : 0;

  try {
    if (isAnimated) {
      isAnimated = Boolean(JSON.parse(isAnimated));
    }
  } catch {
    return res.sendStatus(400);
  }

  console.log(req.query);
  console.log(`${pageNumber} | ${searchQuery} | ${isAnimated} | ${categoryId}`);

  let typedData =
    categoryId !== 0
      ? data.filter((item) => item.community_item_class == categoryId)
      : data;

  if (categoryId == 3 && isAnimated !== undefined) {
    typedData = typedData.filter(
      (item) => item.community_item_data.animated == isAnimated
    );
  }

  const fuzzySearch = () => {
    const fuse = new Fuse(typedData, {
      threshold: 0.2,
      keys: ["community_item_data.item_title"],
    });

    return fuse.search(searchQuery).map((i) => {
      return i.item;
    });
  };

  let pages = searchQuery ? paginate(fuzzySearch(), 8) : paginate(typedData, 8);

  res.json(
    JSON.stringify({
      total: pages.length,
      current: pageNumber,
      page: pages[pageNumber],
    })
  );
});
