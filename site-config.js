/**
 * site-config.js — Shared configuration & dynamic hydrator for Trikstr Clone
 * Supports both offline LocalStorage and Vercel Serverless / Cloud Sync.
 */

const DEFAULT_CONFIG = {
  siteTitle: "Trikstr Network",
  adminPassword: "1234",
  metaDescription: "All my social links under one roof.",
  avatarUrl: "assets/images/image01.jpg",
  avatarType: "circle", // "circle" (round profile photo) or "banner" (wide banner logo)
  avatarSize: "120px",  // 90px, 110px, 120px, 140px, 160px
  avatarRadius: "50%",
  bioText: "Animator | Motion Designer | 3D Artist",
  backgroundEffect: "matrix", // "matrix", "black", "cyberpunk", "gradient", "custom"
  backgroundColor: "#000000",
  backgroundGradient: "linear-gradient(135deg, #0f0c1b 0%, #000000 50%, #15002b 100%)",
  buttonTextColor: "#FFFFFF",
  buttonBorderColor: "#CCCCCC",
  buttonBgColor: "transparent",
  buttonRadius: "0.625rem",
  showFooter: true,
  footerText: "Made with Carrd",
  footerUrl: "https://carrd.com/build?ref=auto",
  showAdminButton: false,
  buttons: [
    {
      id: "btn-1",
      label: "Discord (Trikstr Network®)",
      url: "https://discord.gg/Euy4ES8dj",
      icon: "discord",
      hoverColor: "#0071F2"
    },
    {
      id: "btn-2",
      label: "mawlana breakdown - Bangla",
      url: "https://youtu.be/9HQDFKT9ewA",
      icon: "youtube-alt",
      hoverColor: "#FF9900"
    },
    {
      id: "btn-3",
      label: "Mawlana Breakdown - English",
      url: "https://youtu.be/luscJ3TDnvE",
      icon: "youtube-alt",
      hoverColor: "#FF9900"
    },
    {
      id: "btn-4",
      label: "Latest Tutorial Up on Youtube!",
      url: "https://bit.ly/4hpbDwx",
      icon: "info",
      hoverColor: "#FF1414"
    },
    {
      id: "btn-5",
      label: "Instagram (32.6k+)",
      url: "https://www.instagram.com/trikstrrr/?hl=en",
      icon: "instagram",
      hoverColor: "#FF63D3"
    },
    {
      id: "btn-6",
      label: "Youtube (32.5k+)",
      url: "https://www.youtube.com/c/TRIKSTREdits007/featured?sub_confirmation=1",
      icon: "youtube",
      hoverColor: "#D62F2F"
    },
    {
      id: "btn-7",
      label: "Facebook (11k+)",
      url: "https://www.facebook.com/trikstrr/",
      icon: "facebook",
      hoverColor: "#00B2FF"
    },
    {
      id: "btn-8",
      label: "Soundcloud",
      url: "https://soundcloud.com/tahsin-farhan-347197404",
      icon: "soundcloud",
      hoverColor: "#FF8A00"
    }
  ]
};

const ICON_MAP = {
  "discord": { id: "icon-3b7eeeccbb457780f277fce4669f67a0", name: "Discord" },
  "youtube": { id: "icon-e2a43bdcfd2e22a246a1598df579c4ad", name: "YouTube" },
  "youtube-alt": { id: "icon-a63c85b2b6ee333b6d6753e57c8dfe0a", name: "YouTube (Alt)" },
  "instagram": { id: "icon-85976685de3e4af37529a1ce5d57d2a7", name: "Instagram" },
  "facebook": { id: "icon-a1eb5cac0cee3b05a40d856c98ce14a5", name: "Facebook" },
  "soundcloud": { id: "icon-49063465275d0a5582c7c5dfbf0e4536", name: "SoundCloud" },
  "info": { id: "icon-5df67a211ae41c4e5f96b6e0ea004ca3", name: "Information" },
  "twitter": { id: "icon-twitter", name: "X (Twitter)" },
  "tiktok": { id: "icon-tiktok", name: "TikTok" },
  "twitch": { id: "icon-twitch", name: "Twitch" },
  "github": { id: "icon-github", name: "GitHub" },
  "spotify": { id: "icon-spotify", name: "Spotify" },
  "telegram": { id: "icon-telegram", name: "Telegram" },
  "whatsapp": { id: "icon-whatsapp", name: "WhatsApp" },
  "linkedin": { id: "icon-linkedin", name: "LinkedIn" },
  "email": { id: "icon-email", name: "Email" },
  "globe": { id: "icon-globe", name: "Website / Link" }
};

const STORAGE_KEY = "trikstr_site_config";

function getSiteConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const parsed = JSON.parse(raw);
    return Object.assign({}, DEFAULT_CONFIG, parsed);
  } catch (e) {
    console.warn("Could not load config from localStorage", e);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function saveSiteConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save config", e);
    return false;
  }
}

function resetSiteConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

// Fetches live config from Vercel API or site-config.json asynchronously
async function fetchLiveSiteConfig() {
  // If running on http/https, try to fetch cloud config
  if (window.location.protocol.startsWith("http")) {
    try {
      // 1. Try Vercel Serverless Function
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch("/api/config", { signal: ctrl.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.buttons && Array.isArray(data.buttons)) {
          saveSiteConfig(data);
          applySiteConfig(data);
          return data;
        }
      }
    } catch (e) {
      // Ignore network abort/failure and proceed to fallback
    }

    try {
      // 2. Try static site-config.json
      const res2 = await fetch("site-config.json");
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.buttons && Array.isArray(data2.buttons)) {
          // If no local storage exists yet, use site-config.json
          if (!localStorage.getItem(STORAGE_KEY)) {
            saveSiteConfig(data2);
            applySiteConfig(data2);
          }
          return data2;
        }
      }
    } catch (e2) {
      // Fallback to local config
    }
  }

  // Fallback to local storage or defaults
  const localConfig = getSiteConfig();
  applySiteConfig(localConfig);
  return localConfig;
}

// Injects dynamic CSS rules for custom buttons, avatar shape, and background
function applySiteConfig(config) {
  if (!config) config = getSiteConfig();

  // 1. Meta & Title
  if (config.siteTitle) {
    document.title = config.siteTitle;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", config.siteTitle);
  }
  if (config.metaDescription) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", config.metaDescription);
  }

  // 2. Avatar element & styling
  const avatarImg = document.querySelector("#image01 img");
  if (avatarImg && config.avatarUrl) {
    avatarImg.src = config.avatarUrl;
  }

  // 3. Bio text
  const bio = document.querySelector("#text03");
  if (bio && config.bioText !== undefined) {
    bio.textContent = config.bioText;
  }

  // 4. Background and Avatar Styling
  let dynamicStyleTag = document.getElementById("dynamic-custom-style");
  if (!dynamicStyleTag) {
    dynamicStyleTag = document.createElement("style");
    dynamicStyleTag.id = "dynamic-custom-style";
    document.head.appendChild(dynamicStyleTag);
  }

  let customCss = "";

  // Avatar Circle / Banner styling
  const isCircle = (config.avatarType !== "banner");
  if (isCircle) {
    const size = config.avatarSize || "120px";
    const rad = config.avatarRadius || "50%";
    customCss += `
      #image01 {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;
        margin: 0 auto 1.5rem auto !important;
      }
      #image01 > .frame {
        width: ${size} !important;
        height: ${size} !important;
        max-width: ${size} !important;
        max-height: ${size} !important;
        border-radius: 50% !important;
        clip-path: circle(50% at 50% 50%) !important;
        -webkit-clip-path: circle(50% at 50% 50%) !important;
        overflow: hidden !important;
        display: block !important;
        margin: 0 auto !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 255, 255, 0.12) !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
        background-color: #000000 !important;
        transition: transform 0.3s ease !important;
      }
      #image01 > .frame:hover {
        transform: scale(1.05) !important;
      }
      #image01 > .frame > img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center !important;
        border-radius: ${rad} !important;
        display: block !important;
      }
    `;
  } else {
    // Original wide banner logo format
    customCss += `
      #image01 > .frame {
        width: 42.75rem !important;
        height: 3.5rem !important;
        border-radius: 0 !important;
        box-shadow: 0rem 0rem 4.75rem 0rem #000000 !important;
        border: 1px solid #000000 !important;
        margin: 0 auto !important;
      }
      #image01 > .frame > img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center !important;
        border-radius: 0 !important;
      }
    `;
  }

  // Background styling
  if (config.backgroundEffect === "black") {
    customCss += `
      body { background-color: #000000 !important; }
      body::before { display: none !important; }
    `;
  } else if (config.backgroundEffect === "cyberpunk") {
    customCss += `
      body {
        background: radial-gradient(circle at 50% 20%, #1a082e 0%, #05010d 60%, #000000 100%) !important;
      }
      body::before { opacity: 0.65 !important; }
    `;
  } else if (config.backgroundEffect === "gradient") {
    customCss += `
      body {
        background: ${config.backgroundGradient || "linear-gradient(135deg, #0f0c1b 0%, #000000 50%, #15002b 100%)"} !important;
      }
      body::before { display: none !important; }
    `;
  } else if (config.backgroundEffect === "custom") {
    customCss += `
      body {
        background-color: ${config.backgroundColor || "#000000"} !important;
      }
      body::before { display: none !important; }
    `;
  } else {
    // Original matrix lines
    customCss += `
      body { background-color: #000000 !important; }
      body::before { display: block !important; opacity: 1 !important; }
    `;
  }

  // Button base styles overrides
  customCss += `
    .buttons-component.instance-2 > li > a {
      border-radius: ${config.buttonRadius || "0.625rem"} !important;
      color: ${config.buttonTextColor || "#FFFFFF"} !important;
      border-color: ${config.buttonBorderColor || "#CCCCCC"} !important;
      background-color: ${config.buttonBgColor || "transparent"} !important;
    }
    .buttons-component.instance-2 > li > a > svg {
      fill: ${config.buttonTextColor || "#FFFFFF"} !important;
    }
  `;

  // Dynamic button hover color rules
  if (Array.isArray(config.buttons)) {
    config.buttons.forEach((btn, idx) => {
      const cls = "dyn-btn-" + (idx + 1);
      const hColor = btn.hoverColor || "#0071F2";
      customCss += `
        .buttons-component.instance-2 > li > a.${cls}:hover {
          border-color: ${hColor} !important;
          color: ${hColor} !important;
          box-shadow: 0 0 15px ${hColor}44 !important;
        }
        .buttons-component.instance-2 > li > a.${cls}:hover > svg {
          fill: ${hColor} !important;
        }
      `;
    });
  }

  dynamicStyleTag.innerHTML = customCss;

  // 5. Render Buttons
  const buttonsUl = document.querySelector("#buttons02");
  if (buttonsUl && Array.isArray(config.buttons)) {
    let html = "";
    config.buttons.forEach((btn, idx) => {
      const iconInfo = ICON_MAP[btn.icon] || { id: "icon-globe", name: "Link" };
      const cls = "dyn-btn-" + (idx + 1);
      const titleId = `btn-title-${idx + 1}`;
      html += `<li><a href="${escapeHtml(btn.url)}" class="${cls}" role="button" target="_blank" rel="noopener"><svg aria-labelledby="${titleId}"><title id="${titleId}">${escapeHtml(iconInfo.name)}</title><use xlink:href="#${iconInfo.id}"></use></svg><span class="label">${escapeHtml(btn.label)}</span></a></li>`;
    });
    buttonsUl.innerHTML = html;
  }

  // 6. Footer / Credits
  const credits = document.querySelector("#credits");
  if (credits) {
    if (config.showFooter === false) {
      credits.style.display = "none";
    } else {
      credits.style.display = "block";
      const a = credits.querySelector("a");
      if (a) {
        a.textContent = config.footerText || "Made with Carrd";
        a.href = config.footerUrl || "https://carrd.com/build?ref=auto";
      }
    }
  }

  // 7. Admin floating button removed (accessible only via /admin)
  const adminBtn = document.getElementById("admin-floating-btn");
  if (adminBtn) adminBtn.remove();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Attach to window
if (typeof window !== "undefined") {
  window.DEFAULT_CONFIG = DEFAULT_CONFIG;
  window.ICON_MAP = ICON_MAP;
  window.getSiteConfig = getSiteConfig;
  window.saveSiteConfig = saveSiteConfig;
  window.resetSiteConfig = resetSiteConfig;
  window.fetchLiveSiteConfig = fetchLiveSiteConfig;
  window.applySiteConfig = applySiteConfig;
  window.escapeHtml = escapeHtml;
}
