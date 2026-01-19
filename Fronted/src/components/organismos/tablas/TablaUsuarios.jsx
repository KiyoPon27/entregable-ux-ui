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

export function TablaUsuarios({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data == null || data.length === 0) return <div>No hay usuarios registrados</div>;
  
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
      confirmButtonText: "Si, eliminar",
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
  
  const columns = [
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
      accessorKey: "estado",
      header: "Estado",
      cell: (info) => (
        <span style={{ 
          color: info.getValue() === "ACTIVO" ? "green" : "red",
          fontWeight: "bold"
        }}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "acciones",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const esSuperAdmin = info.row.original.id === 1;
        return (
          <td data-title="Acciones" className="ContentCell">
            <ContentAccionesTabla
              funcionEditar={() => editar(info.row.original)}
              funcionEliminar={esSuperAdmin ? null : () => eliminar(info.row.original)}
            />
          </td>
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
      </Container>
      <Paginacion
        table={table}
        pagina={pagina}
        setPagina={setPagina}
        totalPaginas={table.getPageCount()}
      />
    </>
  );
}

const Container = styled.div`
  position: relative;
  margin: 5% 3%;
  
  @media (min-width: ${v.bpbart}) {
    margin: 2%;
  }
  @media (min-width: ${v.bphomer}) {
    margin: 2em auto;
  }
  
  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    
    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }
    @media (min-width: ${v.bpmarge}) {
      font-size: 1em;
    }
    
    thead {
      position: absolute;
      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
      
      @media (min-width: ${v.bpbart}) {
        position: relative;
        height: auto;
        width: auto;
        overflow: auto;
      }
      
      th {
        border-bottom: 2px solid ${({theme})=>theme.color2};
        font-weight: 700;
        text-align: center;
        color: ${({ theme }) => theme.text};
        &:first-of-type {
          text-align: center;
        }
      }
    }
    
    tbody,
    tr,
    th,
    td {
      display: block;
      padding: 0;
      text-align: left;
      white-space: normal;
    }
    
    tr {
      @media (min-width: ${v.bpbart}) {
        display: table-row;
      }
    }

    th,
    td {
      padding: 0.5em;
      vertical-align: middle;
      
      @media (min-width: ${v.bplisa}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.5em;
      }
      @media (min-width: ${v.bpmarge}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bphomer}) {
        padding: 0.75em;
      }
    }
    
    tbody {
      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
      }
      
      tr {
        margin-bottom: 1em;
        &:nth-of-type(even) {
          background-color: rgba(161, 161, 161, 0.1);
        }
        @media (min-width: ${v.bpbart}) {
          display: table-row;
          border-width: 1px;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
      }
      
      th[scope="row"] {
        @media (min-width: ${v.bplisa}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        }
        @media (min-width: ${v.bpbart}) {
          background-color: transparent;
          text-align: center;
          color: ${({ theme }) => theme.text};
        }
      }
      
      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        
        @media (min-width: ${v.bpbart}) {
          justify-content: center;
          border-bottom: none;
        }
      }
      
      td {
        text-align: right;
        @media (min-width: ${v.bpbart}) {
          text-align: center;
        }
      }
      
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.8em;
        @media (min-width: ${v.bplisa}) {
          font-size: 0.9em;
        }
        @media (min-width: ${v.bpbart}) {
          content: none;
        }
      }
    }
  }
`;
