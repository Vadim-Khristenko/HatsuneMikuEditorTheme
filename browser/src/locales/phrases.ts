import type { Lang } from "../i18n";

/**
 * Greeting banks. `{name}` becomes ", Name" (or nothing when no name is set), `{age}` the user's new age,
 * `{when}` a relative time like "in 3 days". Phrases speak to the user without gendered verb forms.
 */
export interface Phrases {
  morning: string[];
  day: string[];
  evening: string[];
  night: string[];
  late: string[];
  monday: string[];
  friday: string[];
  weekend: string[];
  newYear: string[];
  mikuBirthday: string[];
  mikuDay: string[];
  halloween: string[];
  birthday: string[];
  birthdayAge: string[];
  soon: string;
  stage: string[];
  zen: string[];
}

const ru: Phrases = {
  morning: [
    "Доброе утро{name}.",
    "Утро{name}. Кофе уже рядом?",
    "С добрым утром{name}. День пока чистый лист.",
    "Подъём{name}! Мику уже распевается.",
    "Утренний саундчек{name}: всё звучит.",
    "Привет{name}. Начнём с чего-нибудь приятного.",
  ],
  day: [
    "Добрый день{name}.",
    "Полдень{name}. Самое время для лёгкой мелодии.",
    "Хорошего дня{name}. Держим ритм.",
    "Привет{name}! Как идёт день?",
    "Середина дня{name}. Маленький перерыв не помешает.",
    "День в разгаре{name}.",
  ],
  evening: [
    "Добрый вечер{name}.",
    "Вечер{name}. Можно выдохнуть.",
    "Тёплого вечера{name}.",
    "Вечерний сет{name}: что сегодня в плейлисте?",
    "Свет мягче, музыка тише. Привет{name}.",
    "Хороший вечер для спокойных дел{name}.",
  ],
  night: [
    "Доброй ночи{name}.",
    "Ночная смена{name}?",
    "Тихо и уютно. Привет{name}.",
    "Звёзды на месте{name}. Мику тоже.",
  ],
  late: [
    "Уже поздно{name}. Может, спать?",
    "Глубокая ночь{name}. Сон тоже часть ритма.",
    "Ночная тишина{name}. Только не до утра, ладно?",
    "Совы одобряют{name}. Но отдохнуть всё равно нужно.",
  ],
  monday: ["Понедельник{name}. Новая неделя, новый трек.", "С понедельником{name}. Начнём спокойно."],
  friday: ["Пятница{name}! Финальный припев недели.", "Ура, пятница{name}."],
  weekend: ["Выходной{name}. Можно никуда не спешить.", "Хороших выходных{name}."],
  newYear: ["С Новым годом{name}!", "Новый год{name}! Пусть он звучит чисто."],
  mikuBirthday: ["Сегодня день рождения Мику! С праздником{name}.", "31 августа, Мику празднует. Поздравим вместе{name}!"],
  mikuDay: ["Сегодня 3/9, день Мику{name}!", "Ми-ку: 3 и 9. Хороший день{name}."],
  halloween: ["Жуткого Хэллоуина{name}!", "Хэллоуин{name}. Мику уже в костюме."],
  birthday: ["С днём рождения{name}!", "Сегодня твой день{name}. С днём рождения!", "С днём рождения{name}! Пусть год звучит как любимая песня."],
  birthdayAge: ["С днём рождения{name}! Сегодня тебе {age}.", "{age}! С днём рождения{name}."],
  soon: "До твоего дня рождения {when}.",
  stage: [
    "Что слушаем сегодня?",
    "Какой трек поставим?",
    "Включай что-нибудь любимое.",
    "Самое время для плейлиста.",
    "Звук на месте, можно начинать.",
    "Пусть день звучит красиво.",
  ],
  zen: [
    "Тихий момент. Ничего срочного.",
    "Дыши ровно, всё успеется.",
    "Немного тишины перед делами.",
    "Здесь спокойно.",
    "Один вдох, одна задача.",
    "Медленно тоже можно.",
  ],
};

const en: Phrases = {
  morning: [
    "Good morning{name}.",
    "Morning{name}. Is the coffee close?",
    "Rise and shine{name}. The day is still a blank page.",
    "Up and at it{name}! Miku is already warming up.",
    "Morning soundcheck{name}: everything sounds right.",
    "Hi{name}. Let us start with something nice.",
  ],
  day: [
    "Good afternoon{name}.",
    "Midday{name}. Perfect time for a light melody.",
    "Have a good one{name}. Keep the rhythm.",
    "Hey{name}! How is the day going?",
    "Halfway through{name}. A short break would not hurt.",
    "The day is in full swing{name}.",
  ],
  evening: [
    "Good evening{name}.",
    "Evening{name}. Time to breathe out.",
    "Have a warm evening{name}.",
    "Evening set{name}: what is on the playlist?",
    "Softer light, quieter music. Hi{name}.",
    "A good evening for calm work{name}.",
  ],
  night: [
    "Good night{name}.",
    "Night shift{name}?",
    "Quiet and cozy. Hi{name}.",
    "The stars are out{name}. So is Miku.",
  ],
  late: [
    "It is late{name}. Maybe sleep?",
    "Deep night{name}. Sleep is part of the rhythm too.",
    "Night silence{name}. Just not until sunrise, okay?",
    "The owls approve{name}. Still, rest matters.",
  ],
  monday: ["Monday{name}. New week, new track.", "Happy Monday{name}. Let us start slow."],
  friday: ["Friday{name}! The final chorus of the week.", "Yay, Friday{name}."],
  weekend: ["Day off{name}. No need to hurry.", "Happy weekend{name}."],
  newYear: ["Happy New Year{name}!", "New year{name}! May it sound crystal clear."],
  mikuBirthday: ["It is Miku's birthday today! Celebrate with us{name}.", "August 31, Miku is celebrating. Join in{name}!"],
  mikuDay: ["It is 3/9, Miku Day{name}!", "Mi-ku: 3 and 9. A good day{name}."],
  halloween: ["Spooky Halloween{name}!", "Halloween{name}. Miku is already in costume."],
  birthday: ["Happy birthday{name}!", "Today is your day{name}. Happy birthday!", "Happy birthday{name}! May this year sound like your favorite song."],
  birthdayAge: ["Happy birthday{name}! You are {age} today.", "{age}! Happy birthday{name}."],
  soon: "Your birthday is {when}.",
  stage: [
    "What are we listening to today?",
    "Which track is next?",
    "Put on something you love.",
    "Perfect time for a playlist.",
    "Sound is set, ready when you are.",
    "Let the day sound beautiful.",
  ],
  zen: [
    "A quiet moment. Nothing urgent.",
    "Breathe easy, there is time.",
    "A little silence before the work.",
    "It is calm here.",
    "One breath, one task.",
    "Slow is fine too.",
  ],
};

const zh: Phrases = {
  morning: [
    "早上好{name}。",
    "早安{name}，咖啡准备好了吗？",
    "新的一天{name}，还是一张白纸。",
    "起床啦{name}！初音已经在开嗓了。",
    "早晨试音{name}：一切正常。",
    "你好{name}，从一件开心的小事开始吧。",
  ],
  day: [
    "下午好{name}。",
    "中午了{name}，来一段轻快的旋律吧。",
    "祝你今天顺利{name}，保持节奏。",
    "嗨{name}！今天过得怎么样？",
    "一天过半{name}，休息一下也不错。",
    "忙碌的一天正在进行{name}。",
  ],
  evening: [
    "晚上好{name}。",
    "傍晚了{name}，可以松口气了。",
    "祝你有个温暖的夜晚{name}。",
    "晚间歌单{name}：今天听什么？",
    "灯光柔和，音乐轻柔。你好{name}。",
    "适合安静做事的夜晚{name}。",
  ],
  night: [
    "晚安{name}。",
    "夜班吗{name}？",
    "安静又舒适。你好{name}。",
    "星星出来了{name}，初音也在。",
  ],
  late: [
    "很晚了{name}，要不要睡觉？",
    "深夜了{name}，睡眠也是节奏的一部分。",
    "夜深人静{name}，别熬到天亮哦。",
    "猫头鹰点赞{name}，不过还是要休息。",
  ],
  monday: ["星期一{name}，新的一周，新的曲子。", "周一快乐{name}，慢慢开始吧。"],
  friday: ["星期五{name}！一周的最后副歌。", "耶，周五啦{name}。"],
  weekend: ["休息日{name}，不用着急。", "周末愉快{name}。"],
  newYear: ["新年快乐{name}！", "新的一年{name}！愿它清澈动听。"],
  mikuBirthday: ["今天是初音的生日！一起庆祝吧{name}。", "8 月 31 日，初音生日快乐{name}！"],
  mikuDay: ["今天是 3/9，初音日{name}！", "Mi-ku：3 和 9。美好的一天{name}。"],
  halloween: ["万圣节快乐{name}！", "万圣节{name}，初音已经换好装了。"],
  birthday: ["生日快乐{name}！", "今天是你的日子{name}，生日快乐！", "生日快乐{name}！愿这一年像你最爱的歌一样动听。"],
  birthdayAge: ["生日快乐{name}！今天你 {age} 岁了。", "{age} 岁！生日快乐{name}。"],
  soon: "你的生日{when}。",
  stage: ["今天听点什么？", "下一首放什么？", "放一首你喜欢的歌吧。", "正是听歌单的好时候。", "声音就绪，随时开始。", "让今天听起来很美。"],
  zen: ["安静片刻，没有急事。", "慢慢呼吸，时间够用。", "开始工作前，先安静一下。", "这里很平静。", "一次呼吸，一件事。", "慢一点也没关系。"],
};

export const PHRASES: Record<Lang, Phrases> = { ru, en, zh };
