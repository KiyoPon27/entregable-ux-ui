import styled from "styled-components";
import {
  ContentAccionesTabla,
  Paginacion,ImagenContent, Icono
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const POS_METHODS = {
  EFECTIVO: { icon: "💵", color: "#16a34a" },
  TARJETA: { icon: "💳", color: "#0ea5e9" },
  MIXTO: { icon: "🏦", color: "#f59e0b" },
  YAPE: { icon: "📱", color: "#7c3aed" },
};

function normalizeName(value = "") {
  return String(value).trim().toUpperCase();
}

function isHexColor(value = "") {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value));
}

function resolveMetodoIcono(metodo) {
  const icono = metodo?.icono;
  const nombre = normalizeName(metodo?.nombre);
  if (icono && icono !== "-" && !isHexColor(icono)) {
    return icono;
  }
  return POS_METHODS[nombre]?.icon || "💵";
}

function resolveMetodoColor(metodo) {
  const nombre = normalizeName(metodo?.nombre);
  const color = metodo?.color;
  if (isHexColor(color)) {
    return color;
  }
  return POS_METHODS[nombre]?.color || "#16a34a";
}
export function TablaMetodosPago({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data == null) return null;
  const [pagina, setPagina] = useState(1);
  const [datas, setData] = useState(data);
  const [columnFilters, setColumnFilters] = useState([]);
const queryClient = useQueryClient()
  const { eliminarMetodosPago, deshabilitarMetodosPago, habilitarMetodosPago } = useMetodosPagoStore();

  function esMetodoProtegido(p) {
    const id = Number(p?.id);
    return Number.isFinite(id) && id > 0 && id <= 4;
  }

  function estaDeshabilitado(p) {
    if (p?.verNombre === false || p?.ver_nombre === false) return true;
    if (p?.verNombre === true || p?.ver_nombre === true) return false;
    return false;
  }
  function eliminar(p) {
    toast.error("No se pueden eliminar métodos de pago para evitar errores en ventas enlazadas.")
    return;
  }
  function editar(data) {
    if (esMetodoProtegido(data)) {
      toast.error("Los métodos base del sistema no se pueden modificar.")
      return;
    }
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  function deshabilitar(p) {
    if (esMetodoProtegido(p)) {
      toast.error("Los métodos base del sistema no se pueden deshabilitar.")
      return;
    }
    Swal.fire({
      title: "¿Deshabilitar método de pago?",
      text: "Al deshabilitarlo, dejará de mostrarse en el POS.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deshabilitarMetodosPago({ id: p.id });
        queryClient.invalidateQueries(["mostrar metodos pago"])
      }
    });
  }

  function habilitar(p) {
    Swal.fire({
      title: "¿Habilitar método de pago?",
      text: "Al habilitarlo, volverá a mostrarse en el POS.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#111111",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await habilitarMetodosPago({ id: p.id });
        queryClient.invalidateQueries(["mostrar metodos pago"])
      }
    });
  }

  function toggleEstado(p) {
    if (esMetodoProtegido(p)) {
      toast.error("Los métodos base del sistema no se pueden cambiar de estado.")
      return;
    }
    if (estaDeshabilitado(p)) {
      habilitar(p);
      return;
    }
    deshabilitar(p);
  }
  const columns = [
    {
      accessorKey: "index",
      header: "#",
      enableSorting: false,
      cell: (info) => (
        <div data-title="#" className="ContentCell">
          <span>{info.row.index + 1}</span>
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      accessorKey: "icono",
      header: "Icono", 
      enableSorting: false,
      cell: (info) => (
        <div data-title="Icono" className="ContentCell">
          <div className="iconBadge" style={{ backgroundColor: resolveMetodoColor(info.row.original) }}>
            <span className="iconValue">
              {resolveMetodoIcono(info.row.original)}
            </span>
          </div>
        </div>
      ),

      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
   
    {
      accessorKey: "nombre",
      header: "Descripcion",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },

  
    {
      accessorKey: "acciones",
      header: "ACCIONES",
      enableSorting: false,
      cell: (info) => (
        <div data-title="Acciones" className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
            funcionEliminar={() => eliminar(info.row.original)}
            funcionDeshabilitar={() => deshabilitar(info.row.original)}
            switchValue={!estaDeshabilitado(info.row.original)}
            funcionToggleEstado={() => toggleEstado(info.row.original)}
            esProtegido={esMetodoProtegido(info.row.original)}
          />
        </div>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
  ];
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                  ...prev[rowIndex],
                  [columnId]: value,
                }
              : row
          )
        ),
    },
  });
  return (
    <>
      <Container>
        <table className="responsive-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.column.columnDef.header}
                    {header.column.getCanSort() && (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <FaArrowsAltV />
                      </span>
                    )}
                    {
                      {
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()]
                    }
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${
                        header.column.getIsResizing() ? "isResizing" : ""
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(item=>(
              
                <tr key={item.id}>
                  {item.getVisibleCells().map(cell => (
                  
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    
                  ))}
                </tr>
             
            ))}
          </tbody>
        </table>
        <Paginacion
          table={table}
          variant="modern"
          irinicio={() => table.setPageIndex(0)}
          pagina={table.getState().pagination.pageIndex + 1}
          setPagina={setPagina}
          maximo={table.getPageCount()}
        />
      </Container>
    </>
  );
}
const Container = styled.div`
  position: relative;
  margin: 14px 0 0;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 20px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  padding: 16px;

  .responsive-table {
    width: 100%;
    min-width: 840px;
    margin-bottom: 1.1em;
    border-collapse: collapse;
    table-layout: fixed;

    .ContentCell {
      display: flex;
      margin: auto;
      justify-content: center;
      align-items: center;
      min-height: 36px;
      border-bottom: none;
    }

      .iconBadge {
        min-width: 120px;
        height: 44px;
        padding: 0 14px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        gap: 10px;
        font-size: 18px;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
        white-space: nowrap;
        color: #fff;

        .iconValue {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
      }

    thead {
      background: linear-gradient(120deg, #0f172a 0%, #1e293b 100%);

      th {
        border-bottom: none;
        padding: 13px 14px;
        font-weight: 700;
        text-align: center;
        color: #f8fafc;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;

        &:first-of-type {
          border-top-left-radius: 10px;
        }

        &:last-of-type {
          border-top-right-radius: 10px;
        }
      }

      th:nth-child(1) { width: 6%; }
      th:nth-child(2) { width: 16%; }
      th:nth-child(3) { width: 48%; }
      th:nth-child(4) { width: 20%; }
      th:nth-child(5) { width: 10%; }
    }

    tbody,
    tr,
    th,
    td {
      white-space: normal;
    }

    tbody {
      tr {
        border-bottom: 1px solid ${({ theme }) => theme.color2};
        transition: background 0.2s ease;

        &:nth-of-type(even) {
          background: ${({ theme }) =>
            theme.bodyRgba === "15,20,25"
              ? "rgba(255, 255, 255, 0.03)"
              : "rgba(15, 23, 42, 0.035)"};
        }

        &:hover {
          background: ${({ theme }) =>
            theme.bodyRgba === "15,20,25"
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(15, 23, 42, 0.11)"};
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 14px;
        text-align: center;
        color: ${({ theme }) => theme.text};
        font-size: 14px;

        @media (min-width: ${v.bpbart}) {
          text-align: center;
        }
      }
    }
  }

  @media (max-width: ${v.bpbart}) {
    overflow-x: auto;
    padding: 12px;
  }
`;
const Colorcontent = styled.div`
  justify-content: center;
  min-height: ${(props) => props.$alto};
  width: ${(props) => props.$ancho};
  display: flex;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  text-align: center;
`;
