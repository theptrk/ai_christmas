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
let OPENAI_KEY = process.env.OPENAI_KEY;

if (
  UBERDUCK_KEY === undefined ||
  UBERDUCK_SECRET === undefined ||
  OPENAI_KEY === undefined
) {
  console.log("UBERDUCK_KEY or UBERDUCK_SECRET or OPENAI_KEY is undefined");
}

async function fetchier(type, url, data) {
  let body = JSON.stringify(data);
  let method = data ? "POST" : "GET";
  let headers = {
    "Content-Type": "application/json",
    // https://stackoverflow.com/questions/23097928/node-js-throws-btoa-is-not-defined-error
    Authorization:
      "Basic " +
      Buffer.from(`${UBERDUCK_KEY}:${UBERDUCK_SECRET}`).toString("base64"),
  };
  if (type === "uberduck" || type === undefined) {
    headers.Authorization =
      "Basic " +
      Buffer.from(`${UBERDUCK_KEY}:${UBERDUCK_SECRET}`).toString("base64");
  } else if (type === "openai") {
    headers.Authorization = `Bearer ${OPENAI_KEY}`;
  } else {
    console.log("fetchier() type must be 'uberduck', 'openai' or undefined");
  }
  let response = await fetch(url, {
    method,
    headers,
    body,
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
  return fetchier("uberduck", "https://api.uberduck.ai/speak", data);
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
  return fetchier("uberduck", url);
}

app.get("/", async (req, res) => {
  res.render("index.html");
});

async function getWavFileUntilFinished(uuid) {
  return new Promise(async (resolve, reject) => {
    async function go() {
      setTimeout(async () => {
        const wave = await getWavFile(uuid);
        if (wave.finished_at === null) {
          return go();
        }
        resolve(wave);
      }, 1000);
    }
    go();
  });
}

async function getOpenAISong(songSubject) {
  let data = {
    model: "text-davinci-003",
    prompt: `Write a Christmas song about "${songSubject}"`,
    // https://beta.openai.com/docs/api-reference/completions
    // What sampling temperature to use. Higher values means the model
    // will take more risks. Try 0.9 for more creative applications,
    // and 0 (argmax sampling) for ones with a well-defined answer.
    temperature: 0,
    max_tokens: 400,
  };
  let res = await fetchier(
    "openai",
    "https://api.openai.com/v1/completions",
    data
  );
  let top_choice = res.choices[0].text;
  let top_choice_html = top_choice
    .split("\n")
    .slice(2)
    .map((x) => `<span>${x}</span>`)
    .join("<br />");
  return top_choice_html;
}

let prompt_responses = {};
app.get("/openai", async (req, res) => {
  const subject = req.query.s || "kale";
  const voice = req.query.v || "spongebob";

  let song;
  if (prompt_responses[subject]) {
    song = prompt_responses[subject]["song"];
  } else {
    song = await getOpenAISong(subject);
    prompt_responses[subject] = {};
    prompt_responses[subject]["song"] = song;
  }

  let speech = song;
  speech = speech.replaceAll("<br />", " ");
  speech = speech.replaceAll("<span>", " ");
  speech = speech.replaceAll("</span>", " ");

  const { uuid } = await createWavFile(speech, voice);
  let wav = await getWavFileUntilFinished(uuid);
  prompt_responses[subject]["wav"] = wav;
  res.send({ song, wav });
});

app.get("/create_wav", async (req, res) => {
  let speech = "I dont want a lot for Christmas";
  let voice = "miss-piggy";
  const { uuid } = await createWavFile(speech, voice);
  const wave = await getWavFileUntilFinished(uuid);
  return res.send(wave);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
