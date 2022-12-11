document
  .getElementById("form_id")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById(
      "christmas_song_container"
    ).innerHTML = `<p>Elves writing song...</p>`;

    let songSubject = document.getElementById("song_subject").value;
    let res = await fetch(`/openai?s=${encodeURIComponent(songSubject)}`);
    let { song } = await res.json();

    setTimeout(() => {
      document.getElementById("christmas_song_container").innerHTML =
        `<h3>${songSubject}</h3>` + song;
    }, 700);
  });
