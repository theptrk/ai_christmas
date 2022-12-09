let songSubject;

let openai_key = "sk-J6eJnpgZkRbHLoseB16zTfT3BlbkFJVO7uJIAkiUloYgCTs2Zf";

document.getElementById("form_id").addEventListener("submit", function (e) {
  e.preventDefault();
  songSubject = document.getElementById("song_subject").value;
  console.log(songSubject);
});

document.getElementById("secret_form").addEventListener("submit", function (e) {
  e.preventDefault();
  let secret = document.getElementById("secret_input").value;
  for (var i = 0; i < secret.length; i++) {
    let index = Number(secret[i]);
    openai_key = openai_key.slice(0, index) + openai_key.slice(index + 1);
  }
  document.getElementById("secret_form").style.display = "none";
});
