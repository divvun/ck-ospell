const test = require("ava");
const request = require("supertest-as-promised");
const express = require("express");
const { response } = require("express");

const app = express();
app.use(require("./server/index"));

const API = "/spellcheck/script/ssrv.cgi";

const cmd = (name) => ({ cmd: name, run_mode: "web_service", format: "json" });

const spellCmd = () => ({
  cmd: "check_spelling",
  run_mode: "web_service",
  format: "json",
  version: "1.0",
  out_type: "words",
});

test.serial("Get Banner", async (t) => {
  const response = await request(app).get(API).query(cmd("getbanner"));

  t.is(response.status, 200);
  t.deepEqual(response.body, { banner: false });
});

test("Get Lang List", async (t) => {
  const response = await request(app).get(API).query(cmd("get_lang_list"));

  t.is(response.status, 200);
  t.deepEqual(response.body, {
    langList: {
      ltr: {
        sma: "Giellatekno/Divvun/UiT fst-based speller for Southern Sami",
      },
      rtl: {},
    },
    verLang: 6,
  });
});

test("Check Spelling: Correct Word", async (t) => {
  const response = await request(app)
    .get(API)
    .query(spellCmd())
    .query({ slang: "sma", text: "akkusatijvh" });

  t.is(response.status, 200);
  t.deepEqual(response.body, []);
});

test("Check Spelling: Suggestions", async (t) => {
  const response = await request(app)
    .get(API)
    .query(spellCmd())
    .query({ slang: "sma", text: "akkusativa" });

  t.is(response.status, 200);
  t.truthy(Array.isArray(response.body));

  const s = response.body[0];
  t.deepEqual(s.word, "akkusativa");
  t.deepEqual(s.ud, false);

  // Only check the values are all present but ignore the order. (For some
  // reason, the order of suggestions is different on Linux and OS X...)
  t.deepEqual(
    s.suggestions.sort(),
    [
      "akkusatijve",
      "akkusatijvh",
      "akkusatijvi",
      "akkusativ-C",
      "akkusativ-D",
      "akkusativ-I",
      "akkusativ-L",
      "akkusativ-M",
      "akkusativ-V",
      "akkusativ-X",
    ].sort()
  );
});

test("Check Spelling: Empty Suggestions", async (t) => {
  const response = await request(app)
    .get(API)
    .query(spellCmd())
    .query({ slang: "sma", text: "apfelkuchen" });

  t.is(response.status, 200);

  const expected = [
    {
      word: "apfelkuchen",
      suggestions: [],
      ud: false,
    },
  ];

  t.deepEqual(response.body, expected);
});

test("Check Spelling: Suggestions for multiple words", async (t) => {
  const response = await request(app)
    .get(API)
    .query(spellCmd())
    .query({ slang: "sma", text: "lorem,ipsum" });

  t.is(response.status, 200);
  t.truthy(Array.isArray(response.body));

  const s0 = response.body[0];
  t.deepEqual(s0.word, "lorem");
  t.deepEqual(s0.ud, false);
  t.deepEqual(
    s0.suggestions.sort(),
    [
      "Borem",
      "Doram",
      "Floram",
      "Florem",
      "Morem",
      "Norem",
      "Torem",
      "lorvem",
      "lovrem",
      "låvrem",
    ].sort()
  );

  // Check ipsum
  const s1 = response.body[1];
  t.deepEqual(s1.word, "ipsum");
  t.deepEqual(s1.ud, false);
  t.deepEqual(
    s1.suggestions.sort(),
    [
      "Aksum",
      "Epsom",
      "Hasum",
      "Husum",
      "Pesum",
      "Sippum",
      "Sisum",
      "gipsem",
      "gipsim",
      "jipsem",
    ].sort()
  );
});

test("Check Spelling: Remove quote marks", async (t) => {
  const response = await request(app)
    .get(API)
    .query(spellCmd())
    .query({ slang: "sma", text: "«akkusatijvh»«»“”‘’" });

  t.is(response.status, 200);
  t.deepEqual(response.body, []);
});
