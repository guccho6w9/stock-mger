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

  const [form, setForm] = useState({
    name: "",
    price: "",
  });
  /*const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  */
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    const res = await fetch(`/api/products?q=${search}&page=${page}`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchProducts();
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

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    await fetch(`/api/products/${currentProduct.id}`, {
      method: "PUT",
      body: JSON.stringify({ name: form.name, price: parseFloat(form.price) }),
      headers: { "Content-Type": "application/json" },
    });
    closeModal();
    fetchProducts();
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
  

  const showAdjustForm = (product: Product) => {
    setForm({ name: product.name, price: product.price.toString() });
    setCurrentProduct(product);
    openModal(
      "Ajustar Producto",
      <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="ajustar producto"
          className="border p-2 rounded text-black bg-white"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="number"
          className="border p-2 rounded"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          required
        />
        <button type="submit" className="bg-yellow-600 text-white py-2 rounded">
          Actualizar
        </button>
      </form>
    );
  };

  const showBatchAdjustMessage = () =>
    openModal(
      "Ajustar Seleccionados",
      <div>
        {selected.length > 0 ? (
          <p>
            Se pueden ajustar {selected.length} productos. (Función por
            implementar)
          </p>
        ) : (
          <p>No hay productos seleccionados.</p>
        )}
      </div>
    );

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
            className={`px-3 py-1 border rounded ${
              page === n + 1 ? "bg-black text-white" : ""
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
