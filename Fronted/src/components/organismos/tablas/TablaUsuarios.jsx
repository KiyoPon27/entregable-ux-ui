import styled from "styled-components";
import {
  ContentAccionesTabla,
  Paginacion,
  useUsuariosStore
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
import { useQueryClient } from "@tanstack/react-query";
import { useEliminarUsuarioMutation } from "../../../tanstack/UsuariosStack";
import { toast } from "sonner";

export function TablaUsuarios({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data == null || data.length === 0) return <EmptyState>No hay usuarios registrados</EmptyState>;
  
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const queryClient = useQueryClient();
  const eliminarMutation = useEliminarUsuarioMutation();

  function eliminar(p) {
    Swal.fire({
      title: "¿Estás seguro(a)(e)?",
      text: "Una vez eliminado, ¡no podrá recuperar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        eliminarMutation.mutate({ id: p.id });
      }
    });
  }
  
  function editar(data) {
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }
  
  function esProtegido(usuario) {
    const rolNombre = usuario.rol?.nombre?.toLowerCase?.();
    return rolNombre === "superadmin" || rolNombre === "og";
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
      accessorKey: "nombres",
      header: "Nombres",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "nroDoc",
      header: "N° Documento",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "rol.nombre",
      header: "Rol",
      cell: (info) => <span>{info.row.original.rol?.nombre || "Sin rol"}</span>,
    },
    {
      accessorKey: "tipoDocumento.nombre",
      header: "Tipo Doc",
      cell: (info) => <span>{info.row.original.tipoDocumento?.nombre || "-"}</span>,
    },
    {
      accessorKey: "empresaId",
      header: "Empresa",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: (info) => (
        <div className="estadoBadge" data-estado={info.getValue()}>
          <span className="estadoText">
            {info.getValue()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "acciones",
      header: "ACCIONES",
      enableSorting: false,
      cell: (info) => {
        const protegido = esProtegido(info.row.original);
        return (
          <div data-title="Acciones" className="ContentCell">
            <ContentAccionesTabla
              funcionEditar={protegido ? null : () => editar(info.row.original)}
              funcionEliminar={protegido ? null : () => eliminar(info.row.original)}
              esProtegido={protegido}
            />
          </div>
        );
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
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-title={cell.column.columnDef.header}>
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

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 16px;
  color: #6b7280;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 20px;
  margin: 14px 0 0;
  padding: 16px;
`;

const Container = styled.div`
  position: relative;
  margin: 14px 0 0;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 20px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  padding: 16px;
  overflow: hidden;

  .responsive-table {
    width: 100%;
    min-width: 1000px;
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

    .estadoBadge {
      min-width: 110px;
      height: 32px;
      padding: 0 12px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      transition: all 0.2s ease;
    }

    .estadoBadge[data-estado="ACTIVO"] {
      background: rgba(22, 163, 74, 0.15);
      color: #166534;
      border: 1px solid rgba(22, 163, 74, 0.3);
    }

    .estadoBadge[data-estado="INACTIVO"] {
      background: rgba(220, 38, 38, 0.15);
      color: #991b1b;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    thead {
      background: linear-gradient(120deg, #0f172a 0%, #1e293b 100%);

      th {
        border-bottom: none;
        padding: 13px 14px;
        font-weight: 700;
        text-align: center;
        color: #f8fafc;
        font-size: 13px;
        letter-spacing: 0.5px;
        text-transform: uppercase;

        span {
          margin-left: 8px;
        }
      }
    }

    tbody tr {
      border-bottom: 1px solid ${({ theme }) => theme.color2};
      transition: background 0.15s ease;

      &:hover {
        background: ${({ theme }) => theme.bg3_hover || "#f8fafc"};
      }

      td {
        padding: 14px 12px;
        text-align: center;
        font-size: 13px;
        color: #475569;
      }
    }

    tbody tr:last-child {
      border-bottom: none;
    }
  }
`;