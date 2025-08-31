document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    (async () => {
      const rootElement = document.querySelector("#menu-categories-1");
      if (!rootElement) return console.warn("❌ Menu root #menu-categories-1 not found");

      const data = await fetch("https://dev.dibitel.com/rest/V1/category-thumbnails").then(r => r.json());
      const root = data.find(cat => cat.id === "2");
      if (!root) return console.warn("❌ Category with id=2 not found");

      root.children.forEach(cat => {
        const li = document.createElement("li");
        li.className = "menu-item menu-item-type-custom menu-item-has-icon";

        li.innerHTML = `
          <a href="${cat.url}">
            <img class="menu-item-icon menu-icon-item--image" src="${cat.thumbnail || ''}" alt="${cat.name}" />
            ${cat.name}
          </a>
        `;

        rootElement.appendChild(li);
      });

      console.log("✅ Top-level menu items rendered on mobile.");
    })();
  }
});
