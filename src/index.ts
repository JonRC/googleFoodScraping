import puppeteer from "puppeteer";

const getMenus = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--proxy-server=54.202.153.246:443"],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  await page.setGeolocation({
    latitude: 25.7823907,
    longitude: -80.2996701,
  });

  await page.goto(
    "https://food.google.com/?fo_m=EggSAggBegIgAQ&orderType=1&q=miami"
  );

  await page.waitForSelector("[data-restaurant-id]");

  const duplicatedRestaurantIds = await page.$$eval(
    "[data-restaurant-id]",
    (divs: HTMLDivElement[]) => {
      const ids = divs.map((div) =>
        div.getAttribute("data-restaurant-id").replace(/\/g\//, "")
      );

      return ids;
    }
  );

  const restaurantIds = removeDuplicated(duplicatedRestaurantIds);

  const restaurantIdToTest = restaurantIds[5];
  console.log(restaurantIds);

  const detailPage = (restaurantId: string) =>
    `https://food.google.com/food/chooseprovider?restaurantId=/g/${restaurantId}&fo_m=EhYSAggBegIgAZoBC1pGRUtJLWVUZGJ3OAE&orderType=1&q=miami&partnerId&sei=Cf-ili97KomBEdOsVVK6YGVz&utm_source=landing`;

  await page.goto(detailPage(restaurantIdToTest));

  await page.waitForSelector(".QrsxMb");

  const menuItems = await page.$$(".QrsxMb");

  const menuPromise = menuItems.map(async (menuItem) => {
    const title = await menuItem.$eval(
      ".S2Eeie",
      (titleElement: HTMLDivElement) => titleElement.innerText
    );

    const price = await menuItem.$eval(
      ".IS0mV ",
      (priceElement: HTMLDivElement) => priceElement.innerText
    );

    return { price, title };
  });

  const menu = await Promise.all(menuPromise);

  console.log(menu);

  //We are seeing the browser because it is a test.
  //We will hide it after the tests to improve the performance.
};

getMenus();

const removeDuplicated = <T>(arr: T[]) => Array.from(new Set(arr));
