// get categories Tab Button
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

// get all trees card data
const getAllPlantsData = async () => {
  const plantsCardContainer = document.getElementById("plants-card-container");
  plantsCardContainer.innerHTML = " ";
  const getAllPlantsCardData = await fetch(
    "https://openapi.programming-hero.com/api/plants",
  );
  const allTreesCardData = await getAllPlantsCardData.json();
  allTreesCardData.plants.forEach((plant) => {
    const plantsCard = document.createElement("div");
    plantsCard.className = "card bg-base-100 shadow-xl p-3 space-y-5";
    plantsCard.innerHTML = `

            <div class="card-image">
              <img class="aspect-3/2 object-cover" src="${plant.image}" alt="${plant.name}">
            </div>
            <div class="space-y-2.5">
              <h2 class="text-xl font-bold">${plant.name}</h2>
              <p class="line-clamp-2">${plant.description}</p>
              <div class="flex items-center justify-between">
                <a href="" class="inline-block py-1 px-3 bg-green-100 text-green-500 rounded-full">${plant.category}</a>
                <h3 class="font-bold text-lg">$${plant.price}</h3>
              </div>
            </div>
            <button class="py-2.5 px-4 bg-green-500 text-white font-bold rounded cursor-pointer hover:bg-green-600">Add
              to Cart</button>

    `;
    plantsCardContainer.append(plantsCard);
  });
};

// call categories tab button API
categoriesTab();

// call all plants card API
getAllPlantsData();
