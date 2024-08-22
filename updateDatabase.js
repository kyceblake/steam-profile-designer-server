import axios from "axios";
import fs from "fs";

const url =
  "https://api.steampowered.com/ILoyaltyRewardsService/QueryRewardItems/v1/?";

async function getData(type) {
  let cursor;
  let total = [];

  while (true) {
    const params = new URLSearchParams();
    params.set("community_item_classes[0]", type);
    params.set("count", "1000");
    if (cursor) {
      params.set("cursor", cursor);
    }

    const { data } = await axios.get(`${url}${params.toString()}`);

    console.log("total", total.length, data.response.next_cursor);

    if (!data.response.definitions || data.response.definitions.length === 0) {
      break;
    } else {
      total = total.concat(data.response.definitions);
    }

    if (data.response.next_cursor) {
      console.log("set cursor", data.response.total_count, data.response.count);
      cursor = data.response.next_cursor;
    } else {
      break;
    }
  }

  return total;
}

/* const IF_TYPE_3_BACKGROUNDS = {
        appid: 2673490,
        defid: 279392,
        type: 1,
        community_item_class: 3, // backgrounds type 
        community_item_type: 11,
        point_cost: '500',
        timestamp_created: 1711895323,
        timestamp_updated: 1712115054,
        timestamp_available: 0,
        timestamp_available_end: 0,
        quantity: '1',
        internal_description: 'wall10',
        active: true,
        community_item_data: {
          item_name: 'HIMARI-3',
          item_title: 'HIMARI-3',
          item_image_large: '08f3079a0220a0b2ab6b047af0c2d551591160f2.jpg',
          animated: false
        },
        usable_duration: 0,
        bundle_discount: 0
    }, */

/* const IF_TYPE_14_FRAMES = {
    appid: 2186680,
    defid: 256125,
    type: 1,
    community_item_class: 14,
    community_item_type: 4,
    point_cost: '2000',
    timestamp_created: 1701505455,
    timestamp_updated: 1704323018,
    timestamp_available: 0,
    timestamp_available_end: 0,
    quantity: '1',
    internal_description: 'Rogue Trader',
    active: true,
    community_item_data: {
        item_name: 'Rogue Trader',
        item_title: 'Rogue Trader',
        item_image_small: '13376517d331a8442df079467861992887b01b06.png',
        item_image_large: 'ba9f40b3a9dd83cb62b839cb754c821343a15909.png',
        animated: true
    },
    usable_duration: 0,
    bundle_discount: 0
}; */

/* const IF_TYPE_15_AVATARS = {
    appid: 1849890,
    defid: 265989,
    type: 1,
    community_item_class: 15,
    community_item_type: 26,
    point_cost: '3000',
    timestamp_created: 1706215156,
    timestamp_updated: 1707501074,
    timestamp_available: 0,
    timestamp_available_end: 0,
    quantity: '1',
    internal_description: '1',
    active: true,
    community_item_data: {
        item_name: 'A charming look',
        item_title: 'A charming look',
        item_image_small: 'f1e6fc1f3a8b8fad128f1bec26c1c658d7ba9569.gif',
        item_image_large: '89a80b180fe4e90faf2bf592f8c57b6ce80f042f.jpg',
        animated: true
    },
    usable_duration: 0,
    bundle_discount: 0
} */

/* const IF_TYPE_8_PROFILES = {
    appid: 730,
    defid: 121190,
    type: 1,
    community_item_class: 8,
    community_item_type: 35,
    point_cost: '10000',
    timestamp_created: 1624560245,
    timestamp_updated: 1628095190,
    timestamp_available: 0,
    timestamp_available_end: 0,
    quantity: '1',
    internal_description: 'Counter-Strike: Global Offensive Profile',
    active: true,
    community_item_data: {
        item_name: 'Counter-Strike: Global Offensive Profile',
        item_title: 'Counter-Strike: Global Offensive Profile',
        item_image_small: '4e3505bf0a2e158bafbb3cd0b39b4c1b9993bc56.jpg',
        item_image_large: '5a726c956a85ba9b60b9b9400e8df94c547dfdcf.jpg',
        animated: false,
        profile_theme_id: 'BlueRed'
    },
    bundle_defids: [121191, 121192, 121193, 121194],
    usable_duration: 0,
    bundle_discount: 0
} */

function serialize(data) {
  const TYPES = {
    3: "background",
    15: "avatar",
    14: "frame",
    8: "profile",
  };

  return data.map((item) => {
    const metadata = item.community_item_data;
    let urls = {
      baseUrl:
        "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items",
      shop: `https://store.steampowered.com/points/shop/app/${item.appid}/reward/${item.defid}`,
    };

    // steam has weird keys...
    if (metadata.animated) {
      urls = {
        ...urls,
        small: metadata.item_image_small || metadata.item_movie_webm_small,
        big: metadata.item_image_large || metadata.item_movie_webm,
      };
    } else {
      urls = {
        ...urls,
        big: metadata.item_image_large,
      };
    }

    if (!(urls.small || urls.big)) {
      console.log(item, urls);
    }

    return {
      appid: item.appid,
      defid: item.defid,
      type: TYPES[item.community_item_class],
      price: item.point_cost,
      title: item.community_item_data.item_title,
      urls,
      isAnimated: item.community_item_data.animated,
      isSelected: false,
    };
  });
}

export default async function updateDatabase() {
  const backgrounds = await getData(3);
  const frames = await getData(14);
  const avatars = await getData(15);

  fs.writeFileSync(
    "./json/backgrounds.json",
    JSON.stringify(serialize(backgrounds))
  );
  fs.writeFileSync("./json/frames.json", JSON.stringify(serialize(frames)));
  fs.writeFileSync("./json/avatars.json", JSON.stringify(serialize(avatars)));

  // const profileThemes = await getData(8);
  // TODO: profile colors not yet supported
  // fs.writeFileSync(
  //   "./json/profileThemes.json",
  //   JSON.stringify(serialize(profileThemes))
  // );
}

updateDatabase().catch(console.error);
