document.querySelectorAll("[data-button-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button || !group.contains(button)) return;

    group.querySelectorAll("button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
  });
});

document.querySelector(".upload-button")?.addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("is-active");
});

const imageSets = {
  all: Array.from({ length: 6 }, (_, index) =>
    `All/${String(index + 1).padStart(4, "0")}.jpg`
  ),
  architecture: Array.from({ length: 6 }, (_, index) =>
    `Architecture/${String(index + 1).padStart(4, "0")}.png`
  ),
};

let currentImageSet = "architecture";

function showImageSet(setName) {
  const paths = imageSets[setName];
  if (!paths) return;

  document.querySelectorAll(".image-card > img").forEach((image, index) => {
    image.src = paths[index % paths.length];
  });

  currentImageSet = setName;
  document.querySelector(".image-card")?.classList.toggle(
    "is-openable",
    setName === "all" || setName === "architecture"
  );
}

document.querySelector(".category-nav")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-image-set]");
  if (button) showImageSet(button.dataset.imageSet);
});

imageSets.all.forEach((path) => {
  const image = new Image();
  image.src = path;
});

const detailOverlay = document.querySelector(".detail-overlay");
const detailVisual = document.querySelector(".detail-visual");

function openDetails() {
  detailVisual.classList.remove("is-origin");
  document.querySelectorAll("[data-detail-view]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.detailView === "architecture");
  });
  detailOverlay.classList.add("is-open");
  detailOverlay.setAttribute("aria-hidden", "false");
}

function closeDetails() {
  detailOverlay.classList.remove("is-open");
  detailOverlay.setAttribute("aria-hidden", "true");
}

document.querySelector(".image-card")?.addEventListener("click", () => {
  if (currentImageSet === "all" || currentImageSet === "architecture") openDetails();
});

document.querySelector(".detail-back")?.addEventListener("click", closeDetails);

document.querySelectorAll("[data-detail-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-detail-view]").forEach((item) => {
      item.classList.toggle("is-selected", item === button);
    });

    detailVisual.classList.toggle("is-origin", button.dataset.detailView === "origin");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && detailOverlay.classList.contains("is-open")) closeDetails();
});

document.querySelectorAll(".rating").forEach((rating) => {
  const filledCount = Number(rating.dataset.filled);

  for (let index = 0; index < 10; index += 1) {
    const cell = document.createElement("span");
    cell.className = "rating-cell";
    cell.classList.toggle("is-filled", index < filledCount);
    cell.setAttribute("aria-hidden", "true");
    rating.appendChild(cell);
  }
});

const audio001 = document.querySelector("#audio-001");
const cardAudioButton = document.querySelector(".card-audio-button");
const detailPlayButton = document.querySelector(".play-button");

function syncAudioButtons() {
  const isPlaying = !audio001.paused && !audio001.ended;
  cardAudioButton.classList.toggle("is-playing", isPlaying);
  cardAudioButton.setAttribute("aria-pressed", String(isPlaying));
  cardAudioButton.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} audio 001`);
  detailPlayButton.classList.toggle("is-playing", isPlaying);
  detailPlayButton.textContent = isPlaying ? "Ⅱ" : "▶";
  detailPlayButton.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} audio 001`);
}

function toggleAudio001() {
  if (audio001.paused || audio001.ended) {
    if (audio001.ended) audio001.currentTime = 0;
    audio001.play().catch(() => syncAudioButtons());
  } else {
    audio001.pause();
  }
}

cardAudioButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleAudio001();
});

detailPlayButton.addEventListener("click", toggleAudio001);
audio001.addEventListener("play", syncAudioButtons);
audio001.addEventListener("pause", syncAudioButtons);
audio001.addEventListener("ended", syncAudioButtons);
syncAudioButtons();

const DESIGN_WIDTH = 1471;
const DESIGN_HEIGHT = 819;

function fitPreviewToWindow() {
  const scale = Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / DESIGN_HEIGHT,
    1
  );

  document.documentElement.style.setProperty("--preview-scale", scale);
}

fitPreviewToWindow();
window.addEventListener("resize", fitPreviewToWindow);
