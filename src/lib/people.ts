export interface PersonProfile {
  name: string;
  label: string;
  idea: string;
  image: string;
  imageAlt: string;
  href: string;
}

export const people: PersonProfile[] = [
  {
    name: "沃伦·巴菲特",
    label: "巴菲特",
    idea: "价值与资本配置",
    image: "/images/people/buffett.jpg",
    imageAlt: "沃伦·巴菲特彩色头像",
    href: "/categories/%E5%B7%B4%E8%8F%B2%E7%89%B9%E4%B8%BA%E4%BB%80%E4%B9%88/"
  },
  {
    name: "查理·芒格",
    label: "芒格",
    idea: "多元思维模型",
    image: "/images/people/munger.svg",
    imageAlt: "查理·芒格彩色头像",
    href: "/categories/%E8%8A%92%E6%A0%BC%E7%9A%84%E6%80%9D%E7%BB%B4%E6%A8%A1%E5%9E%8B/"
  },
  {
    name: "段永平",
    label: "段永平",
    idea: "本分与常识",
    image: "/images/people/duan.svg",
    imageAlt: "段永平彩色头像标识",
    href: "/categories/%E6%AE%B5%E6%B0%B8%E5%B9%B3%E4%B8%8E%E7%BB%8F%E8%90%A5%E6%80%9D%E6%83%B3/"
  },
  {
    name: "杰夫·贝索斯",
    label: "贝索斯",
    idea: "长期主义",
    image: "/images/people/bezos.jpg",
    imageAlt: "杰夫·贝索斯彩色头像",
    href: "/categories/%E4%BA%BA%E7%89%A9%E6%80%9D%E6%83%B3%E5%9C%B0%E5%9B%BE/"
  },
  {
    name: "黄仁勋",
    label: "黄仁勋",
    idea: "工程师思维",
    image: "/images/people/huang.jpg",
    imageAlt: "黄仁勋彩色头像",
    href: "/categories/AI%E4%B8%8E%E7%A7%91%E6%8A%80%E5%B7%A8%E5%A4%B4/"
  },
  {
    name: "埃隆·马斯克",
    label: "马斯克",
    idea: "第一性原理",
    image: "/images/people/musk.jpg",
    imageAlt: "埃隆·马斯克彩色头像",
    href: "/categories/%E4%BA%BA%E7%89%A9%E6%80%9D%E6%83%B3%E5%9C%B0%E5%9B%BE/"
  }
];

export const editorProfile = {
  name: "未来与周期编辑部",
  image: "/images/people/editor.svg",
  imageAlt: "未来与周期编辑部彩色标识"
};
