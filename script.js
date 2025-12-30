/*******************
 SUPABASE
********************/
const SUPABASE_URL = "https://qeahepcqkhfftoiuhdgn.supabase.co";
const SUPABASE_KEY = "sb_publishable_s4ZAD1dwExeLk0PYLnDZHA_x2vOpO3q";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let lastLikeCount = 0;

/*******************
 HEARTS
********************/
const heartBtn = document.getElementById("heartBtn");
const heartCount = document.getElementById("heartCount");

function createFlyingHeart() {
  const h = document.createElement("div");
  h.textContent = "❤️";
  h.className = "flying-heart";
  h.style.left = Math.random() * 80 + "vw";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 2000);
}

function createPopper() {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "popper";
    p.style.left = "50vw";
    p.style.top = "80vh";
    p.style.setProperty("--x", Math.random() * 200 - 100 + "px");
    p.style.setProperty("--y", Math.random() * -200 + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function remoteHeartBurst() {
  for (let i = 0; i < 6; i++) {
    setTimeout(createFlyingHeart, i * 120);
  }
  document.body.classList.add("pulse");
  setTimeout(() => document.body.classList.remove("pulse"), 400);
}

async function loadLikes() {
  const { data } = await supabaseClient
    .from("anniversary_likes")
    .select("count")
    .eq("id", 1)
    .single();

  lastLikeCount = data.count;
  heartCount.textContent = data.count;
}
loadLikes();

heartBtn.onclick = async () => {
  createPopper();
  createFlyingHeart();
  await supabaseClient
    .from("anniversary_likes")
    .update({ count: lastLikeCount + 1 })
    .eq("id", 1);

    const { data } = await supabaseClient
    .from("anniversary_likes")
    .select("count")
    .eq("id", 1)
    .single();

  // 3️⃣ Update local variable and UI
  lastLikeCount = data.count;
  heartCount.textContent = data.count;
};


const likesChannel = supabaseClient.channel('anniversary:likes', { config: { broadcast: { self: true }, private: false } })
  .on('broadcast', { event: 'UPDATE' }, (payload) => {
      if (payload.new.count > lastLikeCount && lastLikeCount !== 0) {
        remoteHeartBurst();
      }
      lastLikeCount = payload.new.count;
      heartCount.textContent = payload.new.count;
    }
  )
  .subscribe()

// supabaseClient
//   .channel("likes-live")
//   .on("postgres_changes",
//     { event: "UPDATE", table: "anniversary_likes" },
//     payload => {
//       if (payload.new.count > lastLikeCount && lastLikeCount !== 0) {
//         remoteHeartBurst();
//       }
//       lastLikeCount = payload.new.count;
//       heartCount.textContent = payload.new.count;
//     }
//   )
//   .subscribe();

/*******************
 MESSAGES
********************/
const wall = document.getElementById("wallMessages");
const form = document.getElementById("messageForm");
const nameInput = document.getElementById("nameInput");
const messageInput = document.getElementById("messageInput");

// Add a message at the top
function addMessage(m) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${m.name}:</strong> ${m.message}`;
  wall.prepend(p); // <-- prepend instead of append
}

// Load all messages from Supabase
async function loadMessages() {
  const { data } = await supabaseClient
    .from("anniversary_messages")
    .select("*")
    .order("created_at", { ascending: false }); // newest first
  wall.innerHTML = "";
  data.forEach(addMessage); // prepend each message
}
loadMessages();

// Submit message
form.onsubmit = async e => {
  e.preventDefault();

  // Insert into Supabase
  await supabaseClient.from("anniversary_messages").insert([{
    name: nameInput.value,
    message: messageInput.value
  }]);

  // Reset form
  form.reset();

  // Reload messages immediately to show the latest at top
  await loadMessages();
};


supabaseClient
  .channel("messages-live")
  .on("postgres_changes",
    { event: "INSERT", table: "anniversary_messages" },
    payload => addMessage(payload.new)
  )
  .subscribe();

/*******************
 POPUP
********************/
document.querySelector(".celebrate-btn").onclick =
  () => document.querySelector(".popup").classList.remove("hidden");

document.querySelector(".close-popup").onclick =
  () => document.querySelector(".popup").classList.add("hidden");

/*******************
 STARS
********************/
const starCanvas = document.getElementById("stars");
const sctx = starCanvas.getContext("2d");

function resizeStars() {
  starCanvas.width = innerWidth;
  starCanvas.height = innerHeight;
}
resizeStars();
window.onresize = resizeStars;

const stars = Array.from({ length: 180 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: Math.random() * 1.5
}));

(function drawStars() {
  sctx.clearRect(0, 0, innerWidth, innerHeight);
  stars.forEach(s => {
    sctx.beginPath();
    sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sctx.fillStyle = "white";
    sctx.fill();
  });
  requestAnimationFrame(drawStars);
})();

/*******************
 FIREWORKS
********************/
const fw = document.getElementById("fireworks");
const fctx = fw.getContext("2d");

function resizeFW() {
  fw.width = innerWidth;
  fw.height = innerHeight;
}
resizeFW();

let fireworks = [];

setInterval(() => {
  const x = Math.random() * fw.width;
  const y = Math.random() * fw.height * 0.4;
  for (let i = 0; i < 30; i++) {
    fireworks.push({
      x, y,
      dx: Math.cos(i) * Math.random() * 3,
      dy: Math.sin(i) * Math.random() * 3,
      life: 60
    });
  }
}, 1200);

(function drawFW() {
  fctx.clearRect(0, 0, fw.width, fw.height);
  fireworks.forEach((p, i) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    fctx.fillStyle = `hsl(${Math.random()*360},100%,70%)`;
    fctx.fillRect(p.x, p.y, 2, 2);
    if (p.life <= 0) fireworks.splice(i, 1);
  });
  requestAnimationFrame(drawFW);
})();

/*******************
 FIRST LOAD CELEBRATION
********************/
function celebrationRain() {
  const container = document.getElementById("celebrationRain");

  // Balloons 🎈
  const balloons = ["🎈", "🎉", "💖", "✨"];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.textContent = balloons[Math.floor(Math.random() * balloons.length)];
    b.style.left = Math.random() * 100 + "vw";
    b.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(b);
    setTimeout(() => b.remove(), 7000);
  }

  // Confetti 🎊
  const colors = ["#ff7eb3", "#ffd166", "#8ecae6", "#cdb4db"];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(c);
    setTimeout(() => c.remove(), 5000);
  }

  // Poppers 🎉
  createPopper();
  setTimeout(createPopper, 400);
  setTimeout(createPopper, 800);
}

/* Run on load */
window.addEventListener("load", celebrationRain);
