const nunjucks = require("nunjucks");
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use("/static", express.static(path.join(__dirname, "public")));

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

// https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let UBERDUCK_KEY = process.env.UBERDUCK_KEY;
let UBERDUCK_SECRET = process.env.UBERDUCK_SECRET;

if (UBERDUCK_KEY === undefined || UBERDUCK_SECRET === undefined) {
  console.log("UBERDUCK_KEY or UBERDUCK_SECRET is undefined");
}

async function fetchier(url, data) {
  let method = data ? "POST" : "GET";
  let response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      // https://stackoverflow.com/questions/23097928/node-js-throws-btoa-is-not-defined-error
      Authorization:
        "Basic " +
        Buffer.from(`${UBERDUCK_KEY}:${UBERDUCK_SECRET}`).toString("base64"),
    },
    body: JSON.stringify(data),
  });
  let json = await response.json();
  return json;
}

// example { uuid: 'db2180a3-dd01-4edb-89ce-f1d1c4ae4afb' }
async function createWavFile(speech, voice) {
  let data = {
    speech,
    voice,
  };
  return fetchier("https://api.uberduck.ai/speak", data);
}

// example
// {
//   "failed_at":null,
//   "finished_at":"2022-12-10T20:11:15.235089",
//   "meta":null,
//   "path":"https://uberduck-audio-outputs.s3-us-west-2.amazonaws.com/a6622099-1d03-4b50-ae16-9eba32487475/audio.wav",
//   "started_at":"2022-12-10T20:11:14.607410"
// }
async function getWavFile(uuid) {
  let url = `https://api.uberduck.ai/speak-status?uuid=${uuid}`;
  return fetchier(url);
}

app.get("/", async (req, res) => {
  res.render("index.html");
});

async function getWavFileUntilFinished(res, uuid) {
  setTimeout(async () => {
    const wave = await getWavFile(uuid);
    if (wave.finished_at === null) {
      return getWavFileUntilFinished(res);
    }
    return res.send(wave);
  }, 1000);
}

app.get("/create_wav", async (req, res) => {
  let speech = "I dont want a lot for Christmas";
  let voice = "miss-piggy";
  const { uuid } = await createWavFile(speech, voice);
  return getWavFileUntilFinished(res, uuid);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
