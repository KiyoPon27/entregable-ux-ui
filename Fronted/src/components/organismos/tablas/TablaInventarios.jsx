import styled from "styled-components";
import { Paginacion } from "../../../index";
import { memo, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";
import { useAsignacionCajaSucursalStore } from "../../../store/AsignacionCajaSucursalStore";

export const TablaInventarios = memo(function TablaInventarios({ data }) {
  if (!Array.isArray(data)) return null;

  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const { sucursalesItemSelectAsignadas } = useAsignacionCajaSucursalStore();

  const datosFiltradores = useMemo(
    () =>
      data.filter((item) => {
        if (!sucursalesItemSelectAsignadas?.sucursal?.id) {
          return true;
        }
        return (
          item?.almacen?.sucursal?.id ===
          sucursalesItemSelectAsignadas.sucursal.id
        );
      }),
    [data, sucursalesItemSelectAsignadas?.sucursal?.id]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: (info) => <span>{info.getValue()}</span>,
      },
      {
        accessorFn: (row) => row?.almacen?.sucursal?.nombre ?? "",
        id: "almacen.sucursal.nombre",
        header: "Sucursal",
        cell: (info) => <span>{info.getValue() ?? ""}</span>,
      },
      {
        accessorFn: (row) => row?.almacen?.nombre ?? "",
        id: "almacen.nombre",
        header: "Almacen",
        cell: (info) => <span>{info.getValue() ?? ""}</span>,
      },
      {
        accessorKey: "detalle",
        header: "Movimiento",
        cell: (info) => <span>{info.getValue()}</span>,
      },
      {
        accessorKey: "origen",
        header: "Origen",
        cell: (info) => <span>{info.getValue()}</span>,
      },
      {
        accessorKey: "tipoMovimiento",
        header: "Tipo",
        cell: (info) => <span>{info.getValue()}</span>,
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: (info) => <span>{info.getValue()}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: datosFiltradores,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  return (
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
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion
        table={table}
        irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex + 1}
        setPagina={setPagina}
        maximo={table.getPageCount()}
      />
    </Container>
  );
});

const Container = styled.div`
  position: relative;
  margin: 0;
  padding: 8px;
  background: white;
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;

    &:hover {
      background: #94a3b8;
    }
  }

  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    font-size: 14px;

    thead {
      position: sticky;
      top: 0;
      z-index: 10;

      tr {
        th {
          text-align: left;
          padding: 16px 18px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #1f2937;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border-bottom: 3px solid #667eea;
          vertical-align: middle;

          &:first-child {
            border-top-left-radius: 12px;
          }

          &:last-child {
            border-top-right-radius: 12px;
          }
        }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f9fafb;
        }

        &:last-child {
          td {
            &:first-child {
              border-bottom-left-radius: 12px;
            }
            &:last-child {
              border-bottom-right-radius: 12px;
            }
          }
        }

        td {
          padding: 16px 18px;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
          font-weight: 500;
          text-align: left;
          vertical-align: middle;
          height: auto;
          min-height: 45px;
        }
      }
    }
  }
`;
