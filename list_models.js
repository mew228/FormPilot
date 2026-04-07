async function run() {
  try {
     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key="GEMINI_API_key`);
     const data = await response.json();
     console.log(JSON.stringify(data.models?.map(m => m.name) || data, null, 2));
  } catch(e) {
     console.error(e);
  }
}
run();
