import styled from "styled-components";
import {
  useProductosStore,
  useSucursalesStore,
  useCategoriasStore,
  Btngenerarcodigo,
  useAlmacenesStore,
  ConvertirMinusculas,
  useBarcodeScanner,
} from "../../../index";
import { useForm } from "react-hook-form";
import api from "../../../api/api";
import { ImageSelector } from "../../../hooks/useImageSelector";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Checkbox1 } from "../Checkbox1";
import { TablaMultiprecios } from "./TablaMultiprecios";
import Swal from "sweetalert2";
import { SelectList } from "../../ui/lists/SelectList";
import { useStockStore } from "../../../store/StockStore";
import { toast } from "sonner";

export function RegistrarProductos({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
  state,
}) {
  if (!state) return;
  //validar checkboxs
  const [isChecked1, setIsChecked1] = useState(true);
  const [isChecked2, setIsChecked2] = useState(false);
  const [sevendepor, setSevendepor] = useState("UNIDAD");
  const [tipoComprobante, setTipoComprobante] = useState("FACTURADO");
  const [isCheckedFacturado, setIsCheckedFacturado] = useState(true);
  const [isCheckedManualidad, setIsCheckedManualidad] = useState(false);
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [multiprecios, setMultiprecios] = useState([]);
  const [multipreciosEliminados, setMultipreciosEliminados] = useState([]);
  // Barcodes (multiple codes support)
  const [barcodes, setBarcodes] = useState([]);
  const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  // Debug: monitorear cambios en multiprecios
  useEffect(() => {
    console.log('🔄 RegistrarProductos - multiprecios actualizado:', multiprecios);
    console.log('🔄 RegistrarProductos - eliminados actualizado:', multipreciosEliminados);
    console.log('🔄 RegistrarProductos - barcodes actualizado:', barcodes);
  }, [multiprecios, multipreciosEliminados, barcodes]);
  
  const handleCheckboxChange = (checkboxNumber) => {
    if (checkboxNumber === 1) {
      setIsChecked1(true);
      setIsChecked2(false);
      setSevendepor("UNIDAD");
    } else {
      setIsChecked1(false);
      setIsChecked2(true);
      setSevendepor("GRANEL");
    }
  };
  const handleTipoComprobanteChange = (tipo) => {
    console.log("🔵 handleTipoComprobanteChange llamado con tipo:", tipo);
    if (tipo === 1) {
      setIsCheckedFacturado(true);
      setIsCheckedManualidad(false);
      setTipoComprobante("FACTURADO");
      console.log("✅ Configurado a FACTURADO");
    } else {
      setIsCheckedFacturado(false);
      setIsCheckedManualidad(true);
      setTipoComprobante("MANUALIDAD");
      console.log("✅ Configurado a MANUALIDAD");
    }
  };
  //

  const {
    insertarProductos,
    editarProductos,
    generarCodigo,
    codigogenerado,
    refetchs,
    mostrarProductos,
    parametros,
    buscador,
    buscarProductos,
    selectProductos,
  } = useProductosStore();
  const { insertarStock, mostrarStockXAlmacenYProducto } = useStockStore();
  const { dataempresa } = useEmpresaStore();
  const {
    dataalmacen,
    eliminarAlmacen,
    mostrarAlmacenesXSucursal,
    almacenSelectItem,
    setAlmacenSelectItem,
  } = useAlmacenesStore();
  const [stateInventarios, setStateInventarios] = useState(false);
  const [stateEnabledStock, setStateEnabledStock] = useState(false);

  const { dataSucursales, selectSucursal, sucursalesItemSelect } =
    useSucursalesStore();
  const { datacategorias, selectCategoria, categoriaItemSelect } =
    useCategoriasStore();
  const {
    data: dataStockXAlmacenYProducto,
  } = useQuery({
    queryKey: [
      "mostrar stock almacen y producto",
      { id_producto: dataSelect?.id, id_almacen: almacenSelectItem?.id },
    ],
    queryFn: () =>
      mostrarStockXAlmacenYProducto({
        id_almacen: almacenSelectItem?.id,
        id_producto: dataSelect?.id,
      }),
    enabled: !!dataSelect?.id && !!almacenSelectItem?.id,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const {
    data: dataAlmacenes,
  } = useQuery({
    queryKey: [
      "mostrar almacenes x sucursal",
      {
        id_producto: dataSelect?.id,
        id_sucursal: sucursalesItemSelect?.id,
      },
    ],
    queryFn: () =>
      mostrarAlmacenesXSucursal({
        id_sucursal: sucursalesItemSelect?.id,
      }),
    enabled: !!sucursalesItemSelect?.id,
    refetchOnWindowFocus: false,
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(dataSelect?.imagenBase64 ?? dataSelect?.imagen ?? "");

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      setImagePreview(URL.createObjectURL(file));
    } catch (e) {
      setImagePreview("");
    }
  };

  const uploadImageForProduct = async (productId) => {
    if (!selectedFile) return null;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      // api baseURL already contains /api
      const resp = await api.post(`/productos/${productId}/imagen`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = resp?.data?.url;
      const productoActualizado = resp?.data?.producto;
      // Si el backend retornó la versión base64 (imagenBase64), usarla para la vista previa (mejor compatibilidad offline)
      const previewSrc = productoActualizado?.imagenBase64 ?? url ?? null;
      if (url) {
        setValue("imagen", url);
        // También almacenar base64 en el formulario para referencia (si existe)
        if (productoActualizado?.imagenBase64) {
          try { setValue("imagen_base64", productoActualizado.imagenBase64); } catch(e) {}
        }
        setImagePreview(previewSrc);
        toast.success("Imagen subida correctamente");
      }
      // Actualizar store / refrescar listado para que la imagen aparezca inmediatamente
      try {
        if (productoActualizado && typeof selectProductos === 'function') {
          selectProductos(productoActualizado);
        }
      } catch (e) {
        console.error('Error actualizando producto en store:', e);
      }
      // refrescar listado global
      try { if (typeof mostrarProductos === 'function') await mostrarProductos(parametros); } catch(e) { console.error('Error refrescando productos tras upload:', e); }
      setSelectedFile(null);
      return url;
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      toast.error("Error subiendo imagen");
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar productos",
    onError: (error) => toast.error(`Errror: ${error.message}`),
    onSuccess: () => {
      toast.success("Producto guardado correctamente");
      cerrarFormulario();
    },
  });
  const handlesub = (data) => {
    doInsertar(data);
  };
  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };
  async function insertar(data) {
    validarVacios(data);
    
    // Validar que precio de compra no sea mayor o igual al precio de venta
    const precioCompra = parseFloat(data.precio_compra);
    const precioVenta = parseFloat(data.precio_venta);
    
    if (precioCompra >= precioVenta) {
      throw new Error("El precio de compra debe ser menor al precio de venta");
    }
    
    console.log("🚀 Insertando producto. tipoComprobante actual:", tipoComprobante);
    if (accion === "Editar") {
      const primaryBarcode = (barcodes && barcodes.length > 0) ? barcodes[0] : (randomCodebarras ? randomCodebarras : codigogenerado);
      const p = {
      _id: dataSelect.id,
      _nombre: ConvertirMinusculas(data.nombre),
      _precio_venta: parseFloat(data.precio_venta),
      _precio_compra: parseFloat(data.precio_compra),
      idCategoria: categoriaItemSelect.id,
      _codigo_barras: primaryBarcode,
      _codigos: barcodes, // array of additional codes (frontend-only for now)
      _codigo_interno: randomCodeinterno ? randomCodeinterno : codigogenerado,
      idEmpresa: dataempresa.id,
      _sevende_por: sevendepor,
      _maneja_inventarios: stateInventarios,
      _imagen: data.imagen || null,
      tipoComprobante: tipoComprobante,
      };
      console.log("📦 Payload EDITAR:", p);
      await editarProductos(p);

      // Si se seleccionó un archivo, subir y persistir usando el endpoint
      if (selectedFile) {
        try {
          await uploadImageForProduct(dataSelect.id);
        } catch (e) {
          console.error('Error subiendo imagen en EDITAR:', e);
        }
      }

      if (stateInventarios) {
        if (!dataStockXAlmacenYProducto) {
          const pStock = {
            id_almacen: almacenSelectItem?.id,
            id_producto: dataSelect?.id,
            stock: parseFloat(data.stock),
            stock_minimo: parseFloat(data.stock_minimo),
            ubicacion: data.ubicacion,
          };
          await insertarStock(pStock);
        }
      }
      // Guardar multiprecios para producto EDITADO
      console.log('🎯 Llamando a guardarMultiprecios con ID:', dataSelect.id);
      await guardarMultiprecios(dataSelect.id);
      // Guardar códigos de barras (sincronizar) para producto EDITADO
      try {
        console.log('🎯 Llamando a guardarCodigos con ID:', dataSelect.id, 'codigos:', barcodes);
        await guardarCodigos(dataSelect.id);
      } catch (e) {
        console.error('Error guardando codigos tras editar producto:', e);
      }
    } else {
      const primaryBarcode = (barcodes && barcodes.length > 0) ? barcodes[0] : (randomCodebarras ? randomCodebarras : codigogenerado);
      const p = {
      _nombre: ConvertirMinusculas(data.nombre),
      _precio_venta: parseFloat(data.precio_venta),
      _precio_compra: parseFloat(data.precio_compra),
      idCategoria: categoriaItemSelect.id,
      _codigo_barras: primaryBarcode,
      _codigos: barcodes,
      _codigo_interno: randomCodeinterno ? randomCodeinterno : codigogenerado,
      idEmpresa: dataempresa.id,
      _sevende_por: sevendepor,
      _maneja_inventarios: stateInventarios,
      _maneja_multiprecios: false,
      _imagen: data.imagen || null,
      tipoComprobante: tipoComprobante,
      };
      console.log("📦 Payload CREAR:", p);

      const id_producto_nuevo = await insertarProductos(p);

      // Si se seleccionó archivo antes de crear, subirlo ahora y se guardará automaticamente en BD
      if (selectedFile) {
        try {
          await uploadImageForProduct(id_producto_nuevo);
        } catch (e) {
          console.error('Error subiendo imagen para producto nuevo:', e);
        }
      }

      if (stateInventarios) {
        const pStock = {
          id_almacen: almacenSelectItem?.id,
          id_producto: id_producto_nuevo,
          stock: parseFloat(data.stock),
          stock_minimo: parseFloat(data.stock_minimo),
          ubicacion: data.ubicacion,
        };

        await insertarStock(pStock);
      }
      // Guardar multiprecios para producto NUEVO
      console.log('🎯 Llamando a guardarMultiprecios con ID:', id_producto_nuevo);
      await guardarMultiprecios(id_producto_nuevo);
      // Guardar códigos de barras para producto NUEVO (sincronizar)
      try {
        console.log('🎯 Llamando a guardarCodigos con ID:', id_producto_nuevo, 'codigos:', barcodes);
        await guardarCodigos(id_producto_nuevo);
      } catch (e) {
        console.error('Error guardando codigos tras crear producto:', e);
      }
    }
    
    if (buscador && buscador.trim() !== "") {
      await buscarProductos({ id_empresa: parametros.id_empresa, buscador });
    } else {
      await mostrarProductos(parametros);
    }
  }

  // Función para recibir cambios de TablaMultiprecios
  const handleMultipreciosChange = (nuevosMultiprecios, eliminados = []) => {
    setMultiprecios(nuevosMultiprecios);
    setMultipreciosEliminados(eliminados);
  };

  // Barcodes handlers
  const handleBarcodeChange = (index, value) => {
    setBarcodes((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const addBarcode = () => {
    const trimmed = (barcodeInput || '').toString().trim();
    if (!trimmed) {
      toast.error('Ingrese un código válido');
      return;
    }
    // Evitar duplicados
    if (barcodes.includes(trimmed)) {
      toast.error('Código ya agregado');
      return;
    }
    setBarcodes((prev) => [...prev, trimmed]);
    setBarcodeInput('');
    setShowBarcodeForm(false);
    toast.success('Código agregado');
  };

  const removeBarcode = (index) => {
    setBarcodes((prev) => prev.filter((_, i) => i !== index));
    toast.success('Código eliminado');
  };

  // Inicializar códigos cuando se edita un producto
  useEffect(() => {
    if (accion === "Editar" && dataSelect) {
      try {
        if (Array.isArray(dataSelect.codigos) && dataSelect.codigos.length > 0) {
          // estructura [{ id, codigoBarras }] o similar
          setBarcodes(dataSelect.codigos.map((c) => c.codigoBarras || c._codigo_barras || c));
        } else if (Array.isArray(dataSelect._codigos) && dataSelect._codigos.length > 0) {
          setBarcodes(dataSelect._codigos.map((c) => (typeof c === 'string' ? c : c.codigoBarras || c)));
        } else if (dataSelect.codigoBarras) {
          setBarcodes([String(dataSelect.codigoBarras)]);
        } else if (dataSelect._codigo_barras) {
          setBarcodes([String(dataSelect._codigo_barras)]);
        }
      } catch (e) {
        console.error('Error inicializando códigos desde dataSelect:', e);
      }
    }
  }, [accion, dataSelect]);

  // Función para guardar multiprecios
  const guardarMultiprecios = async (productoId) => {
    console.log('🔍 guardarMultiprecios llamado con productoId:', productoId);
    console.log('🔍 multiprecios array:', multiprecios);
    console.log('🔍 eliminados array:', multipreciosEliminados);
    
    if (!multiprecios || multiprecios.length === 0) {
      console.log('⚠️ No hay multiprecios para guardar');
    }

    try {
      // 1. Primero eliminar los multiprecios marcados para eliminación
      for (const mpEliminado of multipreciosEliminados) {
        if (mpEliminado.id && !mpEliminado.isNew) {
          console.log('🗑️ DELETE multiprecio ID:', mpEliminado.id);
          const response = await fetch(`http://localhost:8081/api/multiprecios/eliminar/${mpEliminado.id}`, {
            method: 'DELETE',
          });
          console.log('📥 DELETE response status:', response.status);
          if (!response.ok) {
            throw new Error('Error eliminando multiprecio');
          }
          console.log('✅ Multiprecio eliminado de BD:', mpEliminado.id);
        }
      }

      // 2. Luego procesar crear/actualizar
      for (const mp of multiprecios) {
        console.log('🔍 Procesando multiprecio:', mp);
        
        // Si es un multiprecio nuevo (creado en el form)
        if (mp.isNew) {
          const payload = {
            idProducto: productoId,
            cantidad: mp.cantidad,
            nombreReferencial: mp.nombreReferencial,
            precioVenta: mp.precioVenta,
          };
          console.log('📤 POST payload:', payload);
          const response = await fetch('http://localhost:8081/api/multiprecios/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          console.log('📥 POST response status:', response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error('Error guardando multiprecio');
          }
          const result = await response.json();
          console.log('✅ Multiprecio guardado:', result);
        } else if (!mp.isNew && mp.id) {
          // Si tiene ID real (ya existe en BD)
          const payload = {
            cantidad: mp.cantidad,
            nombreReferencial: mp.nombreReferencial,
            precioVenta: mp.precioVenta,
          };
          console.log('📤 PUT payload:', payload, 'ID:', mp.id);
      
      // 3. Limpiar array de eliminados después de procesar
      setMultipreciosEliminados([]);
          const response = await fetch(`http://localhost:8081/api/multiprecios/actualizar/${mp.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          console.log('📥 PUT response status:', response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error('Error actualizando multiprecio');
          }
          const result = await response.json();
          console.log('✅ Multiprecio actualizado:', result);
        }
      }
      console.log('✅ Todos los multiprecios procesados correctamente');
    } catch (error) {
      console.error('❌ Error en guardarMultiprecios:', error);
      toast.error('Error al guardar opciones de venta');
      // No frenamos el guardado si falla multiprecio, pero lo logueamos
    }
  }

  // Función para sincronizar códigos de barras (similar a guardarMultiprecios)
  const guardarCodigos = async (productoId) => {
   console.log('🔍 guardarCodigos llamado con productoId:', productoId);
   console.log('🔍 barcodes array:', barcodes);

   try {
     const payload = barcodes || [];
     const response = await fetch(`http://localhost:8081/api/productos/${productoId}/codigos/sync`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload),
     });
     console.log('📥 guardarCodigos response status:', response.status);
     if (!response.ok) {
       const text = await response.text();
       console.error('❌ Error guardando codigos:', text);
       throw new Error('Error guardando códigos');
     }
     console.log('✅ Códigos sincronizados correctamente para producto', productoId);
   } catch (error) {
     console.error('❌ Error en guardarCodigos:', error);
     toast.error('Error al guardar códigos de barras');
   }
  };
 
  //#region validar check inventarios
  function checkUseInventarios() {
    if (accion === "Editar") {
      if (dataalmacen) {
        if (stateInventarios) {
          Swal.fire({
            title: "¿Estás seguro(a)?",
            text: "Si desactiva esta opción se eliminara el stock!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminar",
          }).then(async (result) => {
            if (result.isConfirmed) {
              setStateInventarios(false);
              await eliminarAlmacen({ id: dataalmacen.id });
            }
          });
        } else {
          setStateInventarios(true);
        }
      } else {
        setStateInventarios(!stateInventarios);
      }
    } else {
      setStateInventarios(!stateInventarios);
    }
  }
  //#endregion
  //#region validar vacios
  function validarVacios(data) {
    if (!randomCodeinterno) {
      generarCodigoInterno();
    }
    if (!randomCodebarras) {
      generarCodigoBarras();
    }
    if (data.precio_venta.trim() === "") {
      data.precio_venta = 0;
    }
    if (data.precio_compra.trim() === "") {
      data.precio_compra = 0;
    }
    if (stateInventarios) {
      if (!dataalmacen) {
        if (data.stock.trim() === "") {
          data.stock = 0;
        }
        if (data.stock_minimo.trim() === "") {
          data.stock_minimo = 0;
        }
      }
    }
  }
  //#endregion
  //#region generar codigo automatico
  const [randomCodeinterno, setRandomCodeinterno] = useState("");
  const [randomCodebarras, setRandomCodebarras] = useState("");
  function generarCodigoBarras() {
    generarCodigo();
    if (showBarcodeForm) {
      setBarcodeInput(codigogenerado);
    } else {
      setRandomCodebarras(codigogenerado);
    }
  }
  function generarCodigoInterno() {
    generarCodigo();
    setRandomCodeinterno(codigogenerado);
  }
  const handleChangeinterno = (event) => {
    setRandomCodeinterno(event.target.value);
  };
  const handleChangebarras = (event) => {
    setRandomCodebarras(event.target.value);
  };
  //#endregion

  //#region validar_accion

  useEffect(() => {
    if (accion != "Editar") {
      generarCodigoInterno();
    } else {
      selectCategoria({
        id:dataSelect.categoria?.id,
        nombre:dataSelect.categoria?.nombre
      })
      setRandomCodeinterno(dataSelect.codigoInterno);
      setRandomCodebarras(dataSelect.codigoBarras);
      // Poner valor inicial del campo imagen en el formulario
      try { 
        setValue("imagen", dataSelect.imagen || ""); 
        // Si SKU/producto ya tiene la versión base64, úsala para preview y guárdala en el form
        try { setValue("imagen_base64", dataSelect.imagenBase64 || ""); } catch(e) {}
        try { setImagePreview(dataSelect.imagenBase64 ?? dataSelect.imagen ?? ""); } catch(e) {}
      } catch(e) {}
      // Normalizar y comprobar de forma segura el valor de seVendePor
      const sellBy = (dataSelect?.seVendePor || "").toString().toUpperCase();
      if (sellBy === "UNIDAD") {
        handleCheckboxChange(1);
      } else if (sellBy === "GRANEL") {
        // usar 2 para mantener coherencia con el resto del código
        handleCheckboxChange(2);
      } else {
        // valor desconocido -> mantener el valor guardado (por defecto UNIDAD)
        handleCheckboxChange(1);
      }
      dataSelect.tipoComprobante === "FACTURADO"
        ? handleTipoComprobanteChange(1)
        : handleTipoComprobanteChange(2);
      dataSelect.manejaInventarios
        ? setStateInventarios(true)
        : setStateInventarios(false);
      dataSelect.manejaInventarios
        ? setStateEnabledStock(true)
        : setStateEnabledStock(false);
    }
  }, []);
  //#endregion validar_accion

  // Cargar datos de stock cuando se edita y se obtiene la información del almacén
  useEffect(() => {
    if (accion === "Editar" && dataStockXAlmacenYProducto) {
      setStock(dataStockXAlmacenYProducto.stock || "");
      setStockMinimo(dataStockXAlmacenYProducto.stock_minimo || "");
      setUbicacion(dataStockXAlmacenYProducto.ubicacion || "");
      setValue("stock",dataStockXAlmacenYProducto.stock);
      setValue("stock_minimo",dataStockXAlmacenYProducto.stock_minimo);
      setValue("ubicacion",dataStockXAlmacenYProducto.ubicacion);
    }
  }, [dataStockXAlmacenYProducto, accion]);

  // barcode scanner: populate codigo de barras when Enter is pressed (allow in inputs)
  useBarcodeScanner((code) => {
    try {
      setRandomCodebarras(String(code));
    } catch (err) {
      console.error('barcode to codigo_barras error', err);
    }
  }, { allowInInputs: true });

  return (
    <Container>
      {isPending ? (
        <span>...🔼</span>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar"
                  ? "Editar productos"
                  : "REGISTRAR NUEVO PRODUCTO"}
              </h1>
            </section>

            <section>
              <CloseButton
                type="button"
                aria-label="Cerrar"
                title="Cerrar"
                onClick={async () => {
                  if (buscador && buscador.trim() !== "") {
                    await buscarProductos({ id_empresa: parametros.id_empresa, buscador });
                  } else {
                    refetchs();
                  }
                  onClose();
                }}
              >
                x
              </CloseButton>
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="seccion1">
              <FormGroup>
                <Label>
                  Nombre <span className="required">*</span>
                </Label>
                <Input
                  defaultValue={dataSelect.nombre}
                  type="text"
                  placeholder="Ej: Coca Cola 500ml"
                  {...register("nombre", {
                    required: true,
                  })}
                />
                {errors.nombre?.type === "required" && (
                  <InputError>Campo requerido</InputError>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Precio venta</Label>
                <Input
                  step="0.01"
                  defaultValue={dataSelect.precioVenta}
                  type="number"
                  placeholder="Ej: 10.00"
                  {...register("precio_venta")}
                />
              </FormGroup>

              <FormGroup>
                <Label>Precio compra</Label>
                <Input
                  step="0.01"
                  defaultValue={dataSelect.precioCompra}
                  type="number"
                  placeholder="Ej: 8.50"
                  {...register("precio_compra")}
                />
              </FormGroup>

              <FormGroup>
                <Label>Codigo de barras</Label>
                <BarcodeContainer>
                  {barcodes.length === 0 && <MessageEmpty>📋 Sin códigos aún</MessageEmpty>}

                  {barcodes.map((code, idx) => (
                    <BarcodeRow key={idx}>
                      <Input
                        value={code}
                        onChange={(e) => handleBarcodeChange(idx, e.target.value)}
                        type="text"
                        placeholder="Ej: 7751234567890"
                      />
                      <SmallButton type="button" onClick={() => removeBarcode(idx)}>
                        Eliminar
                      </SmallButton>
                    </BarcodeRow>
                  ))}

                  {!showBarcodeForm && (
                    <AddButtonFullWidth type="button" onClick={() => setShowBarcodeForm(true)}>
                      Agregar código de barras
                    </AddButtonFullWidth>
                  )}

                  {showBarcodeForm && (
                                      <BarcodeForm>
                      <div className="form-row">
                        <div className="form-group">
                          <Label>Nuevo código</Label>
                          <Input
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            type="text"
                            placeholder="Ej: 7751234567890"
                          />
                        </div>

                        <div className="form-buttons">
                          <button
                            type="button"
                            onClick={addBarcode}
                            className="btn-guardar"
                          >
                            Agregar
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowBarcodeForm(false); setBarcodeInput(''); }}
                            className="btn-cancelar"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                                      </BarcodeForm>
                  )}
                </BarcodeContainer>
              </FormGroup>

              <FormGroup>
                <Label>Codigo interno</Label>
                <InputWithAction>
                  <Input
                    value={randomCodeinterno}
                    onChange={handleChangeinterno}
                    type="number"
                    placeholder="Ej: 580568333369"
                  />
                  <GenerateButtonWrap>
                    <Btngenerarcodigo
                      titulo="Generar"
                      funcion={generarCodigoInterno}
                    />
                  </GenerateButtonWrap>
                </InputWithAction>
              </FormGroup>

              <FormGroup>
                <Label>Imagen (URL)</Label>
                <Input
                  defaultValue={dataSelect?.imagen || ""}
                  type="text"
                  placeholder="http://... o /uploads/products/archivo.jpg"
                  {...register("imagen")}
                />
              </FormGroup>

              <FormGroup>
                <Label>Seleccionar imagen desde tu equipo</Label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 360 }}>
                    <ImageSelector
                      fileUrl={imagePreview}
                      compact={true}
                      onFileSelected={(file, dataUrl) => { setSelectedFile(file); try { setImagePreview(dataUrl); } catch(e) {} }}
                      onRemove={() => { setSelectedFile(null); try { setImagePreview(''); } catch(e) {} }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 6 }}>
                    <Btngenerarcodigo
                      titulo={uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                      funcion={async () => {
                        if (uploadingImage || !selectedFile) return;
                        try {
                          if (accion === "Editar") {
                            await uploadImageForProduct(dataSelect.id);
                          } else {
                            toast('Guarda el producto primero y luego sube la imagen', { duration: 4000 });
                          }
                        } catch (e) { console.error('Error en subir imagen desde selector:', e); }
                      }}
                      $width="140px"
                      disabled={uploadingImage || !selectedFile}
                    />
                  </div>

                </div>
              </FormGroup>
 
              <TablaMultiprecios
                productoId={accion === "Editar" ? dataSelect.id : null}
                accion={accion}
                onMultipreciosChange={handleMultipreciosChange}
              />
            </section>

            <section className="seccion2">
              <DualConfigBoxes>
                <ConfigBox>
                  <ConfigBoxTitle>Se vende por:</ConfigBoxTitle>
                  <ConfigBoxOptions>
                    <InlineOption className="alignBetween">
                      <span>UNIDAD</span>
                      <Checkbox1
                        checkedColor="#111111"
                        isChecked={isChecked1}
                        onChange={() => handleCheckboxChange(1)}
                      />
                    </InlineOption>
                    <InlineOption className="alignBetween">
                      <span>GRANEL (decimales)</span>
                      <Checkbox1
                        checkedColor="#111111"
                        isChecked={isChecked2}
                        onChange={() => handleCheckboxChange(2)}
                      />
                    </InlineOption>
                  </ConfigBoxOptions>
                </ConfigBox>

                <ConfigBox>
                  <ConfigBoxTitle>Tipo de comprobante:</ConfigBoxTitle>
                  <ConfigBoxOptions>
                    <InlineOption className="alignBetween">
                      <span>FACTURADO</span>
                      <Checkbox1
                        checkedColor="#111111"
                        isChecked={isCheckedFacturado}
                        onChange={() => handleTipoComprobanteChange(1)}
                      />
                    </InlineOption>
                    <InlineOption className="alignBetween">
                      <span>MANUALIDAD</span>
                      <Checkbox1
                        checkedColor="#111111"
                        isChecked={isCheckedManualidad}
                        onChange={() => handleTipoComprobanteChange(2)}
                      />
                    </InlineOption>
                  </ConfigBoxOptions>
                </ConfigBox>
              </DualConfigBoxes>

              <ConfigRow>
                <ConfigLabel>Categoria:</ConfigLabel>
                <ConfigControl>
                  <SelectWrap>
                    <SelectList
                      appearance="product"
                      data={datacategorias}
                      itemSelect={categoriaItemSelect}
                      onSelect={selectCategoria}
                      displayField="nombre"
                    />
                  </SelectWrap>
                </ConfigControl>
              </ConfigRow>

              <ConfigRow>
                <ConfigLabel>Controlar stock:</ConfigLabel>
                <ConfigControl>
                  <ToggleSwitchBtn
                    type="button"
                    className={stateInventarios ? "isOn" : "isOff"}
                    onClick={checkUseInventarios}
                    aria-pressed={stateInventarios}
                  >
                    <span className="switchKnob" />
                  </ToggleSwitchBtn>
                </ConfigControl>
              </ConfigRow>

              {stateInventarios && (
                <ContainerStock>
                  <ConfigRow>
                    <ConfigLabel>Sucursal:</ConfigLabel>
                    <ConfigControl>
                      <SelectWrap>
                        <SelectList
                          appearance="product"
                          data={dataSucursales}
                          itemSelect={sucursalesItemSelect}
                          onSelect={selectSucursal}
                          displayField="nombre"
                        />
                      </SelectWrap>
                    </ConfigControl>
                  </ConfigRow>

                  <ConfigRow>
                    <ConfigLabel>Almacen:</ConfigLabel>
                    <ConfigControl>
                      <SelectWrap>
                        <SelectList
                          appearance="product"
                          data={dataAlmacenes}
                          itemSelect={almacenSelectItem}
                          onSelect={setAlmacenSelectItem}
                          displayField="nombre"
                        />
                      </SelectWrap>
                    </ConfigControl>
                  </ConfigRow>

                  {stateEnabledStock && dataStockXAlmacenYProducto && (
                    <ContainerMensajeStock>
                      <span>Para editar el stock vaya al modulo de kardex</span>
                    </ContainerMensajeStock>
                  )}

                  <FormGroup>
                    <Label>Stock</Label>
                    <Input
                      disabled={!!dataStockXAlmacenYProducto}
                      defaultValue={dataStockXAlmacenYProducto?.stock || stock}
                      step="0.01"
                      type="number"
                      placeholder="Ej: 10"
                      {...register("stock")}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Stock minimo</Label>
                    <Input
                      disabled={!!dataStockXAlmacenYProducto}
                      defaultValue={
                        dataStockXAlmacenYProducto?.stock_minimo || stockMinimo
                      }
                      step="0.01"
                      type="number"
                      placeholder="Ej: 2"
                      {...register("stock_minimo")}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Ubicacion</Label>
                    <Input
                      disabled={!!dataStockXAlmacenYProducto}
                      defaultValue={dataStockXAlmacenYProducto?.ubicacion || ubicacion}
                      type="text"
                      placeholder="Ej: Estante A-3"
                      {...register("ubicacion")}
                    />
                  </FormGroup>
                </ContainerStock>
              )}

              <BtnGuardarContainer>
                <PrimaryButton type="submit">Guardar</PrimaryButton>
              </BtnGuardarContainer>
            </section>
          </form>
        </div>
      )}
    </Container>
  );
}
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(10, 9, 9, 0.5);
  backdrop-filter: blur(2px);
  padding: 16px;

  .sub-contenedor {
    position: relative;
    background: #ffffff;
    box-shadow:
      0px 0px 3px rgba(0, 0, 0, 0.084),
      0px 2px 3px rgba(0, 0, 0, 0.168);
    padding: 26px 22px;
    width: 100%;
    max-width: 1320px;
    max-height: calc(100vh - 40px);
    overflow: auto;
    border-radius: 12px;
    box-sizing: border-box;

    .headers {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 18px;
      position: relative;

      h1 {
        font-size: clamp(2rem, 4vw, 3.2rem);
        font-weight: 600;
        text-transform: capitalize;
        color: #212121;
        margin: 0;
        letter-spacing: -0.3px;
      }

      section:last-child {
        position: absolute;
        right: 0;
        top: 0;
      }
    }

    .formulario {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 18px;

      @media (max-width: 1180px) {
        grid-template-columns: 1fr;
      }

      .seccion1,
      .seccion2 {
        min-width: 0;
        gap: 12px;
        display: flex;
        flex-direction: column;
      }

      .seccion1 > *,
      .seccion2 > * {
        min-width: 0;
      }
    }
  }
`;

const CloseButton = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 20px;
  line-height: 1;

  &:hover {
    background: #f3f4f6;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 2px;
  min-width: 0;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 2px;
  color: #212121;
  font-weight: 600;
  font-size: 14px;

  .required {
    color: #e74c3c;
    margin-left: 3px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
  color: #212121;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: #1778f2;
  }

  &:disabled {
    background: #f5f7fb;
  }
`;

const InputError = styled.p`
  color: #e11d48;
  font-size: 12px;
  margin: 0;
  font-weight: 600;
`;

const InputWithAction = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const GenerateButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 640px) {
    justify-content: flex-start;
  }
`;

const ConfigRow = styled.div`
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  margin-bottom: 4px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const ConfigLabel = styled.label`
  color: #212121;
  font-weight: 600;
  font-size: 14px;
`;

const ConfigControl = styled.div`
  min-width: 0;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
`;

const DualConfigBoxes = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const ConfigBox = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  background: transparent;
  min-width: 0;
`;

const ConfigBoxTitle = styled.label`
  color: #212121;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
  display: block;
`;

const ConfigBoxOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InlineOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #444;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;

  &.alignBetween {
    width: 100%;
    justify-content: space-between;
  }
`;

const SelectWrap = styled.div`
  min-width: 240px;
  max-width: 100%;
  width: 100%;

  [data-appearance="product"] button {
    min-height: 46px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 16px;
  }

  [data-appearance="product"] > div:nth-child(2) {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
  }

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
  }
`;

// Styled components para códigos de barras (múltiples)
const BarcodeContainer = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px;
  background: #f8fafc;
  margin-bottom: 8px;
`;

const BarcodeRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;

  input {
    flex: 1;
    min-height: 40px;
  }
`;

const SmallButton = styled.button`
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #c7ccd4;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #111827;

  &:hover {
    background: #f3f4f6;
  }
`;

const BarcodeForm = styled.div`
  background: #e8eaee;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 16px;
  margin-top: 8px;

  .form-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 12px;
    margin-bottom: 12px;

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
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  background: #ffffff;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
`;

const AddButtonFullWidth = styled.button`
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

const ToggleSwitchBtn = styled.button`
  display: inline-flex;
  align-items: center;
  position: relative;
  width: 50px;
  height: 30px;
  border-radius: 20px;
  cursor: pointer;
  transition-duration: 0.2s;
  border: 1px solid #d1d5db;
  padding: 0;

  .switchKnob {
    position: absolute;
    height: 10px;
    width: 10px;
    left: 5px;
    background-color: transparent;
    border-radius: 50%;
    transition-duration: 0.2s;
    box-shadow: 5px 2px 7px rgba(8, 8, 8, 0.26);
    border: 5px solid #ffffff;
  }

  &.isOn {
    background-color: #111111;
  }

  &.isOff {
    background-color: #ffffff;
  }

  &.isOff .switchKnob {
    border-color: #111111;
    box-shadow: 5px 2px 7px rgba(8, 8, 8, 0.2);
  }

  &.isOn .switchKnob {
    transform: translateX(20px);
    background-color: #ffffff;
    border-color: #ffffff;
  }
`;

const ContainerStock = styled.div`
  border: 1px solid #d1d5db;
  display: flex;
  border-radius: 12px;
  padding: 16px;
  gap: 12px;
  flex-direction: column;
  background-color: #f1f2f4;
  min-width: 0;
`;

const ContainerMensajeStock = styled.div`
  text-align: center;
  color: #f9184c;
  background-color: rgba(249, 24, 61, 0.2);
  border-radius: 10px;
  padding: 5px;
  margin: 8px 0 10px 0;
  font-weight: 600;
`;

const BtnGuardarContainer = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: none;
  width: 100%;
  padding: 12px 16px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #212121;
  color: #ffffff;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);

  &:hover:not(:disabled) {
    color: #212121;
  }

  &::after {
    content: "";
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

  &:hover::after {
    transform: skewX(-45deg) scale(1, 1);
  }
`;

const LoadingContent = styled.span`
  color: #fff;
  font-size: 1rem;
`;
