import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //  0) Marcar receta seleccionada
    resultsView.update(model.getSearchresultPage());
    bookmarksView.update(model.state.bookmarks);

    //  1) Cargando receta
    await model.loadRecipe(id);

    //  2) Mostrando receta
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // OBTENGO CONSULTA
    const query = searchView.getQuery();
    if (!query) return;

    /// CARGO RESULTADOS
    await model.loadSearchResults(query);

    // MUESTRO RESULTADOS

    resultsView.render(model.getSearchresultPage());

    //MOSTRAR BOTONES DE PAGINACION
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

/// EVENT HANDLERS
const controlPagination = function (goToPage) {
  // MUESTRO NUEVO RESULTADOS
  resultsView.render(model.getSearchresultPage(goToPage));

  //MOSTRAR NUEVOS BOTONES DE PAGINACION
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmarp = function () {
  if (!model.state.recipe.bookmarks) model.addBookmarp(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // MOSTRAR SPINNER
    addRecipeView.renderSpinner();

    // SUBIR NUEVA RECETA
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // MOSTRAR RECETA
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `${model.state.recipe.id}`);
    // window.history.back();

    // CERRAR FORM WINDOW
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmarp(controlAddBookmarp);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
