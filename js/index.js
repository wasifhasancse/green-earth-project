const categoriesTab = async () => {
  const categoriesContainer = document.getElementById("categories-container");
  const getCategoriesData = await fetch(
    "https://openapi.programming-hero.com/api/categories",
  );
  const getCategories = await getCategoriesData.json();
  getCategories.categories.forEach((category) => {
    const categoriesButton = document.createElement("li");
    categoriesButton.innerHTML = `
            <a class="hover:bg-green-100">${category.category_name}</a>
          `;
    categoriesContainer.append(categoriesButton);
  });
};

categoriesTab();
