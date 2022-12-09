let songSubject;

let openai_key = "sk-J6eJnpgZkRbHLoseB16zTfT3BlbkFJVO7uJIAkiUloYgCTs2Zf";

document.getElementById("form_id").addEventListener("submit", function (e) {
  e.preventDefault();
  songSubject = document.getElementById("song_subject").value;
  document.getElementById(
    "christmas_song_container"
  ).innerHTML = `<p>Elves writing song...</p>`;
  let data = {
    model: "text-davinci-003",
    prompt: `Write a Christmas song about "${songSubject}"`,
    temperature: 0,
    max_tokens: 400,
  };

  // https://beta.openai.com/docs/api-reference/making-requests
  fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openai_key}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      let top_choice = data.choices[0].text;
      let top_choice_html = top_choice.split("\n").join("<br />");
      document.getElementById(
        "christmas_song_container"
      ).innerHTML = `${top_choice_html}`;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
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
