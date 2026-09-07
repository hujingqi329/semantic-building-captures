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

// Reference (hand-picked demo) images, and field-capture images for Bugao Li.
const referenceSets = {
  all: Array.from({ length: 6 }, (_, index) =>
    `All/${String(index + 1).padStart(4, "0")}.jpg`
  ),
  architecture: Array.from({ length: 6 }, (_, index) =>
    `Architecture/${String(index + 1).padStart(4, "0")}.png`
  ),
};
const captureSets = {
  all: [],
  architecture: [],
  commerce: [],
  life_traces: [],
};
let imageSets = referenceSets;
let currentImageSet = "architecture";
let currentPlace = "xintiandi";

// The number of captures comes from the log written by the field device;
// until it loads (or when it is absent) the reference images stay in use.
fetch("capture_log.json", { cache: "no-store" })
  .then((response) => (response.ok ? response.json() : null))
  .then((manifest) => {
    const count = (manifest?.events ?? []).filter(
      (event) => event.status === "saved_unique_capture"
    ).length;
    if (!count) return;
    captureSets.all = Array.from({ length: count }, (_, index) =>
      `captures/origin/${String(index + 1).padStart(4, "0")}.jpg`
    );
    for (const category of ["architecture", "commerce", "life_traces"]) {
      captureSets[category] = Array.from({ length: count }, (_, index) =>
        `captures/${category}/${String(index + 1).padStart(4, "0")}.png`
      );
    }
    if (currentPlace === "bugaoli") {
      imageSets = captureSets;
      showImageSet(currentImageSet);
    }
  })
  .catch(() => {});

function showImageSet(setName) {
  const paths = imageSets[setName];
  if (!paths) return;

  document.querySelectorAll(".image-card > img").forEach((image, index) => {
    image.classList.remove("is-missing");
    // One capture per card - no cycling; cards beyond the data stay empty.
    if (index >= paths.length) {
      image.removeAttribute("src");
      image.classList.add("is-missing");
      return;
    }
    image.src = paths[index];
  });

  currentImageSet = setName;
  document.querySelectorAll(".category-nav [data-image-set]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.imageSet === setName);
  });
  document.querySelector(".image-card")?.classList.toggle(
    "is-openable",
    imageSets === captureSets || setName === "all" || setName === "architecture"
  );
}

document.querySelector(".category-nav")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-image-set]");
  if (button) showImageSet(button.dataset.imageSet);
});

const placeDescriptions = {
  xintiandi: "Located in the former Taipingqiao Shikumen neighborhood, Xintiandi was redeveloped between the late 1990s and early 2000s as part of Shanghai's large-scale urban renewal strategy. Led by the government in collaboration with private developers, the project preserved the architectural appearance of Shikumen while replacing its original residential functions with commercial, cultural, and tourism programs. It represents a top-down redevelopment model, where historic architecture became a catalyst for urban branding and economic revitalization.",
  tianzifang: "Originally a residential Shikumen neighborhood built in the 1930s, Tianzifang gradually transformed from the late 1990s through the spontaneous involvement of residents, artists, and small businesses. Rather than large-scale redevelopment, it evolved through incremental adaptation while retaining much of its original alleyway network and everyday urban life. It represents a bottom-up regeneration model, where creative industries, commerce, and local communities continue to coexist.",
  bugaoli: "Built in the 1930s, Bugaoli remains a largely residential Shikumen neighborhood. Its renewal has focused on improving infrastructure and living conditions while retaining the original alley structure, residential function, and much of its everyday community life. It represents a conservation-oriented model centered on living heritage and spatial continuity.",
};

document.querySelector(".place-nav")?.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    document
      .querySelector(".site-preview")
      .classList.toggle("is-about", pageButton.dataset.page === "about");
  }

  const button = event.target.closest("[data-place]");
  if (!button) return;

  currentPlace = button.dataset.place;
  imageSets = currentPlace === "bugaoli" ? captureSets : referenceSets;
  if (!(currentImageSet in imageSets)) currentImageSet = "architecture";
  showImageSet(currentImageSet);

  document.querySelector(".place-description").textContent =
    placeDescriptions[button.dataset.place];
});

const newsVideo = document.querySelector(".news-video");

newsVideo?.addEventListener("mouseenter", () => {
  newsVideo.muted = true;
  newsVideo.play().catch(() => {});
});

imageSets.all.forEach((path) => {
  const image = new Image();
  image.src = path;
});

// A category cutout may be absent for a given capture (too few pixels);
// dim that card instead of showing a broken image.
document.querySelectorAll(".image-card > img").forEach((image) => {
  image.addEventListener("error", () => {
    image.classList.add("is-missing");
  });
  image.addEventListener("load", () => {
    image.classList.remove("is-missing");
  });
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

const timelineCards = document.querySelector(".timeline-cards");
const timelineTrigger = timelineCards?.querySelector("article:first-child p");
const timelineDetailCard = document.querySelector(".timeline-detail-card");
const timelineArticles = timelineCards?.querySelectorAll(":scope > article") ?? [];
const timelineNodes = document.querySelectorAll(".approach-line svg circle");

const timelineDescriptions = [
  "Large-scale urban redevelopment was launched across Shanghai. Many historic neighborhoods faced demolition or relocation, triggering discussions on heritage conservation.",
  "A landmark top-down redevelopment project. Shikumen buildings were restored and integrated with new commercial, cultural and leisure functions.",
  "Gradual, organic transformation driven by residents and artists. Shikumen alleys evolved into a cultural and creative district while retaining daily life and community.",
  "Comprehensive rehabilitation of a living Shikumen community. Infrastructure and living conditions were improved while much of the historic fabric and residential function were retained.",
  "A large-scale conservation-led renewal project. Historical buildings and spatial structures are carefully restored and reused for contemporary public, cultural and commercial purposes.",
  "A 7,500-ton Shikumen complex was temporarily relocated and later returned to its original site, demonstrating a new preservation approach that accommodates contemporary urban infrastructure.",
];

const timelineCardPositions = [84, 312, 531, 754, 968, 1187];
const timelineCaseShowers = [];
let hasTimelineInteraction = false;
let activeTimelineCaseIndex = 0;

timelineArticles.forEach((article, index) => {
  const image = article.querySelector("img");
  image.style.setProperty("--timeline-index", index);

  const showCase = () => {
    if (!timelineDetailCard) return;
    activeTimelineCaseIndex = index;
    timelineNodes.forEach((node, nodeIndex) => {
      node.classList.toggle("is-active", nodeIndex === index);
    });

    timelineDetailCard.querySelector("small").textContent =
      article.querySelector("small").textContent;
    timelineDetailCard.querySelector("h3").textContent =
      article.querySelector("h3").textContent;
    timelineDetailCard.querySelector(".detail-header p").textContent =
      article.querySelector("p").textContent;

    const detailImage = timelineDetailCard.querySelector(".detail-photo img");
    detailImage.src = `about/Timeline of Urban Regeneration/${index + 1}.jpg`;
    detailImage.alt = `${article.querySelector("h3").textContent} detail photo`;
    timelineDetailCard.querySelector(".detail-description").textContent =
      timelineDescriptions[index];
    timelineDetailCard.style.setProperty(
      "--timeline-card-left",
      `${timelineCardPositions[index]}px`
    );
    timelineDetailCard.classList.add("is-visible");
  };

  timelineCaseShowers[index] = showCase;
  article.addEventListener("mouseenter", () => {
    hasTimelineInteraction = true;
    showCase();
  });
  article.addEventListener("focusin", () => {
    hasTimelineInteraction = true;
    showCase();
  });
});

function cycleTimelineCard(direction) {
  if (!timelineCaseShowers.length) return;

  hasTimelineInteraction = true;
  const nextIndex =
    (activeTimelineCaseIndex + direction + timelineCaseShowers.length) %
    timelineCaseShowers.length;
  timelineCaseShowers[nextIndex]?.();
}

timelineDetailCard
  ?.querySelector(".detail-arrow.is-prev")
  ?.addEventListener("click", () => cycleTimelineCard(-1));

timelineDetailCard
  ?.querySelector(".detail-arrow.is-next")
  ?.addEventListener("click", () => cycleTimelineCard(1));

function showInitialTimelineCard(delay = 1100) {
  window.setTimeout(() => {
    if (!hasTimelineInteraction) timelineCaseShowers[0]?.();
  }, delay);
}

if (timelineCards && timelineTrigger) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timelineCards.classList.add("is-revealed");
    showInitialTimelineCard(0);
  } else {
    const timelineObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        timelineCards.classList.add("is-revealed");
        showInitialTimelineCard();
        observer.disconnect();
      },
      {
        root: document.querySelector(".about-page"),
        threshold: 0.25,
      }
    );

    timelineObserver.observe(timelineTrigger);
  }
}

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
