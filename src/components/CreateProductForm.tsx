"use client";

import { useState } from "react";

type Props = {
  onSubmit: (form: { name: string; price: string }) => void;
};

export const CreateProductForm = ({ onSubmit }: Props) => {
  const [form, setForm] = useState({ name: "", price: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="name"
        placeholder="Nombre del producto"
        className="border p-2 rounded text-black bg-white"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Precio"
        className="border p-2 rounded text-black bg-white"
        value={form.price}
        onChange={handleChange}
        required
      />
      <button type="submit" className="bg-green-600 text-white py-2 rounded">
        Crear
      </button>
    </form>
  );
};
