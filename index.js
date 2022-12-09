let songSubject;

document.getElementById("form_id").addEventListener("submit", function (e) {
  e.preventDefault();
  songSubject = document.getElementById("song_subject").value;
  console.log(songSubject);
});
