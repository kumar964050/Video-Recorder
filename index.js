const vEl = document.querySelector("video");
const timeEl = document.querySelector("time");
const recordBtn = document.getElementById("record_btn");
const captureBtn = document.getElementById("capture_btn");
const timer = document.getElementById("timer");

let recorder;
let recorderStatus = false;
let chunks = [];

let countSeconds = 0;
let timerId;
// display recording time
const displayTimer = () => {
  timerId = setInterval(() => {
    let hours = Math.floor(countSeconds / 3600);
    let minutes = Math.floor((countSeconds % 3600) / 60);
    let seconds = countSeconds % 60;

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    timer.textContent = `${hours}:${minutes}:${seconds}`;
    countSeconds++;
  }, 1000);
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    vEl.srcObject = stream;
    recorder = new MediaRecorder(stream);

    // capture button click event
    recorder.addEventListener("start", (e) => {
      chunks = [];
    });

    // save captured video in chunks array
    recorder.addEventListener("dataavailable", (e) => {
      chunks.push(e.data);
    });

    // download captured video
    recorder.addEventListener("stop", (e) => {
      const videoUrl = new Blob(chunks, { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(videoUrl);
      link.download = "stream.mp4";
      link.click();
    });

    // start/stop recording button
    recordBtn.addEventListener("click", () => {
      if (!recorder) return;

      if (recorderStatus === false) {
        // start the recording
        recorder.start();
        // display the recording time
        displayTimer();
        // add recording animation
        recordBtn.classList.add("capturing_in_progress");
        // change recording status
        recorderStatus = true;
      } else {
        // stop the recording
        recorder.stop();
        // stop the timer
        clearInterval(timerId);
        // display the recording time as 00:00:00
        timer.textContent = "00:00:00";
        // remove recording animation
        recordBtn.classList.remove("capturing_in_progress");
        // change recording status
        recorderStatus = false;
      }
    });
  })
  .catch((err) => {
    console.log(err);
    console.log("Error getting user media from device: " + err.message);
  });

// capture image feature
captureBtn.addEventListener("click", () => {
  // add recording animation
  captureBtn.classList.add("capturing_in_progress");
  const canvas = document.createElement("canvas");
  // assign with and height same as video element
  canvas.width = vEl.videoWidth;
  canvas.height = vEl.videoHeight;

  const tool = canvas.getContext("2d");
  // draw video onto canvas to capture image
  tool.drawImage(vEl, 0, 0, canvas.width, canvas.height);
  // save captured image as a jpeg file
  let imageURL = canvas.toDataURL("image/jpeg", 1.0);

  // download captured image
  const link = document.createElement("a");
  link.href = imageURL;
  link.download = "captured.jpeg";
  link.click();

  // remove recording animation after 400ms
  setTimeout(() => {
    captureBtn.classList.remove("capturing_in_progress");
  }, 400);
});
