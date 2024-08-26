import express from "express";
import { check, validationResult } from "express-validator";
import cors from "cors";
import Fuse from "fuse.js";

import avatars from './json/avatars.json' with { type: "json" };
import backgrounds from './json/backgrounds.json' with { type: "json" };
import frames from './json/frames.json' with { type: "json" };
import paginate from "./utils/paginate.js";

const data = [...avatars, ...backgrounds, ...frames];

const PORT = process.env.PORT || 1337;
const app = express();
app.use(cors());

app.listen(PORT, () => {
  console.log(`server is ready on ${PORT}`);
});

const validItemsTypes = ["background", "avatar", "frame"]
var validateGetItems = [
  check("page")
    .isNumeric()
    .escape()
    .withMessage("Mandatory 'page' value, should be integer value"),
  check("search")
    .isLength({ max: 15 })
    .escape()
    .optional()
    .withMessage(
      "Optional 'search' string value can be more than 15 characters"
    ),
  check("type")
    .isIn(validItemsTypes)
    .escape()
    .optional()
    .withMessage(
      "Optional 'type' string value accepts only 'background', 'avatar', 'frame' values"
    ),
];

//  params are:
//  - type : "background", "avatar", "frame"
//  - search : string
//  - page : number
app.get("/getItems", validateGetItems, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { type, search, page } = req.query;
  let mutatableData = data;

  if (validItemsTypes.includes(type)) {
    mutatableData = data.filter((item) => item.type === type);
  }

  if (search) {
    const fuse = new Fuse(mutatableData, {
      threshold: 0.1,
      keys: ["title", "appid"],
    });
    mutatableData = fuse.search(search);
  }

  let pages = paginate(mutatableData, 10);

  res.json(
    JSON.stringify({
      page: pages[page],
      pages: pages.length - 1,
    })
  );
});
