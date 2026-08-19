console.info("progress.js onImport");

const progress = {
  momentId: "",
  gameData: {},
};

const _this = {
  progress,
  getProgress,
  saveProgress,
  delProgress,
  getSaves,
};

function readSaves() {
  const a = $app.getImports().memory["progresses_slot1"];
  const b = $app.getImports().memory["progresses_slot2"];
  const aOk = a && a.time;
  const bOk = b && b.time;
  if (aOk && bOk) return a.time >= b.time ? a : b;
  if (aOk) return a;
  if (bOk) return b;
  return {};
}

function writeSaves(saves) {
  const a = $app.getImports().memory["progresses_slot1"];
  const b = $app.getImports().memory["progresses_slot2"];
  const aTime = (a && a.time) || 0;
  const bTime = (b && b.time) || 0;
  const target = aTime <= bTime ? "progresses_slot1" : "progresses_slot2";
  saves.time = Date.now();
  $app.getImports().memory[target] = saves;
  $app.getImports().memory.save(target);
}

// 统一用 id 区分存档：auto、manual0、manual1、manual2
// 存档/读档时存取整个 progress（momentId + gameData），保证 exec 对 gameData 的修改可持久化
function getProgress(id) {
  const saves = readSaves();
  const saved = saves[id];
  if (saved) {
    progress.momentId = saved.momentId || "";
    progress.gameData = saved.gameData || {};
  } else {
    progress.momentId = "";
    progress.gameData = {};
  }
}

function saveProgress(id) {
  const saves = readSaves();
  saves[id] = {
    momentId: progress.momentId,
    gameData: progress.gameData,
    time: Date.now(),
  };
  writeSaves(saves);
}

function delProgress(id) {
  const saves = readSaves();
  delete saves[id];
  writeSaves(saves);
}

function getSaves() {
  return readSaves();
}

export default _this;
