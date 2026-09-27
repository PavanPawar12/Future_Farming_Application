import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] }, // {product, name, price, unit, image, stock, quantity}
  reducers: {
    addToCart: (state, action) => {
      const p = action.payload;
      const qty = p.quantity || 1;
      const existing = state.items.find((i) => i.product === p.product);
      if (existing) {
        existing.quantity = Math.min(existing.stock, existing.quantity + qty);
        existing.price = p.price; existing.name = p.name;
      } else {
        state.items.push({ ...p, quantity: Math.min(p.stock || 99, qty) });
      }
    },
    setQuantity: (state, action) => {
      const { product, quantity } = action.payload;
      const it = state.items.find((i) => i.product === product);
      if (!it) return;
      if (quantity <= 0) state.items = state.items.filter((i) => i.product !== product);
      else it.quantity = Math.min(it.stock || 99, quantity);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.product !== action.payload);
    },
    clearCart: (state) => { state.items = []; },
    syncStock: (state, action) => {
      // payload: [{product, stock}] — clamp quantities
      for (const s of action.payload || []) {
        const it = state.items.find((i) => i.product === (s.product?._id || s.product));
        if (it && s.stock !== undefined) {
          it.stock = s.stock;
          if (it.quantity > s.stock) it.quantity = s.stock;
        }
      }
      state.items = state.items.filter((i) => i.quantity > 0);
    },
  },
});

export const { addToCart, setQuantity, removeItem, clearCart, syncStock } = cartSlice.actions;
export const selectCartCount = (s) => s.cart.items.reduce((a, i) => a + i.quantity, 0);
export const selectSubtotal = (s) => s.cart.items.reduce((a, i) => a + i.price * i.quantity, 0);
export default cartSlice.reducer;
