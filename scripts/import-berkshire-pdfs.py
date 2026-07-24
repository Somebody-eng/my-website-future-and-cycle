#!/usr/bin/env python3
"""Import the user-supplied Berkshire meeting PDF archive into Astro posts."""

from __future__ import annotations

import argparse
import math
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

from pypdf import PdfReader


CATEGORY = "伯克希尔股东会实录"
DISCLAIMER = "本文仅用于商业与投资教育讨论，不构成任何投资建议。"
TOC_PAGE_INDICES = range(1, 5)
YEAR_RE = re.compile(r"((?:19|20)\d{2})")
TOC_ENTRY_RE = re.compile(r"((?:19|20)\d{2}).*?(\d+)\s*$")
PAGE_NUMBER_RE = re.compile(r"^\d{1,4}$")
QUESTION_HEADING_RE = re.compile(r"^\d{1,3}\s*[、.．]\s*\S")
SPEAKER_RE = re.compile(
    r"^(?:沃伦[·•]?巴菲特|巴菲特|查理[·•]?芒格|芒格|股东|提问者|观众|主持人|"
    r"贝基|Becky|格雷格|阿贝尔|记者|播音员|问|答|Q|A)\s*[:：]"
)
SECTION_RE = re.compile(r"^(?:19|20)\d{2}\s*年?.*(?:股东大会|大会问答|问答实录|全程实录)")
PROMO_PATTERNS = (
    "关注公众号",
    "点击上方【白湖水】",
    "设为星标",
    "感谢阅读",
    "本文来自腾讯新闻客户端创作者",
)

ATTRIBUTION_BLOCK_RE = re.compile(
    r"URL[:：]\s*https?://.*?所有引用必须注明来自\s*CNBC。.*?--------\s*正文\s*--------",
    re.DOTALL,
)
ACCOUNT_LINK_RE = re.compile(
    r"（注：敏感话题，请读者上雪球.*?主页置顶帖内自行查阅）.*?个人雪球置顶帖：https?://\S+"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("upper_pdf", type=Path, help="1994-2006 PDF")
    parser.add_argument("lower_pdf", type=Path, help="2007-2023 PDF")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/content/posts"),
        help="Astro posts directory",
    )
    return parser.parse_args()


def normalize_line(raw: str) -> str:
    line = raw.replace("\u00a0", " ").replace("\x00", " ").strip()
    line = re.sub(r"\s+", " ", line)
    line = re.sub(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])", "", line)
    line = re.sub(r"\s+([，。！？；：、）】])", r"\1", line)
    line = re.sub(r"([（【])\s+", r"\1", line)
    return line


def should_drop(line: str) -> bool:
    if not line or PAGE_NUMBER_RE.fullmatch(line):
        return True
    if "白湖水" in line and ("收集" in line or "公众号" in line or "点击" in line):
        return True
    if line in {"免责声明", "信息。"}:
        return True
    return any(pattern in line for pattern in PROMO_PATTERNS)


def read_toc_entries(reader: PdfReader) -> list[tuple[int, int, str]]:
    entries: list[tuple[int, int, str]] = []
    seen: set[tuple[int, int]] = set()
    for page_index in TOC_PAGE_INDICES:
        text = reader.pages[page_index].extract_text() or ""
        for raw in text.splitlines():
            line = normalize_line(raw)
            match = TOC_ENTRY_RE.search(line)
            if not match:
                continue
            year, start_page = int(match.group(1)), int(match.group(2))
            if not (1994 <= year <= 2023 and 1 <= start_page <= len(reader.pages)):
                continue
            key = (year, start_page)
            if key in seen:
                continue
            seen.add(key)
            title = re.sub(r"\.{3,}\s*\d+\s*$", "", line).strip()
            entries.append((start_page, year, title))
    return sorted(entries)


def join_wrapped(previous: str, current: str) -> str:
    if not previous:
        return current
    separator = " " if re.search(r"[A-Za-z0-9]$", previous) and re.match(r"^[A-Za-z0-9]", current) else ""
    return previous + separator + current


def format_segment(title: str, page_texts: list[str]) -> tuple[str, int]:
    lines: list[str] = []
    for page_text in page_texts:
        for raw in page_text.splitlines():
            line = normalize_line(raw)
            if should_drop(line):
                continue
            lines.append(line)

    while lines and (PAGE_NUMBER_RE.fullmatch(lines[0]) or lines[0] == title):
        lines.pop(0)

    section_title = normalize_line(title)
    paragraphs: list[str] = []
    current = ""

    for line in lines:
        if line == section_title or SECTION_RE.match(line):
            continue
        starts_block = bool(QUESTION_HEADING_RE.match(line) or SPEAKER_RE.match(line))
        if starts_block:
            if current:
                paragraphs.append(current)
            current = line
        else:
            current = join_wrapped(current, line)
    if current:
        paragraphs.append(current)

    body_lines = [f"## {section_title}", ""]
    for paragraph in paragraphs:
        if QUESTION_HEADING_RE.match(paragraph):
            body_lines.extend([f"**{paragraph}**", ""])
        else:
            body_lines.extend([paragraph, ""])
    body = "\n".join(body_lines).strip()
    return body, len(re.findall(r"[\u3400-\u9fff]", body))


def extract_pdf(pdf_path: Path) -> dict[int, list[tuple[int, str, str]]]:
    reader = PdfReader(str(pdf_path))
    entries = read_toc_entries(reader)
    if not entries:
        raise RuntimeError(f"未能从目录提取分段：{pdf_path}")

    grouped: dict[int, list[tuple[int, str, str]]] = defaultdict(list)
    for index, (start_page, year, title) in enumerate(entries):
        end_page = entries[index + 1][0] if index + 1 < len(entries) else len(reader.pages) + 1
        page_texts = [reader.pages[p - 1].extract_text() or "" for p in range(start_page, end_page)]
        body, chinese_chars = format_segment(title, page_texts)
        grouped[year].append((start_page, body, str(chinese_chars)))
    return grouped


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def build_post(year: int, segments: list[tuple[int, str, str]]) -> str:
    segments = sorted(segments, key=lambda item: item[0])
    body = "\n\n".join(segment[1] for segment in segments)
    body = ATTRIBUTION_BLOCK_RE.sub("", body)
    body = ACCOUNT_LINK_RE.sub("（注：原资料此处未收录完整问答。）", body)
    body = body.replace("一朵喵注", "编者注")
    body = body.replace("一朵喵说", "").replace("一朵喵", "")
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    chinese_chars = len(re.findall(r"[\u3400-\u9fff]", body))
    reading_time = max(1, math.ceil(chinese_chars / 500))
    title = f"{year}年伯克希尔股东会实录"
    description = f"{year}年伯克希尔股东大会问答实录，按会议原文分段整理，保留完整问答脉络。"
    frontmatter = [
        "---",
        f"title: {yaml_quote(title)}",
        f"description: {yaml_quote(description)}",
        f"date: {date.today().isoformat()}",
        f"updatedDate: {date.today().isoformat()}",
        f"category: {yaml_quote(CATEGORY)}",
        'tags: ["伯克希尔股东会", "巴菲特", "芒格", "股东大会实录"]',
        'slug: ' + yaml_quote(f"berkshire-meeting-{year}"),
        'author: "未来与周期编辑部"',
        'coverImage: "/images/covers/default.svg"',
        f'coverAlt: "{year}年伯克希尔股东会实录封面"',
        f"readingTime: {reading_time}",
        f"featured: {'true' if year == 2023 else 'false'}",
        f"disclaimer: {yaml_quote(DISCLAIMER)}",
        "sources: []",
        "---",
        "",
    ]
    return "\n".join(frontmatter) + body + "\n"


def main() -> None:
    args = parse_args()
    for pdf_path in (args.upper_pdf, args.lower_pdf):
        if not pdf_path.is_file():
            raise FileNotFoundError(pdf_path)

    grouped: dict[int, list[tuple[int, str, str]]] = defaultdict(list)
    for pdf_path in (args.upper_pdf, args.lower_pdf):
        for year, segments in extract_pdf(pdf_path).items():
            grouped[year].extend(segments)

    expected_years = list(range(1994, 2024))
    missing = [year for year in expected_years if year not in grouped]
    if missing:
        raise RuntimeError(f"PDF 缺少年度：{missing}")

    args.output.mkdir(parents=True, exist_ok=True)
    for year in expected_years:
        output_path = args.output / f"berkshire-meeting-{year}.md"
        output_path.write_text(build_post(year, grouped[year]), encoding="utf-8")
        print(f"已生成 {output_path}")


if __name__ == "__main__":
    main()
