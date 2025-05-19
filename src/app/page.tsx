"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import { CreateProductForm } from "@/components/CreateProductForm";

type Product = {
  id: string; // Cambiado de number a string
  name: string;
  price: number;
  updatedAt: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  
  /*const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  */
  const [setCurrentProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    const res = await fetch(`/api/products?q=${search}&page=${page}`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
  };

  useEffect(() => {
    const fetchAndFilter = async () => {
      const res = await fetch(`/api/products?page=${page}`);
      const data = await res.json();

      const normalize = (text: string) =>
        text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      const filtered = data.products.filter((product: Product) =>
        normalize(product.name).includes(normalize(search))
      );

      setProducts(filtered);
      setTotal(data.total); // O puedes usar filtered.length si paginas manualmente
    };

    fetchAndFilter();
  }, [search, page]);


  const handleCheck = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    // No resetear el form aquí para evitar parpadeo
    setCurrentProduct(null);
  };
  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  /*const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
        }),
        headers: { "Content-Type": "application/json" },
      });
      closeModal();
      await fetchProducts(); // Añade await para asegurar que se refrescan los datos
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };
  */
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas borrar este producto?")) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

 


  const showCreateForm = () => {
    const key = crypto.randomUUID(); // clave única para forzar re-render
    openModal(
      "Crear Producto",
      <div key={key}>
        <CreateProductForm
          onSubmit={async (form) => {
            try {
              await fetch("/api/products", {
                method: "POST",
                body: JSON.stringify({
                  name: form.name,
                  price: parseFloat(form.price),
                }),
                headers: { "Content-Type": "application/json" },
              });
              closeModal();
              await fetchProducts();
            } catch (error) {
              console.error("Error creating product:", error);
            }
          }}
        />
      </div>
    );
  };
  const AdjustProductForm = ({
    product,
    closeModal,
    fetchProducts,
  }: {
    product: Product;
    closeModal: () => void;
    fetchProducts: () => void;
  }) => {
    const [mode, setMode] = useState<"percentage" | "replace">("replace");
    const [priceValue, setPriceValue] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const num = parseFloat(priceValue);
      if (isNaN(num)) return alert("Ingresa un número válido");

      const newPrice =
        mode === "percentage"
          ? product.price + (product.price * num) / 100
          : num;

      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: product.name, price: newPrice }),
        headers: { "Content-Type": "application/json" },
      });

      closeModal();
      fetchProducts();
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="font-semibold">Ajustar precio de <strong>{product.name}</strong></p>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="percentage"
            checked={mode === "percentage"}
            onChange={() => setMode("percentage")}
          />
          Ajustar por porcentaje (%)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="replace"
            checked={mode === "replace"}
            onChange={() => setMode("replace")}
          />
          Reemplazar por precio fijo
        </label>
        <input
          type="number"
          step="any"
          placeholder={mode === "percentage" ? "Ej: 10 o -15" : "Ej: 1200"}
          className="border p-2 rounded"
          value={priceValue}
          onChange={(e) => setPriceValue(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-yellow-600 text-white py-2 rounded font-semibold"
        >
          Aplicar ajuste
        </button>
      </form>
    );
  };


  const showAdjustForm = (product: Product) => {
    setCurrentProduct(product);
    openModal(
      `Ajustar: ${product.name}`,
      <AdjustProductForm
        product={product}
        closeModal={closeModal}
        fetchProducts={fetchProducts}
      />
    );
  };

  const BatchAdjustForm = ({
    selected,
    products,
    closeModal,
    fetchProducts,
  }: {
    selected: string[];
    products: Product[];
    closeModal: () => void;
    fetchProducts: () => void;
  }) => {
    const [mode, setMode] = useState<"percentage" | "replace">("percentage");
    const [value, setValue] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const num = parseFloat(value);
      if (isNaN(num)) return alert("Ingresa un número válido");

      for (const id of selected) {
        const product = products.find((p) => p.id === id);
        if (!product) continue;

        const newPrice =
          mode === "percentage"
            ? product.price + (product.price * num) / 100
            : num;

        await fetch(`/api/products/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name: product.name, price: newPrice }),
          headers: { "Content-Type": "application/json" },
        });
      }

      closeModal();
      fetchProducts();
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="percentage"
            checked={mode === "percentage"}
            onChange={() => setMode("percentage")}
          />
          Ajustar por porcentaje (%)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="replace"
            checked={mode === "replace"}
            onChange={() => setMode("replace")}
          />
          Reemplazar por precio fijo
        </label>
        <input
          type="number"
          step="any"
          placeholder={mode === "percentage" ? "Ej: 10 o -15" : "Ej: 1200"}
          className="border p-2 rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-yellow-600 text-white py-2 rounded font-semibold"
        >
          Aplicar ajuste
        </button>
      </form>
    );
  };


  const showBatchAdjustMessage = () => {
    openModal(
      "Ajustar Seleccionados",
      selected.length > 0 ? (
        <BatchAdjustForm
          selected={selected}
          products={products}
          closeModal={closeModal}
          fetchProducts={fetchProducts}
        />
      ) : (
        <p>No hay productos seleccionados.</p>
      )
    );
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          className="border p-2 rounded w-full max-w-md"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 ml-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={showCreateForm}
          >
            Crear Producto
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={showBatchAdjustMessage}
          >
            Ajustar Seleccionados
          </button>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-black">
            <th className="p-2">Sel</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Últ. actualización</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(product.id)}
                  onChange={() => handleCheck(product.id)}
                />
              </td>
              <td className="p-2">{product.name}</td>
              <td className="p-2 text-center">${product.price.toFixed(2)}</td>
              <td className="p-2 text-center">
                {new Date(product.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-2 text-center">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => showAdjustForm(product)}
                >
                  Ajustar
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(product.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 gap-2">
        {[...Array(Math.ceil(total / 50)).keys()].map((n) => (
          <button
            key={n}
            onClick={() => setPage(n + 1)}
            className={`px-3 py-1 border rounded ${page === n + 1 ? "bg-black text-white" : ""
              }`}
          >
            {n + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{modalTitle}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
                type="button"
              >
                ×
              </button>
            </div>
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
}
