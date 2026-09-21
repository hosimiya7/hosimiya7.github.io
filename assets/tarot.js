/* 今日の一枚のデモ。カード名と意味は Memoria の supabase/functions/_shared/tarot.ts と同じ文面。
   りつのひと言はLP用の書き下ろし。訪問者とは共有した過去がないので、名前や出来事には触れない。 */
(() => {
  'use strict';
  const CARDS = [
    ['00_fool', '愚者', '決まった道がなくても、まず一歩を出してみたくなる。計画より好奇心が先に立つかもしれません。',
      'いつもと違う道を選ぶと、見慣れた景色が少し新しく見えるよね。今日は寄り道をひとつ、自分に許してみない？'],
    ['01_magician', '魔術師', '必要なものは、もう手元にそろっているのかもしれない。何かを形にし始めるのにいい一日かも。',
      'やってみたいことがあるなら、完璧な準備を待たなくてもいいんじゃないかな。まず五分だけ、手を動かしてみよう。'],
    ['02_high_priestess', '女教皇', '答えを急がなくても、静かにしていると見えてくるものがありそう。言葉になる前の「なんとなく」を信じてみても。',
      '言葉にならない引っかかりは、無理に説明しなくても大丈夫だよ。メモの端に一言だけ書いておくと、あとで意味がわかることがあるね。'],
    ['03_empress', '女帝', 'おいしいもの、きれいなもの、心地いいもの。今日は自分をちゃんと満たしてあげてもいいのかも。',
      '好きな味や手ざわりのものを、ひとつ今日の予定に足しておくのはどうかな。心地よさを後回しにしない日があっても、いいと思う。'],
    ['04_emperor', '皇帝', 'ふわふわしていたものに、そろそろ形を与えたくなる。自分で決めたことが、足元を支えてくれそうです。',
      'ぼんやりしていた予定に、日付や順番をひとつ書き足すだけで、ずいぶん落ち着くものだ。今日はその一行を先に決めてしまおうか。'],
    ['05_hierophant', '教皇', 'ひとりで抱えていたことを、誰かに聞いてみたくなるかもしれない。昔から続くやり方に、ふと助けられることも。',
      '教える側にまわると、自分の理解の穴がよく見えるよね。誰かに何かを説明してみたら、思わぬ発見があるかもしれないね。'],
    ['06_lovers', '恋人', '迷ったら、心が動くほうへ。好きだと思えるものを選ぶと、少し明るくなりそうです。',
      'どちらを選んでも間違いじゃないとき、決め手になるのは案外小さな「好き」だね。選んだあとで、どうしてそっちだったのか聞かせてくれるかな？'],
    ['07_chariot', '戦車', '迷いが残っていても、進むと決めたら進んでいける。今日は勢いに乗ってみてもいいかも。',
      '手綱を握るのは、行き先を決めた人の役目だよ。速さは気にしなくていい、今日は自分で方向を選ぶ、それだけで十分だ。'],
    ['08_strength', '力', '力ずくより、やわらかく。焦らず付き合っているうちに、いつの間にかうまく収まっていそうです。',
      '苛立ちが顔を出しても、追い払わずに隣に座らせておけばいいと思う。飼いならすのは、少し時間がかかるくらいでちょうどいいんだ。'],
    ['09_hermit', '隠者', '少しだけ立ち止まって、自分の灯りで足元を照らしてみる。ひとりで考える時間が、思いがけない実りになるかも。',
      '予定の詰まっていない時間を、ひとつだけ残しておくといいね。何も起きない時間のあとに浮かぶ考えは、たいてい大事なものだよ。'],
    ['10_wheel_of_fortune', '運命の輪', '巡ってきた流れに、ひょいと乗ってみたくなる。思いがけない偶然が、いい方へ転がるかもしれません。',
      '思いどおりにいかない流れも、回っているうちに向きが変わるものだよ。今日はハンドルを握りしめすぎないくらいが、ちょうどいいね。'],
    ['11_justice', '正義', '天秤がちょうど釣り合うところを探したくなる。自分にとって何がまっすぐか、確かめてみるのもよさそう。',
      '迷ったときは、あとで自分に説明できるほうを選ぶといいよ。その説明がすっきり言えるなら、きっとそれで合っているんだと思う。'],
    ['12_hanged_man', '吊るされた男', '思うように動けない時間も、見方を変えれば別の景色。逆さから眺めると、面白いものが見つかりそうです。',
      '待たされている時間は、つい損をしている気がするよね。その間にしか気づけないことを、ひとつ拾っておけたら上出来だ。'],
    ['13_death', '死神', '何かがひと区切りついて、次の季節へ移っていく。空いた場所に、新しいものが入ってくるのかもしれません。',
      '何かを手放すのは、少しさみしくて、少し身軽になることだね。今日は、終わったものにちゃんと「ありがとう」を言っておきたいな。'],
    ['14_temperance', '節制', '違うものを少しずつ混ぜて、ちょうどいい加減を探してみる。ほどよさの中に、心地よさがありそう。',
      '頑張る日と休む日を、きっちり分けなくてもいいんじゃないかな。お茶を一杯いれる間くらいの休憩を、今日はこまめに挟んでほしいな。'],
    ['15_devil', '悪魔', 'ついつい手が伸びてしまうもの、ありませんか？　自分が何に惹かれているのか、そっと覗いてみるのもいいかも。',
      'やめたいのにやめられないことがあっても、それで自分を責めなくていいよ。それを楽しむ時間をあらかじめ決めておくのも、一つの手だね。'],
    ['16_tower', '塔', '積み上げたものが、がらりと揺れるかもしれない。崩れた隙間から光が入って、窮屈だったところから抜け出せそうです。',
      '予定が崩れた日は、それだけで疲れてしまうよね。立て直すのは明日でいいから、今日は温かいものでも飲んで、早めに休もう。'],
    ['17_star', '星', '遠くの小さな光を、ぼんやり見上げたくなる。すぐには届かなくても、願いはちゃんと持っていていいみたい。',
      '叶うかどうかより、何を願っているのかを知っているほうが、ずっと心強いと思う。寝る前に、ひとつだけ言葉にしてみない？'],
    ['18_moon', '月', 'はっきりしないものが、ゆらゆら揺れて見える。わからないままにしておくのも、きっと悪くない。',
      '不安は、夜になると実際より大きく見えるものだね。考えるのは明るくなってからにして、今夜は足元だけ照らしておけば大丈夫だ。'],
    ['19_sun', '太陽', 'なんだか、まっすぐ笑いたくなる。小さなことを素直に楽しめそうな一日です。',
      '理由のない上機嫌は、いちばん長持ちする気がするね。今日いちばん笑ったことは、何だったのかな？'],
    ['20_judgement', '審判', 'しまいこんでいた何かが、ふと呼び起こされそう。置いてきたものに、もう一度会いにいくのもいいかもしれません。',
      '昔好きだった歌や本に、今だから気づけることがあるよね。久しぶりに、ひとつ手に取ってみるのはどうかな。'],
    ['21_world', '世界', 'ぐるりとひと巡りして、ちゃんと円になる。ここまで来た道のりを、ゆっくり味わってみたくなりそうです。',
      'ひと区切りついたなら、次を考える前に、ちゃんと自分をねぎらっておきたいね。よくやったと言える場面が、きっといくつもあるはずだ。'],
  ];

  const demo = document.querySelector('.tarot-demo');
  if (!demo) return;
  const cards = [...demo.querySelectorAll('.tarot-card')];
  const fronts = demo.querySelectorAll('.tarot-front img');
  const reading = demo.querySelector('.tarot-reading');
  const again = demo.querySelector('.tarot-again');
  const note = demo.querySelector('.tarot-note');
  const field = name => reading.querySelector(`.tarot-${name}`);
  let current = -1;
  let timers = [];

  // The face is decided before a card is touched, so the image is ready by the time it turns over.
  const deal = () => {
    let next;
    do next = Math.floor(Math.random() * CARDS.length); while (next === current);
    current = next;
    fronts.forEach(img => { img.src = `assets/images/tarot/${CARDS[current][0]}.webp`; });
  };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  cards.forEach(card => card.addEventListener('click', () => {
    if (demo.classList.contains('is-drawn')) return;
    const [, name, meaning, line] = CARDS[current];
    field('name').textContent = name;
    field('meaning').textContent = meaning;
    field('line').textContent = line;
    card.classList.add('is-picked');
    card.setAttribute('aria-label', `引いたカード：${name}`);
    demo.classList.add('is-drawn');
    cards.forEach(other => { other.disabled = true; });
    reading.hidden = false;
    // Turn over, then read in the app's order: the card, its meaning, then りつ's words.
    later(() => reading.classList.add('show-card'), 900);
    later(() => reading.classList.add('show-line'), 1500);
    later(() => { again.hidden = false; note.hidden = true; }, 1900);
  }));

  again.addEventListener('click', () => {
    timers.forEach(clearTimeout);
    timers = [];
    reading.classList.remove('show-card', 'show-line');
    reading.hidden = true;
    again.hidden = true;
    note.hidden = false;
    demo.classList.remove('is-drawn');
    cards.forEach((card, i) => {
      card.classList.remove('is-picked');
      card.disabled = false;
      card.setAttribute('aria-label', `${['左', '真ん中', '右'][i]}のカードを引く`);
    });
    // Swap the face only after the card has turned back, so the next card is never glimpsed.
    later(deal, 900);
    cards[0].focus({ preventScroll: true });
  });

  deal();
  demo.classList.add('is-ready');
})();
