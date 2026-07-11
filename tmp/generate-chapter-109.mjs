import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const model = "qwen3:8b";
const slot = "2026-07-08T18:00:00+08:00";

const books = [
  {
    title: "星骸王座",
    chapterTitle: "第七床下無肩",
    voice: "顧夜燼：冷硬邊境玄幻；沈曜右肩與右腿仍傷，阿棠腦疲、右手累；用藥布、木床、雪泥、工錢與街坊火氣寫命運偷手，不要像制度報告。",
    beats: [
      "北坡舊傷工宿棚的七張床被臨時徵作夜間換藥，白屋以『未收轉床』停掉仍在治傷者的帶與膏；程九怕輕工被取消，卻主動帶路。前段就讓第七床床板自行收緊吊帶，差點勒住一名磨石工，沈曜因傷不能到場，靠眾人逐步回報判斷，阿棠親自先救人再留證。",
      "床下沒有肩，只有一副用舊傷帶、潮木簧與墨棉線做出的預收機構；七床各自對應不同部位，若照總簿收帶就會讓床板在子正後留下『已還』濕字。街坊把床、傷、器分開，先讓每名傷者自己說仍需什麼；程九用只數不搬的輕工方法救下一位小工，白屋管事被迫承認北坡是缺料與欠工錢的轉嫁口。",
      "查出薄三並非確定人名，而可能是糊紙三層的工稱；床下壓槽板與白屋總簿同工，但其中一張床藏著顏婆舊規『帶還庫，人回家』。局部回報是北坡七床改作公開換藥位、傷者不中斷用料，程九保住名字與輕工。最後只推進一層：第七床拆開後，真正缺的不是肩，而是床腳一枚星形骨釘；它在天亮前被人送進沈曜病床的空豆花碗，具體三行收鉤。"
    ]
  },
  {
    title: "灰塔觀測者",
    chapterTitle: "第三鐘前不見",
    voice: "霧原：安靜、冷、缺一拍；艾文右肩仍六分半痛，伊芙不替人說；用水壺、麻結、鐘油、工號、灰粉與低位工的怕，避免大喊與怪物。",
    beats: [
      "濕紙寫『第三鐘響前，別讓艾文看見我』後，七層想把艾文的醫工床簾封死，說是保護雙方；封簾會讓他失去換藥見證，也會讓門內女子被改成不可見。前段讓一名送水學徒因不敢被看見而差點漏報燙傷，伊芙用兩短結讓他自己選誰看傷，保住他與一日工錢。",
      "第三鐘不是時間警告那麼簡單：修鐘道每第三次報鐘會換一面觀測玻片，舊片上的人影可被抄成『已見』。有人想讓艾文在不知情下成為見證，再把門內女子寫進另一張床。艾文不能上樓，只能要求每次看見都說清看見的是人、影、紙還是空椅；低位工立刻用，抓出玻片上其實是三年前水壺倒影。",
      "伊芙與門內女子仍不互認身分，只共同拒絕被代答。局部回報是第三鐘照常響、換藥與送水不停、觀測玻片改由兩名低位工各寫所見，值油工不再因缺座背鍋。假平後，第三鐘少了尾拍，醫工房艾文床下卻多出一只乾的左耳白線壺；壺內不是女子名字，而是一張今日才寫的工條：『第四鐘，艾文已見。』用最後三行具體收鉤。"
    ]
  },
  {
    title: "雪刃照孤城",
    chapterTitle: "床牌不替活人",
    voice: "謝聽寒：克制武俠，雪、熱粥、傷、刀鞘、退路；沈照夜右肩七分疼、不能出門，程聽雪以醫理和退路直接改局；出刀少而準，對話白而硬。",
    beats: [
      "封屋內活人說停，窗縫推出刻『照夜』床片。先救人，不認床片。程聽雪讓屋內人自己選開哪一道口、誰靠近；屋內是年老磨鞘工羅添，腿被倒架壓住，刀不在身上，鞘裡塞的是止血木。他怕一開門就被叫成沈照夜。前段以不拔刀撬開排水側板救他，范守夜忍住劈門，局部痛快早落地。",
      "床片全名不是沈照夜，只剩刮後兩字；木層與血痕年代不同。羅添承認替同春院修過拔刀板，卻不認羅拐或九錢。他因欠飯工在封屋躲過一夜，門外粗結是自己綁的。程聽雪先治腿、給粥、讓他決定供詞順序；沈照夜隔回話承認自己看不到，拒絕用名字壓人。普通抬工用掌根托板法救出羅添，保住手指與工錢。",
      "反試證明『照夜』原是床位的夜間照護標記，不一定是人名；但床片背面有一條只有照夜刀鞘才會留下的退痕，仍不能認父鞘。局部回報是三間封屋逐一先報活人再報物，找出另一名被欠工藏住的小藥童。章末不拔刀：羅添喝完粥交出一把沒有刃的舊鞘尺，說真正拔刀的人今夜不會來；尺尾卻卡著一枚寫『程聽雪先退』的黑錢。最後三行具體收鉤。"
    ]
  },
  {
    title: "凌晨三點的演算法",
    chapterTitle: "舊號不先到",
    voice: "陳停雲：都市白話驚悚、快準冷幽默；周祈把技術翻成人話，林岫把現場釘成公共事件；用東門、退件報箱、訪客證、早餐車、手機訊號與上班人潮，不寫駭客神技。",
    beats: [
      "黑色SIM卡貼張毓名字，東門八點半正值早餐、印刷車、員工刷卡。保全本能想封箱封門，卻會讓退件員、送餐店員與採訪組失去正常進出。前段先把卡與震動線隔離，不拔卡、不插機；一名外送員手機同時被停話，誤以為封卡連累自己，周祈讓電信端只查卡片識別、不停同號整批，保住他接單。",
      "查出黑卡沒有有效門號，只是震動模組的標籤載體；真正震動來自充電線內的尋物器。張毓字樣是資產名，不是持有人。舊報箱被排程成退件交接點，有人企圖讓任何第一個掃碼的人變成『帶舊號的人』。林岫讓退件、報紙、早餐各走原流程，掃碼前先口頭說物件、不說人名；清潔員昨夜留下的防線被白班普通人真正使用。",
      "臨江科技園東門來電催收『報廢手機』，語氣客氣得像正常物流。周祈不赴約，只要求對方說箱號、重量與收件人，對方露出重量其實是零。局部回報：東門不中斷、外送員恢復接單、退件員不背遺失責任，黑卡封存但不牽連正常卡。假平後，報箱最底層舊報紙翻出一張四年前的退件回條，收件人不是張毓，而是周祈母親；今日九點十二分，系統已替她簽收。最後三行用手機通知、時間與名字收鉤。"
    ]
  },
  {
    title: "大明墨工",
    chapterTitle: "北井先問飯",
    voice: "蕭墨臣：穩細尺墨工理；沈墨量、等、校、反試，顧清棠虎口六分半傷且用左手；用北井、水桶、竹籌、井輪、飯碗、工錢與育嬰照護，把官面壓回可驗小物。",
    beats: [
      "七孔竹籌寫辰初帶第十床回北井。眾人不帶父尺匣與原片，只帶照影和尺寸；到北井先遇挑水工被封井，理由是要等第十床，育嬰堂早飯也缺水。前段沈墨用旁井與標桶反試，證井水可用、封的是井輪交接不是水，先恢復挑水工與育嬰堂供水，工錢照發。",
      "北井旁有十個舊抬架位，第十位墊著七孔竹籌；孔並非密碼，而是記七次提桶重量，第七孔封蠟表示該輪少一次。有人想用床片厚度補井輪煞木，讓照護物成為工料。顧清棠以左手分冊，把孩子照護與北井工料拆開；照高工、挑水婦、老井工各自量、聽、等，逼領尺房來人承認辰初令只憑口信。",
      "反試發現第十位不是床位，而是傷工休息架，『帶第十床』可能指把能墊平的薄片當公料。局部回報：井輪換上正規煞木，育嬰堂水與碼頭工飯路恢復，七孔籌逐孔記回實際提水，不拿人名補數。只推進一層：井底提上來的不是父尺，而是一只封死的飯盒，盒底與父尺匣同樣一清一木兩聲；飯盒外刻『沈衡未領，第十工代食』。最後三行具體收鉤。"
    ]
  }
];

function count(text) { return [...text.replace(/\s/g, "")].length; }
function clean(text) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/^```[^\n]*\n|```$/g, "")
    .replace(/^第109章[^\n]*\n+/, "")
    .trim();
}
function paragraphs(text) { return text.split(/\n\s*\n/).map(v => v.trim()).filter(Boolean); }
function duplicateParagraphs(text) {
  const seen = new Set();
  const dupes = [];
  for (const p of paragraphs(text)) {
    const key = p.replace(/\s/g, "");
    if (key.length < 28) continue;
    if (seen.has(key)) dupes.push(key.slice(0, 40));
    seen.add(key);
  }
  return dupes;
}
function dedupeParagraphs(text) {
  const seen = new Set();
  const kept = [];
  for (const p of paragraphs(text)) {
    const key = p.replace(/\s/g, "");
    if (key.length >= 28 && seen.has(key)) continue;
    if (key.length >= 28) seen.add(key);
    kept.push(p);
  }
  return kept.join("\n\n");
}
function removeSeenParagraphs(text, prior) {
  const seen = new Set(paragraphs(prior).map(p => p.replace(/\s/g, "")).filter(k => k.length >= 28));
  return paragraphs(dedupeParagraphs(text))
    .filter(p => !seen.has(p.replace(/\s/g, "")))
    .join("\n\n");
}
async function ask(prompt) {
  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${prompt}\n/no_think`,
      think: false,
      stream: false,
      options: { temperature: 0.82, top_p: 0.9, repeat_penalty: 1.18, num_ctx: 16384, num_predict: 3200 }
    })
  });
  if (!response.ok) throw new Error(`ollama ${response.status}: ${await response.text()}`);
  return clean((await response.json()).response || "");
}

for (const book of books) {
  const dir = join(root, "src/resource", book.title);
  const articleDir = join(dir, "文章");
  const output = join(articleDir, `第109章 ${book.chapterTitle}.txt`);
  if (existsSync(output)) {
    const existingChars = count(readFileSync(output, "utf8"));
    if (existingChars >= 5800 && existingChars <= 6500) {
      console.log(`${book.title} skip-existing ${output} chars=${existingChars}`);
      continue;
    }
    throw new Error(`${book.title}: existing output has invalid length ${existingChars}`);
  }
  const latest = readdirSync(articleDir).filter(name => /^第108章 .*\.txt$/.test(name))[0];
  if (!latest) throw new Error(`${book.title}: missing chapter 108`);
  const previous = readFileSync(join(articleDir, latest), "utf8");
  const style = readFileSync(join(dir, "素材", "風格規則.md"), "utf8");
  let parts = [];
  for (let index = 0; index < 10 && count(parts.join("\n\n")) < 6000; index++) {
    let accepted = "";
    let fallback = "";
    let fallbackScore = Infinity;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const prior = parts.join("\n\n");
      const priorChars = count(prior);
      const isFinal = priorChars >= 5000;
      const beat = index < 2 ? book.beats[0] : index < 4 ? book.beats[1] : book.beats[2];
      const stage = index === 0
        ? "只寫危機發生、人物先救人與第一個小反咬，暫不進深查。"
        : index === 1
          ? "危機已發生；直接從救援動作中段開始，寫現場代價、普通人使用新做法與第一次反試，不得重開場。"
          : index === 2
            ? "人已暫時救下；直接寫物件驗證與具體工務摩擦，讓普通人真正用出防線。"
            : index === 3
              ? "第一輪驗證已做；直接讓初判受挫，從現場物件露出更冷的第二層壓力，不要解終局。"
              : isFinal
                ? "承接全部前文，完成局部回報、保留長線答案，最後三行用規劃中的具體物件／時間／名字收鉤。"
                : index === 4
                  ? "現場第二層壓力已出現；直接寫吃飯或休息冷卻、人物疲勞與關係選擇，暫不結案。"
                  : "冷卻已過；直接寫更深一項可驗證的證據、普通人的實際回報與關係改變，暫不寫最終鉤子。";
      const low = isFinal ? Math.max(250, 6020 - priorChars) : 900;
      const high = isFinal ? Math.min(1250, 6450 - priorChars) : 1150;
      const prompt = `你是天書原創繁體中文長篇作者。只寫完全原創小說，不模仿任何作品。續寫《${book.title}》第109章〈${book.chapterTitle}〉的第${index + 1}個連續場景。\n\n作者聲音：${book.voice}\n\n完整事件規劃：${book.beats.join(" ")}\n本場景只做這件事：${stage}\n\n硬規則：輸出${low}到${high}個繁體中文非空白字，只輸出沉浸式正文，不要章名、說明、提綱、Markdown、創作評語。不得出現「這一章」「讀者會」「主角」「章末」「第一章的安排」「第二章會」等後設字。必須有具體動作、感官、工作摩擦、羞恥或疲勞；節奏要有長短、急停、冷卻、再壓回。避免重複句子、段落或同一轉折骨架。不得把線索直接解成身分或終局。${index === 0 ? "開頭300字內讓具體人物、麻煩、代價同時出現。" : "前文已完成前面的事件；不要重寫危機開場，不要總結，第一句就進入本場景的新動作。"}${isFinal ? "最後三行必須各自成行、具體可追，不能抽象抒情。" : "本段末尾自然承接，不做總結式懸念。"}\n\n第108章最後現場只供聲線與連貫參考，不可重述：\n${previous.slice(-1600)}\n\n現在直接寫全新的本場景正文。`;
      const text = await ask(prompt);
      const chars = count(text);
      const combined = [...parts, text].join("\n\n");
      const dupes = duplicateParagraphs(combined);
      console.log(`${book.title} part=${index + 1} attempt=${attempt} chars=${chars} dupes=${dupes.length}`);
      const min = isFinal ? Math.max(200, 6000 - priorChars) : 800;
      const max = isFinal ? Math.min(1350, 6500 - priorChars) : 1300;
      const deduped = removeSeenParagraphs(text, prior);
      const dedupedChars = count(deduped);
      const desired = Math.max(min, Math.min(max, isFinal ? 6200 - priorChars : 1000));
      if (dedupedChars >= Math.max(300, min - 450) && dedupedChars <= max + 200) {
        const score = Math.abs(dedupedChars - desired) + dupes.length * 25;
        if (score < fallbackScore) { fallback = deduped; fallbackScore = score; }
      }
      if (chars >= min && chars <= max && dupes.length === 0) { accepted = text; break; }
    }
    if (!accepted && fallback) {
      accepted = fallback;
      console.log(`${book.title} part=${index + 1} accepted-deduped chars=${count(accepted)}`);
    }
    if (!accepted) throw new Error(`${book.title}: could not generate acceptable part ${index + 1}`);
    parts.push(accepted);
  }
  let body = parts.join("\n\n").trim() + "\n";
  const total = count(body);
  if (total < 5800 || total > 6500) {
    throw new Error(`${book.title}: draft length ${total} outside 5800-6500`);
  }
  writeFileSync(output, body, "utf8");
  console.log(`${book.title} wrote ${output} chars=${total} slot=${slot}`);
}
