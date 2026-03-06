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
            <a onclick="getFilterPlants(${category.id})" class="categoris-button hover:bg-green-100">${category.category_name}</a>
          `;
    categoriesContainer.append(categoriesButton);
  });
};

// get all trees card data
const getAllPlantsData = async () => {
  const getAllPlantsCardData = await fetch(
    "https://openapi.programming-hero.com/api/plants",
  );
  const allTreesCardData = await getAllPlantsCardData.json();
  displayPlantCard(allTreesCardData);
  document
    .getElementById("categories-all-trees-button")
    .addEventListener("click", () => {
      displayPlantCard(allTreesCardData);
    });
};

// display plants card
const displayPlantCard = (plantData) => {
  const plantsCardContainer = document.getElementById("plants-card-container");
  plantsCardContainer.innerHTML = " ";
  plantData.plants.forEach((plant) => {
    const plantsCard = document.createElement("div");
    plantsCard.className = "card bg-base-100 shadow-xl p-3 space-y-5";
    plantsCard.innerHTML = `

            <div class="card-image">
              <img onclick="showModal(${(plant.id)})" class="aspect-3/2 object-cover cursor-pointer" title="${plant.name}" src="${plant.image}" alt="${plant.name}">
            </div>
            <div class="space-y-2.5">
              <h2 onclick="showModal(${(plant.id)})" class="text-xl font-bold cursor-pointer hover:text-green-600">${plant.name}</h2>
              <p class="line-clamp-2">${plant.description}</p>
              <div class="flex items-center justify-between">
                <a class="inline-block py-1 px-3 bg-green-100 text-green-600 rounded-full">${plant.category}</a>
                <h3 class="font-bold text-lg">$${plant.price}</h3>
              </div>
            </div>
            <button class="py-2.5 px-4 bg-green-500 text-white font-bold rounded cursor-pointer hover:bg-green-600">Add
              to Cart</button>

    `;
    plantsCardContainer.append(plantsCard);
  });
};

// filter plants card by categories button
const getFilterPlants = async (categoryButtonId) => {
  const getFilterPlantsData = await fetch(
    `https://openapi.programming-hero.com/api/category/${categoryButtonId}`,
  );
  const filterPlantsData = await getFilterPlantsData.json();
  displayPlantCard(filterPlantsData);
};

// show modal
const showModal = async (plantID) => {
  const getModalPlantData = await fetch(`https://openapi.programming-hero.com/api/plant/${plantID}`)
  const modalPlantData = await getModalPlantData.json();
  console.log(modalPlantData.plants);
  const modalData = modalPlantData.plants;
  const modalContainer = document.getElementById("modal");
  modalContainer.innerHTML = " ";
  const plantModal = document.createElement("div");
  plantModal.className = "bg-base-100 p-3 space-y-5";
  plantModal.innerHTML = `<div class="modal-box">

              <div class="card-image">
                <img class="aspect-3/2 object-cover cursor-pointer" title="${modalData.name}" src="${modalData.image}"
                  alt="${modalData.name}">
              </div>
              <div class="space-y-2.5">
                <h2 class="text-xl font-bold cursor-pointer hover:text-green-600">${modalData.name}</h2>
                <p class="line-clamp-2">${modalData.description}</p>
                <div class="flex items-center justify-between">
                  <a class="inline-block py-1 px-3 bg-green-100 text-green-600 rounded-full">${modalData.category}</a>
                  <h3 class="font-bold text-lg">$${modalData.price}</h3>
                </div>
              </div>
              <button
                class="py-2.5 px-4 bg-green-500 text-white font-bold rounded cursor-pointer hover:bg-green-600">Add
                to Cart</button>

            </div>
            <div class="modal-action">
              <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn">Close</button>
              </form>
            </div>
          `;
  modalContainer.append(plantModal);
  modalContainer.showModal();
};

// call categories tab button API
categoriesTab();

// call all plants card API
getAllPlantsData();
