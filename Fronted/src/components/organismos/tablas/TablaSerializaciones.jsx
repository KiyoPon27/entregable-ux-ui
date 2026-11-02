import styled from "styled-components";
import {
  ContentAccionesTabla,
  Paginacion,
} from "../../../index";

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
import { useGlobalStore } from "../../../store/GlobalStore";
import { Check } from "../../ui/toggles/Check";
import { useEditarSerializacionDefaultMutation } from "../../../tanstack/SerializacionStack";
export function TablaSerializaciones({ data }) {
  if (data == null) return null;
  const [pagina, setPagina] = useState(1);
  const [datas, setData] = useState(data);
  const [columnFilters, setColumnFilters] = useState([]);
  const { setStateClose, setItemSelect, setAccion } = useGlobalStore();
  const {mutate:mutateEditarPorDefault} = useEditarSerializacionDefaultMutation()

  function editarPorDefault(data) {
    setItemSelect(data); 
    mutateEditarPorDefault()
  }

  function editar(data) {
    setStateClose(true);
    setItemSelect(data);
    setAccion("Editar");
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
      accessorKey: "tipoComprobante.nombre",
      header: "Comprobante",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "serie",
      header: "Serie",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "cantidadNumeros",
      header: "Cantidad números",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "correlativo",
      header: "Correlativo",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "porDefecto",
      header: "Por default",
      cell: (info) => (
        <div  className="ContentCell">
          <Check onChange={() => editarPorDefault(info.row.original)} checked={info.getValue()} />
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
      accessorKey: "acciones",
      header: "ACCIONES",
      enableSorting: false,
      cell: (info) => (
        <div data-title="Acciones" className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
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
    min-width: 940px;
    margin-bottom: 1.1em;
    border-collapse: collapse;
    table-layout: fixed;

    .ContentCell {
      display: flex;
      margin: auto;
      justify-content: center;
      align-items: center;
      min-height: 36px;
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

      th:nth-child(1) { width: 7%; }
      th:nth-child(2) { width: 24%; }
      th:nth-child(3) { width: 12%; }
      th:nth-child(4) { width: 21%; }
      th:nth-child(5) { width: 16%; }
      th:nth-child(6) { width: 12%; }
      th:nth-child(7) { width: 8%; }
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
        text-align: center;
        padding: 14px;
        color: ${({ theme }) => theme.text};
        font-size: 14px;
      }
    }
  }

  @media (max-width: ${v.bpbart}) {
    overflow-x: auto;
    padding: 12px;
  }
`;