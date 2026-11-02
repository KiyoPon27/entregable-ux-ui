# Descuento en la pantalla de cobro

Este documento explica la lógica del descuento que se usa al cobrar en el POS, incluyendo la parte funcional y los fragmentos de código que sostienen el comportamiento actual.

## Objetivo

La mecánica de descuento permite aplicar un porcentaje sobre el total de la venta antes de confirmar el cobro. La idea no es solo calcular el monto rebajado, sino también conservar las preferencias del cajero para que la experiencia sea consistente entre ventas.

En esta versión se corrigieron dos molestias que ya existían en una implementación anterior:

1. El porcentaje de descuento no se pierde cuando se usa en la última venta, sino que queda guardado para la siguiente.
2. Si el botón o switch de descuento se apaga, ese estado también se conserva para la próxima venta, en vez de volver a encenderse automáticamente.

## Lógica general

La lógica se divide en tres partes:

1. Guardar preferencias del descuento en el navegador.
2. Recuperar esas preferencias al abrir o reiniciar la venta.
3. Calcular el total con descuento solo cuando el switch está activo y el porcentaje es mayor a cero.

El cálculo parte del total real de la venta. Si el descuento está activo, se obtiene el monto descontado con una regla simple: total multiplicado por porcentaje dividido entre 100. Después, ese monto se resta al total para mostrar el precio final a cobrar.

## Persistencia del estado

El sistema usa almacenamiento local para recordar dos datos:

1. Si el descuento estaba activado o desactivado.
2. Qué porcentaje se había dejado cargado.

Eso hace que, aunque se cierre la pantalla de cobro o se pase a otra venta, el sistema recupere la última configuración del usuario.

### Fragmento del store

```jsx
const DESCUENTO_STORAGE_KEY = "ventas-descuento-preferencias";

const getDescuentoPreferencias = () => {
	const defaults = {
		stateDescuentoActivo: true,
		porcentajeDescuento: 10,
	};

	if (typeof window === "undefined") {
		return defaults;
	}

	try {
		const raw = window.localStorage.getItem(DESCUENTO_STORAGE_KEY);
		if (!raw) {
			return defaults;
		}

		const parsed = JSON.parse(raw);
		return {
			stateDescuentoActivo:
				typeof parsed.stateDescuentoActivo === "boolean"
					? parsed.stateDescuentoActivo
					: defaults.stateDescuentoActivo,
			porcentajeDescuento:
				Number.isFinite(Number(parsed.porcentajeDescuento)) &&
				Number(parsed.porcentajeDescuento) >= 0
					? Number(parsed.porcentajeDescuento)
					: defaults.porcentajeDescuento,
		};
	} catch {
		return defaults;
	}
};
```

Este bloque hace dos cosas importantes:

1. Define valores por defecto para no romper la venta si no existe nada guardado.
2. Lee la última preferencia válida desde localStorage antes de iniciar el estado.

### Estado inicial de la venta

```jsx
const getInitialState = () => {
	const descuento = getDescuentoPreferencias();

	return {
		items: [],
		total: 0,
		statePantallaCobro: false,
		tipocobro: "",
		stateMetodosPago: false,
		idventa: 0,
		porcentajeDescuento: descuento.porcentajeDescuento,
		montoDescuento: 0,
		stateDescuentoActivo: descuento.stateDescuentoActivo,
	};
};
```

Aquí se nota el comportamiento que se quería corregir: al iniciar una nueva venta no se “reinicia” el descuento a mano, sino que se toma lo último guardado.

## Cálculo del descuento

El monto se calcula en el store para que la pantalla solo consuma el resultado y no tenga que repetir lógica.

### Fragmento del cálculo

```jsx
setDescuento: (porcentaje, totalReal = null) => {
	set((state) => {
		const porcentajeValido = Math.max(0, Math.min(100, parseFloat(porcentaje) || 0));
		const subtotal = totalReal !== null ? totalReal : state.total;
		const montoDescuentoCalculado = subtotal * (porcentajeValido / 100);

		return {
			porcentajeDescuento: porcentajeValido,
			montoDescuento: redondearADecimal(montoDescuentoCalculado),
		};
	});

	const estadoActual = get();
	persistDescuentoPreferencias({
		stateDescuentoActivo: estadoActual.stateDescuentoActivo,
		porcentajeDescuento: Math.max(0, Math.min(100, parseFloat(porcentaje) || 0)),
	});
},
```

La regla es directa:

1. El porcentaje siempre se valida entre 0 y 100.
2. El cálculo usa el total real recibido desde la venta.
3. Al guardar el porcentaje, también se conserva el estado actual del switch.

## Activar o desactivar descuento

El estado del switch también se persiste, que es justamente una de las correcciones importantes de esta versión.

### Fragmento del switch

```jsx
setStateDescuentoActivo: () => {
	set((state) => {
		const nuevoEstado = !state.stateDescuentoActivo;
		persistDescuentoPreferencias({
			stateDescuentoActivo: nuevoEstado,
			porcentajeDescuento: state.porcentajeDescuento,
		});

		return {
			stateDescuentoActivo: nuevoEstado,
		};
	});
},
```

Con esto, si el usuario apaga el descuento durante una venta, el sistema recuerda ese apagado y no lo vuelve a activar en la siguiente operación.

## Aplicación en la pantalla de cobro

En el componente de cobro se usa el estado persistido para recalcular el precio a cobrar cada vez que cambia el total, el porcentaje o el switch.

### Fragmento de la UI

```jsx
{stateDescuentoActivo && (
	<article className="descuento-input">
		<InputText textalign="center">
			<input
				onChange={(e) => setDescuento(parseFloat(e.target.value) || 0, total)}
				value={porcentajeDescuento}
				className="form__field"
				type="number"
				min="0"
				max="100"
				step="0.5"
			/>
			<label className="form__label">Porcentaje (%)</label>
		</InputText>
	</article>
)}
```

Si el descuento está apagado, el campo desaparece. Si está prendido, el porcentaje se muestra y se puede editar normalmente.

### Recalculo del total

```jsx
useEffect(() => {
	const tipoCobroLower = (tipocobro || "").toLowerCase();
	const aplicarDescuento = stateDescuentoActivo && total > 0 && porcentajeDescuento > 0;
	const montoDescuentoCalculado = aplicarDescuento
		? redondearADecimal(total * (porcentajeDescuento / 100))
		: 0;
	const precioActualizado = aplicarDescuento
		? redondearADecimal(total - montoDescuentoCalculado)
		: redondearADecimal(total);

	setPrecioVenta(precioActualizado);

	if (tipoCobroLower !== "mixto" && tipocobro) {
		setValoresPago({
			[tipocobro]: precioActualizado,
		});
	}
}, [total, porcentajeDescuento, stateDescuentoActivo, tipocobro]);
```

Este efecto es el que mantiene sincronizada la pantalla con la lógica real del descuento.

## Qué se guarda al confirmar la venta

Cuando se confirma la venta, se envían tanto el subtotal como el total con descuento, además de los campos propios del descuento.

```jsx
const pventas = {
	_id_venta: idventa,
	idUsuario: datausuarios?.id,
	_vuelto: vuelto,
	_id_tipo_comprobante: itemComprobanteSelect?.tipoComprobante?.id,
	_serie: itemComprobanteSelect?.serie,
	idSucursal: dataCierreCaja?.caja?.id_sucursal,
	_id_cliente: cliproItemSelect?.id || null,
	_fecha: fechaActual,
	_sub_total: total,
	_monto_total: precioVenta,
	pagoCon: montoEfectivo,
	porcentajeDescuento: porcentajeDescuento || 0,
	montoDescuento: montoDescuento || 0,
};
```

Con esto queda guardado en la venta:

1. El subtotal original.
2. El total final ya rebajado.
3. El porcentaje aplicado.
4. El monto exacto descontado.

## Resumen funcional

En la práctica, el flujo queda así:

1. La pantalla recupera la última configuración del descuento al abrirse.
2. El usuario puede prender o apagar el descuento desde un switch.
3. El porcentaje queda cargado entre ventas, incluso si fue la última operación del día.
4. Si el switch se apaga, queda apagado para la siguiente venta.
5. Al cobrar, el sistema calcula subtotal, descuento y total final con base en el estado actual.

Esto evita el comportamiento anterior donde el sistema volvía a activar el descuento automáticamente y obligaba al cajero a corregirlo en cada venta.
