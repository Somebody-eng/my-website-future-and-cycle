export const SITE_NAME = "未来与周期｜长期主义商业思想笔记";
export const SITE_SHORT_NAME = "未来与周期";
export const SITE_DESCRIPTION =
  "围绕长期主义、现金流、护城河、定价权、资本配置和理性决策的中文商业思想笔记。";
export const DEFAULT_AUTHOR = "未来与周期编辑部";
export const DEFAULT_DISCLAIMER = "本文仅用于商业与投资教育讨论，不构成任何投资建议。";

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || "https://future-cycle.pages.dev").replace(/\/$/, "");

export const categories = [
  {
    name: "巴菲特为什么",
    slug: "buffett-why",
    description: "用商业常识解读巴菲特重视现金流、定价权、低负债和资本配置的原因。"
  },
  {
    name: "芒格的思维模型",
    slug: "munger-models",
    description: "从多元思维模型、反向思考和避免愚蠢出发，理解更稳健的决策方式。"
  },
  {
    name: "好生意案例库",
    slug: "great-business-cases",
    description: "拆解优秀企业案例中的护城河、品牌、渠道、定价权和现金流质量。"
  },
  {
    name: "长期主义与普通人",
    slug: "long-termism-for-individuals",
    description: "把长期主义转译为普通人的职业发展、副业选择和能力复利。"
  },
  {
    name: "AI与科技巨头",
    slug: "ai-tech-giants",
    description: "观察 AI 时代科技巨头的商业模式、护城河、算力投入和现金流约束。"
  },
  {
    name: "股东信与经典文本解读",
    slug: "shareholder-letters",
    description: "以解读方式学习经典股东信和商业文本，不做大段翻译或投资建议。"
  },
  {
    name: "段永平与经营思想",
    slug: "duan-yongping",
    description: "关注本分、企业文化、消费者导向和长期经营质量。"
  },
  {
    name: "人物思想地图",
    slug: "idea-maps",
    description: "梳理商业人物的方法论、关键词和可迁移启发。"
  }
];

export const categoryByName = new Map(categories.map((category) => [category.name, category]));

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function categoryHref(categoryName: string) {
  return `/categories/${encodeURIComponent(categoryName)}/`;
}

export function tagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}/`;
}
