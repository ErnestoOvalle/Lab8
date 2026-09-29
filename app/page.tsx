'use client'
import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/firebase.config';

type Auto = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  caballosFuerza: number;
  precio: number;
}

// Datos del formulario, sin id (Firestore lo genera)
type AutoForm = Omit<Auto, 'id'>;

// Lee toda la colección de Firestore
const cargarAutos = async (): Promise<Auto[]> => {
  const snapshot = await getDocs(collection(db, 'autos'))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AutoForm) }))
}

const formVacio: AutoForm = { marca: '', modelo: '', anio: 2024, caballosFuerza: 0, precio: 0 };

export default function Home() {
  const [form, setForm] = useState<AutoForm>(formVacio);
  const [autos, setAutos] = useState<Auto[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarAutos().then(setAutos).catch((e) => setError(String(e)))
  }, [])

  // Ejecuta una operación de Firestore mostrando estado de carga y errores
  const ejecutar = async (op: () => Promise<void>) => {
    setCargando(true);
    setError(null);
    try {
      await op();
    } catch (e) {
      setError(String(e));
    } finally {
      setCargando(false);
    }
  }

  const handleSubmit = () => ejecutar(async () => {
    if (!form.marca.trim() || !form.modelo.trim()) return;
    if (editandoId) {
      await updateDoc(doc(db, 'autos', editandoId), form)
      setAutos((prev) => prev.map((a) => a.id === editandoId ? { id: editandoId, ...form } : a));
    } else {
      const ref = await addDoc(collection(db, 'autos'), form)
      setAutos((prev) => [...prev, { id: ref.id, ...form }]);
    }
    setForm(formVacio);
    setEditandoId(null);
  })

  const handleEdit = (auto: Auto) => {
    const { id, ...datos } = auto;
    setForm(datos);
    setEditandoId(id);
  }

  const handleDelete = (id: string) => ejecutar(async () => {
    if (!id) return;
    await deleteDoc(doc(db, 'autos', id));
    setAutos((prev) => prev.filter((a) => a.id !== id));
    if (editandoId === id) { setForm(formVacio); setEditandoId(null); }
  })

  const cancelarEdicion = () => {
    setForm(formVacio);
    setEditandoId(null);
  }

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 flex flex-col gap-8 items-center">
      <h1 className="text-2xl font-bold">Catálogo de Autos Deportivos</h1>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="flex flex-col text-sm">Marca
          <input type="text" className="border-2 p-1" value={form.marca}
            onChange={(e) => setForm({ ...form, marca: e.target.value })} />
        </label>
        <label className="flex flex-col text-sm">Modelo
          <input type="text" className="border-2 p-1" value={form.modelo}
            onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
        </label>
        <label className="flex flex-col text-sm">Año
          <input type="number" className="border-2 p-1 w-24" value={form.anio}
            onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col text-sm">HP
          <input type="number" className="border-2 p-1 w-24" value={form.caballosFuerza}
            onChange={(e) => setForm({ ...form, caballosFuerza: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col text-sm">Precio (USD)
          <input type="number" className="border-2 p-1 w-32" value={form.precio}
            onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
        </label>
        <button className="border p-2 bg-blue-600 text-white cursor-pointer disabled:opacity-50" onClick={handleSubmit} disabled={cargando}>
          {cargando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar'}
        </button>
        {editandoId && (
          <button className="border p-2 cursor-pointer" onClick={cancelarEdicion}>Cancelar</button>
        )}
      </div>

      {error && <p className="text-red-500 max-w-xl text-sm">Error de Firestore: {error}</p>}

      <table className="border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Marca</th>
            <th className="border p-2">Modelo</th>
            <th className="border p-2">Año</th>
            <th className="border p-2">HP</th>
            <th className="border p-2">Precio</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {autos.map((auto) => (
            <tr key={auto.id}>
              <td className="border p-2">{auto.marca}</td>
              <td className="border p-2">{auto.modelo}</td>
              <td className="border p-2">{auto.anio}</td>
              <td className="border p-2">{auto.caballosFuerza}</td>
              <td className="border p-2">${auto.precio.toLocaleString()}</td>
              <td className="border p-2 flex gap-1">
                <button className="p-2 border bg-yellow-500 text-white cursor-pointer"
                  onClick={() => handleEdit(auto)}>Editar</button>
                <button className="p-2 border bg-red-500 text-white cursor-pointer"
                  onClick={() => handleDelete(auto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
