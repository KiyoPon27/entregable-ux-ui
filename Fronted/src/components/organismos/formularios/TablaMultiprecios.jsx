import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function TablaMultiprecios({ productoId, accion, onMultipreciosChange }) {
  const [multiprecios, setMultiprecios] = useState([]);
  const [multipreciosEliminados, setMultipreciosEliminados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ cantidad: '', nombre: '', precioVenta: '' });

  // Cargar multiprecios existentes cuando se edita
  useEffect(() => {
    if (accion === 'Editar' && productoId) {
      cargarMultiprecios();
    } else {
      // Si no es edición, limpiar arrays
      setMultiprecios([]);
      setMultipreciosEliminados([]);
    }
  }, [productoId, accion]);

  // Notificar cambios al componente padre
  useEffect(() => {
    console.log('🔔 TablaMultiprecios notificando cambios al padre:', multiprecios);
    console.log('🗑️ TablaMultiprecios eliminados:', multipreciosEliminados);
    if (onMultipreciosChange) {
      onMultipreciosChange(multiprecios, multipreciosEliminados);
    }
  }, [multiprecios, multipreciosEliminados]);

  const cargarMultiprecios = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/multiprecios/producto/${productoId}`);
      if (response.ok) {
        const data = await response.json();
        setMultiprecios(data);
        // Limpiar eliminados al cargar datos frescos de BD
        setMultipreciosEliminados([]);
      }
    } catch (error) {
      console.error('Error cargando multiprecios:', error);
    }
  };

  const agregarOEditar = () => {
    // Validaciones
    if (!formData.cantidad || !formData.precioVenta) {
      toast.error('Cantidad y precio son requeridos');
      return;
    }

    if (isNaN(formData.cantidad) || isNaN(formData.precioVenta)) {
      toast.error('Cantidad y precio deben ser números');
      return;
    }

    if (parseFloat(formData.cantidad) <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (parseFloat(formData.precioVenta) < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }

    // Verificar que no hay duplicados (mismo cantidad)
    const existe = multiprecios.some(
      (m) => 
        parseFloat(m.cantidad) === parseFloat(formData.cantidad) && 
        (!editingId || m.id !== editingId)
    );

    if (existe) {
      toast.error('Ya existe un multiprecio con esa cantidad');
      return;
    }

    if (editingId) {
      // Editar existente
      setMultiprecios((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                cantidad: parseFloat(formData.cantidad),
                nombreReferencial: formData.nombre || `${formData.cantidad} unidades`,
                precioVenta: parseFloat(formData.precioVenta),
              }
            : m
        )
      );
      setEditingId(null);
      toast.success('Multiprecio actualizado');
    } else {
      // Crear nuevo
      const newMultiprecio = {
        id: Date.now(), // ID temporal
        cantidad: parseFloat(formData.cantidad),
        nombreReferencial: formData.nombre || `${formData.cantidad} unidades`,
        precioVenta: parseFloat(formData.precioVenta),
        isNew: true,
      };
      console.log('➕ Agregando nuevo multiprecio:', newMultiprecio);
      setMultiprecios((prev) => [...prev, newMultiprecio]);
      toast.success('Opción de venta agregada');
    }

    limpiarForm();
  };

  const editarMultiprecio = (multiprecio) => {
    setEditingId(multiprecio.id);
    setFormData({
      cantidad: multiprecio.cantidad.toString(),
      nombre: multiprecio.nombreReferencial || '',
      precioVenta: multiprecio.precioVenta.toString(),
    });
    setShowForm(true);
  };

  const eliminarMultiprecio = (id) => {
    const multiprecioAEliminar = multiprecios.find(m => m.id === id);
    
    // Si es un multiprecio que ya existe en BD (no es nuevo), agregarlo a eliminados
    if (multiprecioAEliminar && !multiprecioAEliminar.isNew) {
      console.log('🗑️ Marcando multiprecio para eliminación en BD:', multiprecioAEliminar);
      setMultipreciosEliminados((prev) => [...prev, multiprecioAEliminar]);
    }
    
    // Remover del estado actual
    setMultiprecios((prev) => prev.filter((m) => m.id !== id));
    
    if (editingId === id) {
      limpiarForm();
    }
    toast.success('Opción eliminada');
  };

  const limpiarForm = () => {
    setFormData({ cantidad: '', nombre: '', precioVenta: '' });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <ContainerMultiprecios>
      <header className="header-multiprecios">
        <h3>OPCIONES DE VENTA (MULTIPRECIOS)</h3>
        <span className="info-hint">Ej: Docena (12 unds) → S/ 10.00</span>
      </header>

      {/* Tabla de multiprecios */}
      {multiprecios.length > 0 && (
        <TablaMult>
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Nombre Referencial</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {multiprecios.map((mp) => (
              <tr key={mp.id}>
                <td>{mp.cantidad}</td>
                <td>{mp.nombreReferencial || '-'}</td>
                <td>S/ {parseFloat(mp.precioVenta).toFixed(2)}</td>
                <td className="acciones">
                  <button
                    type="button"
                    onClick={() => editarMultiprecio(mp)}
                    className="btn-editar"
                    title="Editar"
                  >
                    ⚙️
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarMultiprecio(mp.id)}
                    className="btn-eliminar"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </TablaMult>
      )}

      {multiprecios.length === 0 && !showForm && (
        <MessageEmpty>📋 Sin opciones de venta aún</MessageEmpty>
      )}

      {/* Formulario para agregar/editar */}
      {showForm && (
        <FormMultiprecio>
          <div className="form-row">
            <div className="form-group">
              <label>Cantidad (ej: 12)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                placeholder="Cantidad de unidades"
              />
            </div>

            <div className="form-group">
              <label>Nombre Ref (ej: Docena)</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Nombre opcional (ej: Docena, Caja de 25)"
              />
            </div>

            <div className="form-group">
              <label>Precio (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precioVenta}
                onChange={(e) =>
                  setFormData({ ...formData, precioVenta: e.target.value })
                }
                placeholder="Precio especial"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button
              type="button"
              onClick={agregarOEditar}
              className="btn-guardar"
            >
              {editingId ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={limpiarForm}
              className="btn-cancelar"
            >
              ✕ Cancelar
            </button>
          </div>
        </FormMultiprecio>
      )}

      {/* Botón para agregar si no hay formulario abierto */}
      {!showForm && (
        <BtnAgregar
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-agregar-multiprecio"
        >
          Agregar opción de venta
        </BtnAgregar>
      )}
    </ContainerMultiprecios>
  );
}

const ContainerMultiprecios = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 16px;
  background: #f1f2f4;
  margin: 15px 0;

  .header-multiprecios {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #212121;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 1.25;
    }

    .info-hint {
      font-size: 13px;
      color: #5b5f67;
      font-style: italic;
      white-space: nowrap;
      line-height: 1.25;
      margin-top: 2px;
    }

    @media (max-width: 960px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;

      h3 {
        font-size: 17px;
      }

      .info-hint {
        white-space: normal;
      }
    }
  }
`;

const TablaMult = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;

  thead {
    background: #e5e7eb;

    th {
      padding: 11px 12px;
      text-align: left;
      font-weight: 600;
      color: #3f3f46;
      border-bottom: 1px solid #d1d5db;
    }
  }

  tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.2s;

    &:hover {
      background: #f8fafc;
    }

    td {
      padding: 10px 12px;
      color: #1f2937;
    }

    td.acciones {
      display: flex;
      gap: 8px;

      button {
        background: #ffffff;
        border: 1px solid #c9ced6;
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
        min-height: 32px;

        &:hover {
          transform: translateY(-1px);
        }

        &.btn-editar:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        &.btn-eliminar:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }
      }
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const FormMultiprecio = styled.div`
  background: #e8eaee;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;

  .form-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    label {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 0;
      color: #444;
      line-height: 1.2;
      white-space: nowrap;
      min-height: 16px;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      min-height: 40px;
      padding: 8px 12px;
      border: 1px solid #c7ccd4;
      border-radius: 10px;
      font-size: 14px;
      color: #212121;
      background: #ffffff;
      transition: border 0.2s;

      &:focus {
        outline: none;
        border-color: #111827;
        box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.12);
      }

      &::placeholder {
        color: #6b7280;
      }
    }
  }

  .form-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;

    button {
      padding: 8px 14px;
      border: 1px solid transparent;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 40px;

      &.btn-guardar {
        position: relative;
        z-index: 1;
        overflow: hidden;
        background: #212121;
        color: #ffffff;
        border-color: #212121;

        &::after {
          content: '';
          background: #ffffff;
          position: absolute;
          z-index: -1;
          left: -20%;
          right: -20%;
          top: 0;
          bottom: 0;
          transform: skewX(-45deg) scale(0, 1);
          transition: all 0.5s;
        }

        &:hover {
          color: #212121;
        }

        &:hover::after {
          transform: skewX(-45deg) scale(1, 1);
        }
      }

      &.btn-cancelar {
        background: #f3f4f6;
        color: #4b5563;
        border-color: #d1d5db;

        &:hover {
          background: #e5e7eb;
        }
      }
    }
  }
`;

const MessageEmpty = styled.div`
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-size: 16px;
  background: #ffffff;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
`;

const BtnAgregar = styled.button`
  width: 100%;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px dashed #9ca3af;
  border-radius: 10px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-height: 44px;

  &:hover {
    background: #f3f4f6;
    border-color: #6b7280;
  }
`;
