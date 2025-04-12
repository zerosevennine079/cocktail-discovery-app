import { useState, useEffect } from "react";
import { Box, Typography, Button, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, List, ListItem, ListItemText } from "@mui/material";

export default function DrinkFinder() {
    const [drinks, setDrinks] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [selectedDrink, setSelectedDrink] = useState("");
    const [drinkResults, setDrinkResults] = useState([]);
    const [ingredientResults, setIngredientResults] = useState([]);

    useEffect(() => {
        fetch("/api/listDrinks")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setDrinks(data);
                } else {
                    console.error("Unexpected drinks API format:", data);
                }
            })
            .catch((err) => console.error("Error fetching drinks:", err));

        fetch("/api/listIngredients")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setIngredients(data);
                } else {
                    console.error("Unexpected ingredients API format:", data);
                }
            })
            .catch((err) => console.error("Error fetching ingredients:", err));
    }, []);

    const getDrinksFromIngredients = async () => {
        if (selectedIngredients.length === 0) return;
        try {
            await fetch(`/api/getDrinks?ingredients=${selectedIngredients.join(",")}`)
                .then((res) => res.json())
                .then(data => {
                    if (data && Array.isArray(data.drinks)) {
                        setDrinkResults(data.drinks);
                    } else {
                        setDrinkResults([]);
                    }
                })
        } catch (err) {
            console.error("Error fetching drinks from ingredients:", err);
        }
    };

    const getIngredientsFromDrink = async () => {
        if (!selectedDrink) return;
        try {
            await fetch(`/api/getIngredients?drink_id=${selectedDrink}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data.ingredients)) {
                        setIngredientResults(data.ingredients);
                    } else {
                        console.error("Unexpected format for /api/getIngredients:", data);
                    }
                })
        } catch (err) {
            console.error("Error fetching ingredients for drink:", err);
        }
    };

    return (
        <Box sx={{maxWidth: '1200px', margin: '0 auto', p: 4}}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: 'url(/cocktail-banner.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px',
                    borderRadius: '8px',
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }}
                />
                <Typography
                    variant="h1"
                    sx={{
                        color: '#fff',
                        fontSize: {xs: '2.5rem', md: '4rem'},
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        zIndex: 1,
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    Bar Buddy
                </Typography>
            </Box>

            <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 3}}>
                {/* Left section: Find Drinks by Ingredients */}
                <Box sx={{flex: 1, border: 1, borderRadius: 2, padding: 3, boxShadow: 2}}>
                    <h2>Find Drinks by Ingredients</h2>
                    <Box sx={{marginBottom: 2}}>
                        {ingredients.map((ing) => (
                            <FormControlLabel
                                key={ing.id}
                                control={
                                    <Checkbox
                                        value={ing.id}
                                        checked={selectedIngredients.includes(ing.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIngredients([...selectedIngredients, ing.id]);
                                            } else {
                                                setSelectedIngredients(selectedIngredients.filter(id => id !== ing.id));
                                            }
                                        }}
                                    />
                                }
                                label={ing.name}
                            />
                        ))}
                    </Box>
                    <Button variant="contained" color="primary" onClick={getDrinksFromIngredients}
                            sx={{width: '100%', mb: 2}}>
                        Find Drinks
                    </Button>
                    {drinkResults.length === 0 ? (
                        <p>No drinks found.</p>
                    ) : (
                        <List>
                            {drinkResults.map((drink) => (
                                <ListItem key={drink.drink_id}>
                                    <ListItemText
                                        primary={drink.drink_name}
                                        secondary={
                                            <List>
                                                {drink.ingredients.map((ingredient) => (
                                                    <ListItem key={ingredient.ingredient_id}>
                                                        <ListItemText
                                                            primary={`${ingredient.name}: ${ingredient.amount}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Right section: Find Ingredients for a Drink */}
                <Box sx={{flex: 1, border: 1, borderRadius: 2, padding: 3, boxShadow: 2}}>
                    <h2>Find Ingredients for a Drink</h2>
                    <Box sx={{marginBottom: 2}}>
                        <InputLabel id="select-drink-label">Select a Drink</InputLabel>
                        <Select
                            labelId="select-drink-label"
                            value={selectedDrink}
                            onChange={(e) => setSelectedDrink(e.target.value)}
                            fullWidth
                            sx={{marginBottom: 2}}
                        >
                            <MenuItem value="">Select a Drink</MenuItem>
                            {drinks.map((drink) => (
                                <MenuItem key={drink.id} value={drink.id}>
                                    {drink.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Button variant="contained" color="primary" onClick={getIngredientsFromDrink}
                            sx={{width: '100%', mb: 2}}>
                        Get Ingredients
                    </Button>
                    {ingredientResults.length === 0 ? (
                        <p>No ingredients found.</p>
                    ) : (
                        <List>
                            {ingredientResults.map((ing) => (
                                <ListItem key={ing.id}>
                                    <ListItemText
                                        primary={`${ing.name}: ${ing.quantity}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </Box>
    );
}