const { modulesData } = require('./src/data/data.ts');
console.log('Total modules:', modulesData.length);
modulesData.forEach(m => {
  console.log(`- ${m.title} (${m.id}) - ${m.subtopics.length} aulas`);
  m.subtopics.forEach(s => {
    console.log(`   * ${s.title} (${s.id}) [${s.isFree ? 'FREE' : 'PRO'}]`);
  });
});
