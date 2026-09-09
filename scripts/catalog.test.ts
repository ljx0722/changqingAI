import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCatalog, filterCourses, inquiryText } from '../src/catalog.ts';
import { courses } from '../src/data/content.ts';

test('Shared catalog links restore category, grade and a Chinese search',()=>{
  assert.deepEqual(parseCatalog('#academy?category=youth&grade=middle&q=%E7%94%B5%E5%BD%B1'),{category:'youth',grade:'middle',query:'电影'});
  assert.deepEqual(parseCatalog('#academy?category=career&grade=middle'),{category:'career',grade:'all',query:''});
});
test('Unknown URL filters safely return a usable catalog',()=>{
  assert.deepEqual(parseCatalog('#academy?category=invalid&grade=unknown'),{category:'youth',grade:'all',query:''});
});
test('A family can find the film course by theme and school stage',()=>{
  assert.deepEqual(filterCourses('youth','middle','电影').map(c=>c.id),['youth-film']);
  assert.equal(filterCourses('youth','primary-low','').length,6);
});
test('Search stays within the chosen audience and returns an honest empty result',()=>{
  assert.equal(filterCourses('adult','all','视频')[0]?.id,'adult-ai-video');
  assert.equal(filterCourses('career','all','不存在的主题').length,0);
  assert.ok(filterCourses('career','all','').every(c=>c.status==='拟申报'));
});
test('Every shareable course has a unique link and a complete learning path',()=>{
  assert.equal(new Set(courses.map(c=>c.id)).size,15);
  for(const course of courses){assert.ok(course.audience);assert.ok(course.duration);assert.equal(course.stages.length,4);assert.ok(course.outcomes.length>0)}
});
test('The inquiry export preserves the real contact and never claims a submission',()=>{
  const result=inquiryText({name:'  小李  ',role:'家长 / 学生',topic:'AI 微电影创作',goal:'给初中生安排项目学习\n希望有期末作品'});
  assert.ok(result.includes('称呼：小李'));
  assert.ok(result.includes('联系常老师：17821821196'));
  assert.ok(result.includes('上海长序逢晴智能科技有限公司'));
  assert.ok(result.includes('未向网站提交'));
  assert.ok(result.includes('项目学习\n希望有期末作品'));
});
