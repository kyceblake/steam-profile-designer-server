import Fuse from "fuse.js";
import express from "express";
import cors from "cors";
import { rateLimit } from 'express-rate-limit'
import dotenv from "dotenv";
dotenv.config();

import avatars from './json/avatars.json' with { type: "json" };
import backgrounds from './json/backgrounds.json' with { type: "json" };
import frames from './json/frames.json' with { type: "json" };
import profileThemes from './json/profileThemes.json' with { type: "json" };

const data = [...avatars, ...backgrounds, ...frames, ...profileThemes];
const categories = {
  0: 0, // all items
  1: 3, // backgrounds
  2: 14, // frames
  3: 15, // avatars
  4: 8, // profiles
  10: 3, // animated
  11: 3, // static
};


const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 50,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})

const PORT = process.env.PORT || 1337;
const app = express();
app.use(cors());
app.use(limiter);

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

// AVALIABLE PARAMETERS:
// page - return specific page (every page is 8 items)
// query - fuzzy search by item title
// category - accepts on of categories specified in line 13
app.get("/getItems", (req, res, next) => {
  const validParams = ["page", "query", "category"];
  const isValidRequest = validParams.every(param => req.query[param] !== undefined);
  if (!isValidRequest) {
    return res.status(400).send({
      message: 'Invalid request. You should use page, query and category params in your request'
   });   
  }
  
  let pageNumber = +req.query.page;
  let searchQuery = req.query.query;
  let categoryId = categories[+req.query.category];

  let typedData =
    categoryId !== 0
      ? data.filter((item) => item.community_item_class == categoryId)
      : data;

  // 10 - animated wallpapers type, 11 - static wallpapers type
  if (categoryId == 3 && ["10", "11"].includes(req.query.category)) {
    let isAnimated = req.query.category == "10" ? true : false;
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