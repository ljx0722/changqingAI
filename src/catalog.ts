import { courses, type Category, type Grade } from "./data/content.ts";
const categoryIds: Category[] = ["youth", "adult", "career", "camp"];
const gradeIds: Grade[] = [
  "all",
  "primary-low",
  "primary-high",
  "middle",
  "high",
];
export function parseCatalog(hash: string) {
  const params = new URLSearchParams(hash.split("?")[1] || "");
  const category = categoryIds.includes(params.get("category") as Category)
    ? (params.get("category") as Category)
    : "youth";
  const grade =
    category === "youth" && gradeIds.includes(params.get("grade") as Grade)
      ? (params.get("grade") as Grade)
      : "all";
  return { category, grade, query: (params.get("q") || "").slice(0, 80) };
}
export function filterCourses(category: Category, grade: Grade, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return courses.filter(
    (course) =>
      course.category === category &&
      (grade === "all" || !course.grades || course.grades.includes(grade)) &&
      `${course.title} ${course.description} ${course.tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(needle),
  );
}
export function inquiryText(values: {
  name: string;
  role: string;
  topic: string;
  goal: string;
}) {
  return [
    "长晴AI · 合作沟通清单",
    "上海长序逢晴智能科技有限公司",
    "",
    `称呼：${values.name.trim() || "暂未填写"}`,
    `身份：${values.role}`,
    `意向：${values.topic}`,
    `希望解决的问题：${values.goal.trim()}`,
    "",
    "联系常老师：17821821196",
    "此清单由访客生成，未向网站提交。",
  ].join("\n");
}
