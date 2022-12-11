var audio = document.getElementById("mariah_background");
audio.volume = 0.2;

document
  .getElementById("form_id")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById(
      "christmas_song_container"
    ).innerHTML = `<p>Elves writing song...</p>`;
    document.getElementById(
      "song_title"
    ).innerHTML = `Your song will be loaded here`;

    let songSubject = document.getElementById("song_subject").value;
    let voice = document.getElementById("voice").value;
    let res = await fetch(
      `/openai?s=${encodeURIComponent(songSubject)}&v=${voice}`
    );
    let { song, wav } = await res.json();

    setTimeout(async () => {
      document.getElementById("christmas_song_container").innerHTML =
        `<h3>Christmas Song: ${songSubject}</h3>` + song + "<br /> - OpenAI";
      document.getElementById("song_audio").src = wav.path;
      document.getElementById(
        "song_title"
      ).innerHTML = `Christmas Song: ${songSubject} - sung by ${voice} with uberduck`;
      let res = await fetch(
        `/cohere?s=${encodeURIComponent(songSubject)}&v=${voice}`
      );
      let { text } = await res.json();
      text = text.split("\n").slice(1).join("<br />");
      // text = `<strong>Behind the scenes interview from cohere</strong><br/>${text}`;
      document.getElementById("bts").innerHTML = text;
    }, 700);
  });
