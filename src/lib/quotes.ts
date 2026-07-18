export interface DailyQuote {
  text: string;
  author: string;
  source: string;
  sourceUrl: string;
  portrait: string;
  portraitAlt: string;
  note?: string;
}

export const dailyQuotes: DailyQuote[] = [
  {
    text: "如果你不愿意拥有一家公司十年，就不要考虑拥有它十分钟。",
    author: "沃伦·巴菲特",
    source: "伯克希尔·哈撒韦 1996 年股东信",
    sourceUrl: "https://www.berkshirehathaway.com/letters/1996.html",
    portrait: "/images/people/buffett.jpg",
    portraitAlt: "沃伦·巴菲特彩色头像",
    note: "中文意译"
  },
  {
    text: "避免愚蠢，要比努力变得聪明容易得多。",
    author: "查理·芒格",
    source: "Poor Charlie's Almanack",
    sourceUrl: "https://www.poorcharliesalmanack.com/",
    portrait: "/images/people/munger.svg",
    portraitAlt: "查理·芒格彩色头像",
    note: "观点解读"
  },
  {
    text: "长期经营的重要起点，是知道什么不会轻易改变。",
    author: "杰夫·贝索斯",
    source: "Amazon 股东信长期主题解读",
    sourceUrl: "https://www.aboutamazon.com/news/company-news/amazon-shareholder-letters",
    portrait: "/images/people/bezos.jpg",
    portraitAlt: "杰夫·贝索斯彩色头像",
    note: "观点摘记"
  },
  {
    text: "做对的事情，并把事情做对，时间会放大这种选择。",
    author: "段永平",
    source: "段永平经营思想公开讨论解读",
    sourceUrl: "/categories/%E6%AE%B5%E6%B0%B8%E5%B9%B3%E4%B8%8E%E7%BB%8F%E8%90%A5%E6%80%9D%E6%83%B3/",
    portrait: "/images/people/duan.svg",
    portraitAlt: "段永平彩色头像标识",
    note: "观点摘记"
  }
];
