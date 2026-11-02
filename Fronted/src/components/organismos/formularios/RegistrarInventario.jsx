import styled from "styled-components";
import { v } from "../../../styles/variables";
import api from "../../../api/api";
import {
  InputText,
  Btn1,
  useSucursalesStore,
  ConvertirCapitalize,
  useEmpresaStore,
  useProductosStore,
  useAlmacenesStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { BtnClose } from "../../ui/buttons/BtnClose";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCajasStore } from "../../../store/CajasStore";
import { useMovStockStore } from "../../../store/MovStockStore";
import { BuscadorList } from "../../ui/lists/BuscadorList";
import { SelectList } from "../../ui/lists/SelectList";
import { useFormattedDate } from "../../../hooks/useFormattedDate";
import { useStockStore } from "../../../store/StockStore";
import { RadioChecks } from "../../ui/toggles/RadioChecks";
import { useGlobalStore } from "../../../store/GlobalStore";
import { useInsertarMovStockMutation } from "../../../tanstack/MovStockStack";
import { useMostrarSucursalesQuery } from "../../../tanstack/SucursalesStack";
import {
  useMostrarAlmacenesXSucursalInventarioQuery,
  useMostrarAlmacenesXSucursalQuery,
} from "../../../tanstack/AlmacenesStack";
import { useMostrarStockXAlmacenYProductoQuery } from "../../../tanstack/StockStack";
import { MessageComponent } from "../../ui/messages/MessageComponent";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useBarcodeScanner } from "../../../hooks/useBarcodeScanner";
export function RegistrarInventario() {
  const { setStateClose } = useGlobalStore();
  const { dataempresa } = useEmpresaStore();

  const { tipo, setTipo } = useMovStockStore();
  const {
    selectProductos,
    productosItemSelect,
    resetProductosItemSelect,
  } = useProductosStore();

  // --- Búsqueda debounced al backend para evitar cuelgues en listas grandes ---
  const [inputBusqueda, setInputBusqueda] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const buscadorRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(inputBusqueda.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [inputBusqueda]);

  const { data: productosFiltrados = [] } = useQuery({
    queryKey: [
      "buscar productos inventario registro",
      dataempresa?.id,
      debouncedBusqueda,
    ],
    queryFn: () =>
      debouncedBusqueda.length > 0
        ? api
            .get(
              `/productos/buscar/${dataempresa?.id}?q=${encodeURIComponent(
                debouncedBusqueda
              )}`
            )
            .then((r) => r.data || [])
        : Promise.resolve([]),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
    retry: false,
  });

  function handleSetBuscador(value) {
    setInputBusqueda(value);
  }

  const handleBarcode = useCallback((code) => {
    setInputBusqueda(code);
    setTimeout(() => buscadorRef.current?.focus(), 50);
  }, []);
  useBarcodeScanner(handleBarcode);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      precio_compra: productosItemSelect?.precioCompra,
      precio_venta: productosItemSelect?.precioVenta,
    },
  });
  useEffect(() => {
    if (productosItemSelect) {
      reset({
        cantidad: "", // o 0
        precio_compra: productosItemSelect.precioCompra || 0,
        precio_venta: productosItemSelect.precioVenta || 0,
      });
    }
  }, [productosItemSelect]);

  const { selectSucursal, sucursalesItemSelect } = useSucursalesStore();

  const { data: dataSucursales, isLoading: isLoadingSucursal } =
    useMostrarSucursalesQuery();
  const { data: dataAlmacenes, isLoading: isLoadingAlmacenes } =
    useMostrarAlmacenesXSucursalInventarioQuery();

  const { setAlmacenSelectItem, almacenSelectItem } = useAlmacenesStore();

  const { data: dataStock, isLoading: isLoadingStockXAlmacenYProducto } =
    useMostrarStockXAlmacenYProductoQuery();

  const { mutate, isPending } = useInsertarMovStockMutation();

  const resetFuction = () => {
    reset();
    setTipo("ingreso");
  };
  const isLoading = isLoadingSucursal || isLoadingAlmacenes;
  if (isLoading) {
    return <span>cargando almacenes...</span>;
  }
  // if (error) {
  //   return <span>error...{error.message} </span>;
  // }
  return (
    <Container>
      {isPending ? (
        <span>guardando...🔼</span>
      ) : (
        <div className="sub-contenedor">
          <RadioChecks />
          <div className="headers">
            <section>
              <h1>
                {tipo == "ingreso" ? "REGISTRAR ENTRADA" : "REGISTRAR SALIDA"}
              </h1>
            </section>

            <section>
              <BtnClose
                funcion={() => {
                  resetProductosItemSelect();
                  setStateClose(false);
                }}
              />
            </section>
          </div>
          <section className="containerListas">
            <BuscadorList
              data={productosFiltrados}
              onSelect={selectProductos}
              setBuscador={handleSetBuscador}
              externalValue={inputBusqueda}
              inputRef={buscadorRef}
            />
            <span>
              Producto:{" "}
              <strong>
                {productosItemSelect?.nombre
                  ? productosItemSelect?.nombre
                  : "-"}{" "}
              </strong>
            </span>
            <span>
              Stock:{" "}
              <strong>{dataStock?.stock ? dataStock?.stock : "-"} </strong>
            </span>

            <InventarioSelectorContainer>
              <label>Sucursal:</label>
              <SelectList
                appearance="product"
                data={dataSucursales}
                itemSelect={sucursalesItemSelect}
                onSelect={selectSucursal}
                displayField="nombre"
              />
            </InventarioSelectorContainer>
            <InventarioSelectorContainer>
              <label>Almacen:</label>
              <SelectList
                appearance="product"
                data={dataAlmacenes}
                itemSelect={almacenSelectItem}
                onSelect={setAlmacenSelectItem}
                displayField="nombre"
              />
            </InventarioSelectorContainer>
          </section>
          {productosItemSelect?.manejaInventarios ? (
            <form className="formulario" onSubmit={handleSubmit(mutate)}>
              <section className="form-subcontainer">
                <article>
                  <InputText icono={<v.iconoflechaderecha />}>
                    <input
                      className="form__field"
                      type="number"
                      {...register("cantidad", {
                        required: true,
                      })}
                    />
                    <label className="form__label">Cantidad</label>
                    {errors.cantidad?.type === "required" && (
                      <p>Campo requerido</p>
                    )}
                  </InputText>
                </article>
                <article>
                  <InputText icono={<v.iconoflechaderecha />}>
                    <input
                      className="form__field"
                      type="number"
                      disabled
                      {...register("precio_compra")}
                    />
                    <label className="form__label">Precio costo</label>
                    {errors.precio_compra?.type === "required" && (
                      <p>Campo requerido</p>
                    )}
                  </InputText>
                </article>
                <article>
                  <InputText icono={<v.iconoflechaderecha />}>
                    <input
                      className="form__field"
                      type="number"
                      disabled
                      {...register("precio_venta")}
                    />
                    <label className="form__label">Precio venta</label>
                    {errors.precio_venta?.type === "required" && (
                      <p>Campo requerido</p>
                    )}
                  </InputText>
                </article>

                <Btn1
                  disabled={!productosItemSelect?.nombre}
                  icono={<v.iconoguardar />}
                  titulo="Guardar"
                  bgcolor="#F9D70B"
                />
              </section>
            </form>
          ) : (
            <MessageComponent
              text={
                productosItemSelect?.nombre
                  ? "Este producto no maneja inventarios, dirijase a configuración > productos y realice el cambio "
                  : "Busque un producto"
              }
            />
          )}
        </div>
      )}
    </Container>
  );
}
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  .sub-contenedor {
    position: relative;
    width: 500px;
    max-width: 85%;
    border-radius: 20px;
    background: ${({ theme }) => theme.body};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .containerListas {
      gap: 20px;
      display: flex;
      flex-direction: column;
    }
    .contentSucursal {
      display: flex;
      gap: 10px;
    }
    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        font-size: 30px;
        font-weight: 700;
        text-transform: uppercase;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }
  }
`;

export const InventarioSelectorContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;

  > label {
    min-width: 78px;
    font-size: 1rem;
    color: ${({ theme }) => theme.text};
  }

  > div[data-appearance="product"] {
    width: 100%;
  }

  > div[data-appearance="product"] button {
    min-height: 46px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 16px;
    font-weight: 500;
  }

  > div[data-appearance="product"] > div {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
  }

  > div[data-appearance="product"] > div > div {
    font-size: 16px;
  }
`;
