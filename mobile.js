<script>
if (window.innerWidth <= 768) {
  (async () => {
    const slugify = str =>
      str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

    const rootElement = document.querySelector("#menu-categories-1");
    if (!rootElement) return console.warn("❌ Menu root #menu-categories-1 not found");

    const data = await fetch("https://test.dibitel.com/rest/V1/category-thumbnails").then(r => r.json());
    const root = data.find(cat => cat.id === "2");
    if (!root) return console.warn("❌ Category with id=2 not found");

    root.children.forEach(cat => {
      const catSlug = slugify(cat.name);

      const li = document.createElement("li");
      li.className = "menu-item menu-item-type-custom menu-item-has-icon";

      li.innerHTML = `
        <a href="/${catSlug}.html">
          <img class="menu-item-icon menu-icon-item--image" src="${cat.thumbnail || ''}" alt="${cat.name}" />
          ${cat.name}
        </a>
      `;

      rootElement.appendChild(li);
    });

    console.log("✅ Top-level menu items rendered on mobile.");
  })();
}
</script>
