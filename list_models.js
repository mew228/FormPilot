async function run() {
  try {
     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyByUpSUBIMOS4Z65jI5NwO5SBeNrC7X5xg`);
     const data = await response.json();
     console.log(JSON.stringify(data.models?.map(m => m.name) || data, null, 2));
  } catch(e) {
     console.error(e);
  }
}
run();
