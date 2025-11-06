import { useState, useEffect } from 'react';
import { recipesApi } from '../services';
import './Recipes.css';

const CATEGORIES = ['cocktail', 'whiskey', 'wine', 'beer'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const GLASS_TYPES = ['rocks glass', 'highball', 'martini', 'wine glass', 'coupe', 'mug', 'hurricane', 'tiki mug', 'margarita glass', 'copper mug'];
const MOODS = ['lazy', 'sparkling', 'warm', 'light', 'strong', 'sweet', 'sour', 'refreshing'];

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [viewingRecipeId, setViewingRecipeId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'cocktail',
    glassType: 'rocks glass',
    difficulty: 'easy',
    preparationTime: 3,
    abv: 0,
    ingredients: [{ name: '', quantity: '', unit: 'ml', optional: false }],
    instructions: [''],
    garnish: '',
    moods: [],
    tags: [],
    subcategory: '',
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipesApi.getAll();
      setRecipes(response.data.recipes || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMoodToggle = (mood) => {
    setFormData((prev) => ({
      ...prev,
      moods: prev.moods.includes(mood)
        ? prev.moods.filter((m) => m !== mood)
        : [...prev.moods, mood],
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: 'ml', optional: false }],
    }));
  };

  const removeIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  const removeInstruction = (index) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'cocktail',
      glassType: 'rocks glass',
      difficulty: 'easy',
      preparationTime: 3,
      abv: 0,
      ingredients: [{ name: '', quantity: '', unit: 'ml', optional: false }],
      instructions: [''],
      garnish: '',
      moods: [],
      tags: [],
      subcategory: '',
    });
    setEditingRecipeId(null);
    setShowAddForm(false);
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();

    try {
      const dataToSubmit = {
        ...formData,
        preparationTime: parseInt(formData.preparationTime) || 0,
        abv: parseFloat(formData.abv) || 0,
        ingredients: formData.ingredients.map(ing => ({
          ...ing,
          quantity: parseFloat(ing.quantity) || 0,
        })),
        tags: formData.tags.filter(t => t.trim()),
      };

      await recipesApi.create(dataToSubmit);
      await fetchRecipes();
      resetForm();
    } catch (err) {
      console.error('Error saving recipe:', err);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await recipesApi.delete(recipeId);
      await fetchRecipes();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const handleStartEdit = (recipe) => {
    setEditingRecipeId(recipe.recipeId);
  };

  const handleCancelEdit = () => {
    setEditingRecipeId(null);
  };

  const handleSaveEdit = async (recipeId, updatedData) => {
    try {
      await recipesApi.update(recipeId, updatedData);
      await fetchRecipes();
      setEditingRecipeId(null);
    } catch (err) {
      console.error('Error updating recipe:', err);
      alert('Failed to update recipe. Please try again.');
    }
  };

  const handleToggleFavorite = (recipeId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        newFavorites.add(recipeId);
      }
      return newFavorites;
    });
  };

  const groupedRecipes = recipes.reduce((acc, recipe) => {
    if (!acc[recipe.category]) acc[recipe.category] = [];
    acc[recipe.category].push(recipe);
    return acc;
  }, {});

  // Filter to show only favorites if toggle is on
  const displayedRecipes = showFavoritesOnly
    ? Object.keys(groupedRecipes).reduce((acc, category) => {
        const favoritedInCategory = groupedRecipes[category].filter(recipe =>
          favorites.has(recipe.recipeId)
        );
        if (favoritedInCategory.length > 0) {
          acc[category] = favoritedInCategory;
        }
        return acc;
      }, {})
    : groupedRecipes;

  if (loading) {
    return (
      <div className="recipes-container">
        <div className="loading">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="recipes-container">
      <div className="recipes-header">
        <h1>Recipe Management</h1>
        <div className="recipes-header-actions">
          <button
            className={`btn-toggle ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? '⭐ Favorites' : '☆ Show Favorites'}
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Recipe'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-form-container">
          <h2>Add New Recipe</h2>
          <form onSubmit={handleAddRecipe} className="recipe-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Margarita"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="2"
                placeholder="Brief description of the drink..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="glassType">Glass Type</label>
                <select
                  id="glassType"
                  name="glassType"
                  value={formData.glassType}
                  onChange={handleInputChange}
                >
                  {GLASS_TYPES.map((glass) => (
                    <option key={glass} value={glass}>
                      {glass}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preparationTime">Prep Time (min)</label>
                <input
                  type="number"
                  id="preparationTime"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="abv">ABV (%)</label>
                <input
                  type="number"
                  id="abv"
                  name="abv"
                  value={formData.abv}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            {formData.category === 'wine' && (
              <div className="form-group">
                <label htmlFor="subcategory">Wine Type</label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select type</option>
                  <option value="red">Red</option>
                  <option value="white">White</option>
                  <option value="rose">Rosé</option>
                  <option value="sparkling">Sparkling</option>
                </select>
              </div>
            )}

            <div className="form-section">
              <div className="section-header">
                <h3>Ingredients</h3>
                <button type="button" className="btn-secondary btn-sm" onClick={addIngredient}>
                  + Add Ingredient
                </button>
              </div>
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    step="0.1"
                    required
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  >
                    <option value="ml">ml</option>
                    <option value="oz">oz</option>
                    <option value="count">count</option>
                    <option value="dash">dash</option>
                    <option value="dashes">dashes</option>
                    <option value="whole">whole</option>
                    <option value="leaves">leaves</option>
                    <option value="slice">slice</option>
                  </select>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={ing.optional}
                      onChange={(e) => handleIngredientChange(index, 'optional', e.target.checked)}
                    />
                    Optional
                  </label>
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeIngredient(index)}
                    >
                      ✗
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Instructions</h3>
                <button type="button" className="btn-secondary btn-sm" onClick={addInstruction}>
                  + Add Step
                </button>
              </div>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="instruction-row">
                  <span className="step-number">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder="Instruction step"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    required
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeInstruction(index)}
                    >
                      ✗
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="garnish">Garnish</label>
              <input
                type="text"
                id="garnish"
                name="garnish"
                value={formData.garnish}
                onChange={handleInputChange}
                placeholder="e.g., Lime wedge"
              />
            </div>

            <div className="form-group">
              <label>Moods</label>
              <div className="mood-checkboxes">
                {MOODS.map((mood) => (
                  <label key={mood} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.moods.includes(mood)}
                      onChange={() => handleMoodToggle(mood)}
                    />
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Recipe
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="recipes-list">
        {Object.keys(displayedRecipes).length === 0 ? (
          <div className="empty-state">
            <h2>{showFavoritesOnly ? 'No favorites yet' : 'No recipes found'}</h2>
            <p>{showFavoritesOnly ? 'Star some recipes to add them to your favorites!' : 'Start by adding your first recipe!'}</p>
          </div>
        ) : (
          Object.keys(displayedRecipes)
            .sort()
            .map((category) => (
              <div key={category} className="category-section">
                <h2 className="category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({displayedRecipes[category].length})
                </h2>
                <div className="recipes-list-view">
                  {displayedRecipes[category].map((recipe) => (
                    <RecipeCard
                      key={recipe.recipeId}
                      recipe={recipe}
                      isEditing={editingRecipeId === recipe.recipeId}
                      isViewing={viewingRecipeId === recipe.recipeId}
                      isFavorited={favorites.has(recipe.recipeId)}
                      onStartEdit={() => handleStartEdit(recipe)}
                      onCancelEdit={handleCancelEdit}
                      onSave={handleSaveEdit}
                      onDelete={handleDeleteRecipe}
                      onToggleView={() => setViewingRecipeId(viewingRecipeId === recipe.recipeId ? null : recipe.recipeId)}
                      onToggleFavorite={() => handleToggleFavorite(recipe.recipeId)}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// Recipe card component with expandable details
function RecipeCard({ recipe, isEditing, isViewing, isFavorited, onStartEdit, onCancelEdit, onSave, onDelete, onToggleView, onToggleFavorite }) {
  if (isEditing) {
    return (
      <div className="recipe-item editing">
        <p className="edit-note">Editing is simplified. For complex changes, delete and recreate the recipe.</p>
        <div className="recipe-actions">
          <button className="btn-secondary btn-sm" onClick={onCancelEdit}>Cancel</button>
        </div>
      </div>
    );
  }

  if (!isViewing) {
    // Collapsed view - show name, moods, and action buttons
    return (
      <div className="recipe-item collapsed">
        <div className="recipe-item-header" onClick={onToggleView}>
          <div className="recipe-name-moods">
            <h3 className="recipe-item-name">{recipe.name}</h3>
            {recipe.moods && recipe.moods.length > 0 && (
              <div className="recipe-moods-compact">
                {recipe.moods.map((mood, idx) => (
                  <span key={idx} className="mood-tag-small">
                    {mood}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="recipe-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-icon favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? '⭐' : '☆'}
          </button>
          <button className="btn-icon" onClick={() => onDelete(recipe.recipeId)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
    );
  }

  // Expanded view - show all details
  return (
    <div className="recipe-item expanded">
      <div className="recipe-item-header" onClick={onToggleView}>
        <h3 className="recipe-item-name">{recipe.name}</h3>
        <div className="recipe-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-icon favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? '⭐' : '☆'}
          </button>
          <button className="btn-icon" onClick={() => onDelete(recipe.recipeId)} title="Delete">
            🗑️
          </button>
        </div>
      </div>

      <div className="recipe-details-full">
        <p className="recipe-description">{recipe.description}</p>

        <div className="recipe-meta">
          {recipe.glassType && <span className="detail-badge">Glass: {recipe.glassType}</span>}
          {recipe.difficulty && <span className="detail-badge">{recipe.difficulty}</span>}
          {recipe.preparationTime && <span className="detail-badge">{recipe.preparationTime} min</span>}
          {recipe.abv && <span className="detail-badge">ABV: {recipe.abv}%</span>}
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="recipe-section">
            <strong>Ingredients:</strong>
            <ul>
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>
                  {ing.quantity} {ing.unit} {ing.name} {ing.optional && '(optional)'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="recipe-section">
            <strong>Instructions:</strong>
            <ol>
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {recipe.garnish && (
          <div className="recipe-section">
            <strong>Garnish:</strong> {recipe.garnish}
          </div>
        )}

        {recipe.moods && recipe.moods.length > 0 && (
          <div className="recipe-moods">
            {recipe.moods.map((mood, idx) => (
              <span key={idx} className="mood-tag">
                {mood}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recipes;
