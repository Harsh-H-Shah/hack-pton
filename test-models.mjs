async function run() {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCQeCPTB4KwmpS1FVUypiwcS2293Q6pjFE");
  const data = await response.json();
  console.log(data.models.map(m => m.name).filter(n => n.includes('flash') || n.includes('pro')));
}
run();
