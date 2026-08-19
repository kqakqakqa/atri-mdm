console.info("parseMoment.js onImport");

const _this = {
  parseMoment: parseMoment,
};

const MOMENTS_BASE_DIR = "internal://app/rawfile/momentplay_res/moments";

function parseMoment(momentId, then) {
  $app.getImports().lookupDictV5.lookupDict(MOMENTS_BASE_DIR, momentId, (matched, key, rawValue) => {
    if (!rawValue) {
      return then && then(null);
    }
    const obj = parseRawValue(rawValue);
    return then && then(obj);
  });
}

function parseRawValue(rawValue) {
  const parts = rawValue.split("\t");

  const TYPE_MAP = { n: "dialog", c: "choice" };
  const type = TYPE_MAP[parts[0]] || parts[0];

  // 动态列数：
  // sentence类型(7列): type bg showcharacters sentencecharacter sentence exec forwards
  // choice类型(6列):   type bg showcharacters choices exec forwards
  const result = {
    type: type,
    bg: parts[1] || "",
    showCharacters: parseShowCharacters(parts[2] || ""),
  };

  if (type === "dialog") {
    // sentence: [3]=sentencecharacter, [4]=sentence, [5]=exec, [6]=forwards
    result.dialogCharacter = parts[3] || "";
    result.dialog = parts[4] || "";
    result.exec = parts[5] || "";
    result.forwards = parts[6] ? parts[6].split(",") : [];
  } else if (type === "choice") {
    // choice: [3]=choices, [4]=exec, [5]=forwards
    result.choices = parts[3] ? parts[3].split("\u02e5") : [];
    result.exec = parts[4] || "";
    result.forwards = parts[5] ? parts[5].split(",") : [];
  }

  return result;
}

function parseShowCharacters(scRaw) {
  if (!scRaw) {
    return [];
  }

  const items = [];
  const entries = scRaw.split("\u02e5");

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;

    const commaIdx = entry.indexOf(",");
    let body, face;

    if (commaIdx !== -1) {
      body = entry.substring(0, commaIdx);
      face = entry.substring(commaIdx + 1);
    } else {
      body = entry;
      face = "";
    }

    const sc = {};
    sc.bodyImg = body;
    sc.faceImg = face;

    items.push(sc);
  }

  return items;
}



export default _this;
