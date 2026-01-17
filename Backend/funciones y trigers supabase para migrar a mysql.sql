    ------------------------------------------------------------------------------
    ------------------------------------------------------------------------------
    -- FUNCIONES: --
    ------------------------------------------------------------------------------
    ------------------------------------------------------------------------------

    ------------------------------------------------------------------------------
    -- asignarclientegenerico: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.asignarclientegenerico() RETURNS trigger
        LANGUAGE plpgsql
        AS $$declare _id_cliente int;
    begin
    --seleccionamos el id del cliente generico
    select id into _id_cliente from clientes_proveedores where id_empresa = new.id_empresa and tipo='-';
    -- editamos el cliente generico
    update ventas
    set id_cliente = _id_cliente  where id_cliente is null and id_empresa=new.id_empresa;
    return new;
    end$$;

    ALTER FUNCTION public.asignarclientegenerico() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- buscarproductos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.buscarproductos(_id_empresa integer, buscador text) RETURNS TABLE(id integer, nombre text, precio_venta numeric, precio_compra numeric, id_categoria integer, sevende_por text, codigo_barras text, codigo_interno text, id_empresa integer, maneja_inventarios boolean, maneja_multiprecios boolean, p_venta text, p_compra text, categoria text)
        LANGUAGE sql
        AS $$
    select p.id,
    p.nombre,p.precio_venta,p.precio_compra,p.id_categoria,p.sevende_por,p.codigo_barras,p.codigo_interno,p.id_empresa,p.maneja_inventarios,p.maneja_multiprecios,concat(e.simbolo_moneda,' ', p.precio_venta) as p_venta,concat(e.simbolo_moneda,' ', p.precio_compra) as p_compra,c.nombre as categoria
    from productos as p inner join empresa as e on e.id=p.id_empresa
    inner join categorias as c on c.id=p.id_categoria
    where (LOWER(p.nombre) LIKE '%' || LOWER(buscador) || '%' 
        OR LOWER(p.codigo_barras) LIKE '%' || LOWER(buscador) || '%'
        OR LOWER(p.codigo_interno) LIKE '%' || LOWER(buscador) || '%')
        AND p.id_empresa = _id_empresa
        ORDER BY p.nombre ASC
        LIMIT 10;
    $$;

    ALTER FUNCTION public.buscarproductos(_id_empresa integer, buscador text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- buscarproductoslectora: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.buscarproductoslectora(_id_empresa integer, buscador text) RETURNS TABLE(id integer, nombre text, precio_venta numeric, precio_compra numeric, id_categoria integer, sevende_por text, codigo_barras text, codigo_interno text, id_empresa integer, maneja_inventarios boolean, maneja_multiprecios boolean, p_venta text, p_compra text, categoria text)
        LANGUAGE sql
        AS $$
    select p.id,
    p.nombre,p.precio_venta,p.precio_compra,p.id_categoria,p.sevende_por,p.codigo_barras,p.codigo_interno,p.id_empresa,p.maneja_inventarios,p.maneja_multiprecios,concat(e.simbolo_moneda,' ', p.precio_venta) as p_venta,concat(e.simbolo_moneda,' ', p.precio_compra) as p_compra,c.nombre as categoria
    from productos as p inner join empresa as e on e.id=p.id_empresa
    inner join categorias as c on c.id=p.id_categoria
    where  
        ( LOWER(p.codigo_barras) = LOWER(buscador)
        OR LOWER(p.codigo_interno) = LOWER(buscador))
        AND p.id_empresa = _id_empresa;
    $$;

    ALTER FUNCTION public.buscarproductoslectora(_id_empresa integer, buscador text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- buscarusuariosasignados: --
    ------------------------------------------------------------------------------
    CREATE or replace FUNCTION public.buscarusuariosasignados(_id_empresa integer, buscador text) RETURNS TABLE(id_asignacion integer, id_usuario integer, usuario text, sucursal text, caja text, rol text, email text, estadouser text,id_rol integer,nro_doc text, telefono text)
        LANGUAGE sql
        AS $$
    select asignacion_sucursal.id as id_asignacion,
    usuarios.id as id_usuario,
    usuarios.nombres as usuario,
    sucursales.nombre as sucursal, 
    caja.descripcion as caja,
    roles.nombre as rol , 
    usuarios.correo as email , 
    usuarios.estado as estadouser,
    roles.id as id_rol,
    nro_doc text, telefono text
    from asignacion_sucursal 
    inner join sucursales on asignacion_sucursal.id_sucursal = sucursales.id
    inner join usuarios on asignacion_sucursal.id_usuario = usuarios.id
    inner join roles on usuarios.id_rol = roles.id
    inner join caja on asignacion_sucursal.id_caja = caja.id
    where LOWER(usuarios.nombres) LIKE '%' || LOWER(buscador) || '%' and sucursales.id_empresa=_id_empresa and roles.nombre!='superadmin' ;
    $$;


    ALTER FUNCTION public.buscarusuariosasignados(_id_empresa integer, buscador text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- confirmar_venta: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.confirmar_venta(_id_venta integer, _id_usuario integer, _vuelto numeric, _id_tipo_comprobante integer, _serie character varying, _id_sucursal integer, _id_cliente integer, _fecha timestamp without time zone, _monto_total numeric) RETURNS SETOF public.ventas
        LANGUAGE plpgsql
        AS $$
    DECLARE
        nuevo_comprobante TEXT;
    BEGIN
    -- Generar número de comprobante automáticamente con el ID del tipo de comprobante
    select generar_nro_comprobante(_id_tipo_comprobante, _serie, _id_sucursal)
    INTO nuevo_comprobante;
    -- Actualizar la venta existente con el número de comprobante, cliente y estado confirmado
    UPDATE ventas
    SET 
        estado = 'confirmada',
        nro_comprobante = nuevo_comprobante,
        id_usuario = _id_usuario,
        vuelto = _vuelto,
        id_cliente = _id_cliente,
        fecha = _fecha,
        monto_total = _monto_total
        WHERE id = _id_venta;
        RETURN QUERY SELECT * FROM ventas WHERE id = _id_venta;
    END; 
    $$;

    ALTER FUNCTION public.confirmar_venta(_id_venta integer, _id_usuario integer, _vuelto numeric, _id_tipo_comprobante integer, _serie character varying, _id_sucursal integer, _id_cliente integer, _fecha timestamp without time zone, _monto_total numeric) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- contarproductosporauth: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.contarproductosporauth(_id_auth text) RETURNS integer
        LANGUAGE sql
        AS $$
    select count(p.id)
    from productos p
    inner join empresa e on e.id = p.id_empresa
    where e.id_auth = _id_auth;
    $$;


    ALTER FUNCTION public.contarproductosporauth(_id_auth text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- crearcredencialesuser: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.crearcredencialesuser(email text, pass text) RETURNS uuid
        LANGUAGE plpgsql SECURITY DEFINER
        AS $$
    declare
    user_id uuid;
    begin
    user_id := gen_random_uuid();
    insert into auth.users (
        id, 
        email, 
        encrypted_password, 
        raw_app_meta_data, 
        created_at, 
        updated_at, -- Incluye el campo updated_at
        instance_id, 
        aud, 
        role, 
        confirmation_token, 
        email_change, 
        email_change_token_new, 
        recovery_token, 
        phone_change, 
        email_confirmed_at
    )
    values (
        user_id,
        email,
        crypt(pass, gen_salt('bf')),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        now(),
        now(), -- Asigna la hora actual a updated_at
        (SELECT instance_id FROM auth.users WHERE instance_id IS NOT NULL LIMIT 1),
        'authenticated',
        'authenticated',
        '', -- confirmation_token
        '', -- email_change
        '', -- email_change_token_new
        '', -- recovery_token
        '', -- phone_change
        now()
    );
    return user_id;
    end;
    $$;


    ALTER FUNCTION public.crearcredencialesuser(email text, pass text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboardcajasporsucursalyventas: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardcajasporsucursalyventas(_id_empresa integer) RETURNS TABLE(sucursal_nombre text, caja_descripcion text, fecha_creacion timestamp without time zone, total_ventas numeric, estadocaja integer, direccionfiscal text, idcaja integer, idsucursal integer, delete boolean)
        LANGUAGE sql
        AS $$
    WITH cierres_agrupados AS (
        SELECT
            cc.id_caja,
            MAX(cc.estado) AS estado,
            SUM(COALESCE(v.monto_total, 0)) AS total_ventas
        FROM
            cierrecaja cc
        LEFT JOIN
            ventas v
        ON
            cc.id = v.id_cierre_caja
        GROUP BY
            cc.id_caja
    ),
    cajas_agrupadas AS (
        SELECT
            c.id AS id_caja,
            c.descripcion AS caja_descripcion,
            c.fecha_creacion,
            COALESCE(cg.total_ventas, 0) AS total_ventas,
            COALESCE(cg.estado, 2) AS estado
            
            
        FROM
            caja c
        LEFT JOIN
            cierres_agrupados cg
        ON
            c.id = cg.id_caja
    )
    SELECT
        s.nombre AS sucursal_nombre,
        ca.caja_descripcion,
        ca.fecha_creacion,
        ca.total_ventas,
        ca.estado AS estadocaja,
        s.direccion_fiscal as direccion_fiscal,
        ca.id_caja as idcaja,
        s.id as idsucursal,
        s.delete as delete


    FROM
        sucursales s
    INNER JOIN
        caja c
    ON
        s.id = c.id_sucursal
    LEFT JOIN
        cajas_agrupadas ca
    ON
        c.id = ca.id_caja
    WHERE
        s.id_empresa = _id_empresa
    GROUP BY
        s.nombre, ca.caja_descripcion, ca.fecha_creacion, ca.total_ventas, ca.estado,ca.id_caja,s.id,s.direccion_fiscal,s.delete
    ORDER BY
        s.nombre, ca.fecha_creacion;
    $$;


    ALTER FUNCTION public.dashboardcajasporsucursalyventas(_id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboardsumarcantidaddetalleventa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardsumarcantidaddetalleventa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS numeric
        LANGUAGE sql
        AS $$
    SELECT 
        COALESCE(SUM(dv.cantidad), 0) -- Asegura que retorne 0 si no hay ventas
    FROM 
        ventas AS v inner join detalle_venta dv on dv.id_venta=v.id
    WHERE 
        v.id_empresa = _id_empresa
    AND DATE(v.fecha) >= DATE(_fecha_inicio) -- Convierte a solo fecha
    AND DATE(v.fecha) <= DATE(_fecha_fin);   -- Convierte a solo fecha
    $$;


    ALTER FUNCTION public.dashboardsumarcantidaddetalleventa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboardsumargananciadetalleventa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardsumargananciadetalleventa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS numeric
        LANGUAGE sql
        AS $$
    SELECT 
        COALESCE(SUM(dv.total - dv.cantidad*precio_compra), 0) -- Asegura que retorne 0 si no hay ventas
    FROM 
        ventas AS v inner join detalle_venta dv on dv.id_venta=v.id
    WHERE 
        v.id_empresa = _id_empresa
    AND DATE(v.fecha) >= DATE(_fecha_inicio) -- Convierte a solo fecha
    AND DATE(v.fecha) <= DATE(_fecha_fin);   -- Convierte a solo fecha
    $$;


    ALTER FUNCTION public.dashboardsumargananciadetalleventa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    -----------------------------------------------------------------------------
    -- dashboardsumarventaporempresa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardsumarventaporempresa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS numeric
        LANGUAGE sql
        AS $$
    SELECT
        COALESCE(SUM(v.monto_total), 0) -- Asegura que siempre retorne 0 si no hay ventas
    FROM
        ventas AS v
    WHERE
        v.id_empresa = _id_empresa
        AND v.fecha >= _fecha_inicio
        AND v.fecha <= (_fecha_fin + INTERVAL '1 day' - INTERVAL '1 second'); -- Incluye el final del día
    $$;


    ALTER FUNCTION public.dashboardsumarventaporempresa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;

    ------------------------------------------------------------------------------
    -- dashboardsumarventasporempresa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardsumarventasporempresa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS numeric
        LANGUAGE sql
        AS $$
    SELECT 
        COALESCE(SUM(v.monto_total), 0) -- Asegura que retorne 0 si no hay ventas
    FROM 
        ventas AS v
    WHERE 
        v.id_empresa = _id_empresa
    AND DATE(v.fecha) >= DATE(_fecha_inicio) -- Convierte a solo fecha
    AND DATE(v.fecha) <= DATE(_fecha_fin);   -- Convierte a solo fecha
    $$;


    ALTER FUNCTION public.dashboardsumarventasporempresa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboardsumarventasporempresaperiodoanterior: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardsumarventasporempresaperiodoanterior(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS numeric
        LANGUAGE sql
        AS $$
    SELECT 
        COALESCE(SUM(v.monto_total), 0) -- Asegura que retorne 0 si no hay ventas
    FROM 
        ventas AS v
    WHERE 
        v.id_empresa = _id_empresa
    AND DATE(v.fecha) >= DATE(_fecha_inicio) -- Convierte a solo fecha
    AND DATE(v.fecha) <= DATE(_fecha_fin);   -- Convierte a solo fecha
    $$;


    ALTER FUNCTION public.dashboardsumarventasporempresaperiodoanterior(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboardtop5productosmasvendidos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboardtop5productosmasvendidos(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS TABLE(id_producto integer, nombre_producto text, total_vendido numeric, porcentaje numeric)
        LANGUAGE sql
        AS $$
    WITH top_productos AS (
        SELECT
            dv.id_producto,
            p.nombre AS nombre_producto,
            SUM(dv.cantidad) AS total_vendido
        FROM
            detalle_venta AS dv
        INNER JOIN
            ventas AS v
        ON
            dv.id_venta = v.id
        INNER JOIN
            productos AS p
        ON
            dv.id_producto = p.id
        WHERE
            v.id_empresa = _id_empresa
        AND DATE(v.fecha) >= DATE(_fecha_inicio) -- Convierte a solo fecha
    AND DATE(v.fecha) <= DATE(_fecha_fin)   -- Convierte a solo fecha
        GROUP BY
            dv.id_producto, p.nombre
        ORDER BY
            total_vendido DESC
        LIMIT 5
    ),
    total_general AS (
        SELECT
            SUM(total_vendido) AS total
        FROM
            top_productos
    )
    SELECT
        tp.id_producto,
        tp.nombre_producto,
        tp.total_vendido,
        ROUND((tp.total_vendido / tg.total) * 100, 2) AS porcentaje
    FROM
        top_productos tp,
        total_general tg;
    $$;


    ALTER FUNCTION public.dashboardtop5productosmasvendidos(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboartotalventasconfechas: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboartotalventasconfechas(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS TABLE(fecha date, total_ventas numeric)
        LANGUAGE sql
        AS $$
    SELECT
        DATE(v.fecha) AS fecha, -- Agrupa por la fecha (sin tiempo)
        COALESCE(SUM(v.monto_total), 0) AS total_ventas -- Calcula el total de ventas
    FROM
        ventas AS v
    WHERE
        v.id_empresa = _id_empresa -- Filtra por empresa
        AND DATE(v.fecha) >= DATE(_fecha_inicio) -- Convierte a solo fecha
        AND DATE(v.fecha) <= DATE(_fecha_fin)   -- Convierte a solo fecha
    GROUP BY
        DATE(v.fecha) -- Agrupa por fecha
    ORDER BY
        fecha; -- Ordena por fecha
    $$;


    ALTER FUNCTION public.dashboartotalventasconfechas(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- dashboartotalventasxmetodopago: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.dashboartotalventasxmetodopago(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS TABLE(fecha date, metodo_pago text, total_ventas numeric)
        LANGUAGE sql
        AS $$
    SELECT
        DATE(mc.fecha_movimiento) AS fecha, -- Agrupa por la fecha (sin tiempo)
        mp.nombre AS metodo_pago, -- Nombre del método de pago
        COALESCE(SUM(mc.monto), 0) AS total_ventas -- Suma el total de ventas
    FROM
        ventas AS v
    INNER JOIN
        movimientos_caja AS mc
    ON
        v.id = mc.id_ventas -- Relación entre ventas y movimientos de caja
    INNER JOIN
        metodos_pago AS mp
    ON
        mc.id_metodo_pago = mp.id -- Relación con métodos de pago
    WHERE
        v.id_empresa = _id_empresa -- Filtra por empresa
        AND DATE(mc.fecha_movimiento) >= DATE(_fecha_inicio) -- Filtra por fecha de inicio
        AND DATE(mc.fecha_movimiento) <= DATE(_fecha_fin) -- Filtra por fecha de fin
        AND mc.id_ventas IS NOT NULL
    GROUP BY
        DATE(mc.fecha_movimiento), mp.nombre -- Agrupa por fecha y método de pago
    ORDER BY
        fecha asc; -- Ordena por fecha y luego por total de ventas
    $$;


    ALTER FUNCTION public.dashboartotalventasxmetodopago(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- deletedetalleventa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.deletedetalleventa() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    BEGIN
    -- Si la cantidad es igual a 0, elimina el registro antes del UPDATE
    IF NEW.cantidad = 0 THEN
        DELETE FROM detalle_venta WHERE id = NEW.id;
        
    END IF;

    RETURN NEW; -- Continuar el flujo si la cantidad no es 0
    END;
    $$;


    ALTER FUNCTION public.deletedetalleventa() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- devolverstockaleliminardv: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.devolverstockaleliminardv() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    BEGIN
        -- Verificar si el producto tiene inventario gestionado
        IF (SELECT p.maneja_inventarios FROM productos p WHERE p.id = OLD.id_producto) THEN
            -- Incrementar el stock correspondiente en el almacén
            UPDATE stock
            SET stock = stock + OLD.cantidad
            WHERE id_producto = OLD.id_producto
            AND id_almacen = OLD.id_almacen;
        END IF;

        -- Continuar con la operación de eliminación
        RETURN OLD;
    END;
    $$;


    ALTER FUNCTION public.devolverstockaleliminardv() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- editarcantidaddv: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.editarcantidaddv(_id integer, _cantidad numeric) RETURNS void
        LANGUAGE plpgsql
        AS $$
    BEGIN
    UPDATE detalle_venta
    SET 
        cantidad = _cantidad,
        total = _cantidad * precio_venta
    WHERE id = _id;
    END;
    $$;


    ALTER FUNCTION public.editarcantidaddv(_id integer, _cantidad numeric) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- editarcategorias: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.editarcategorias(_nombre text, _id_empresa integer, _color text, _id integer) RETURNS void
        LANGUAGE plpgsql
        AS $$
    begin
    perform 1 from categorias where id != _id and nombre = _nombre and id_empresa=_id_empresa;
    if found then
    raise exception 'Datos duplicados';
    else
    update categorias
    set
    nombre=_nombre,
    color=_color
    where id = _id;
    end if;  
    end;
    $$;


    ALTER FUNCTION public.editarcategorias(_nombre text, _id_empresa integer, _color text, _id integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- editarclientesproveedores: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.editarclientesproveedores(_id integer, _nombres text, _id_empresa integer, _direccion text, _telefono text, _email text, _identificador_nacional text, _identificador_fiscal text, _tipo text) RETURNS void
        LANGUAGE plpgsql
        AS $$
    begin
    perform 1 from clientes_proveedores where (LOWER(nombres)=LOWER(_nombres) and tipo=_tipo and id!=_id and id_empresa=_id_empresa) or (LOWER(identificador_fiscal)=LOWER(_identificador_fiscal) and tipo=_tipo  and id!=_id and id_empresa=_id_empresa) or (LOWER(identificador_nacional)=LOWER(_identificador_nacional) and tipo=_tipo  and id!=_id and id_empresa=_id_empresa);
    if found then
    raise exception 'Datos duplicados';
    else
    update clientes_proveedores
    set
    nombres = _nombres,
            direccion = _direccion,
            telefono = _telefono,
            email = _email,
            identificador_nacional = _identificador_nacional,
            identificador_fiscal = _identificador_fiscal
        
    where id = _id;
    end if;  
    end;
    $$;


    ALTER FUNCTION public.editarclientesproveedores(_id integer, _nombres text, _id_empresa integer, _direccion text, _telefono text, _email text, _identificador_nacional text, _identificador_fiscal text, _tipo text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- editarmarca: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.editarmarca(_nombre text, _id_empresa integer, _id integer) RETURNS void
        LANGUAGE plpgsql
        AS $$
    begin
    perform 1 from marca where nombre=_nombre and id_empresa=_id_empresa and id!=_id;
    if found then
    raise exception 'Datos duplicados';
    else
    update marca
    set nombre=_nombre
    where id=_id;
    end if;
    end;
    $$;


    ALTER FUNCTION public.editarmarca(_nombre text, _id_empresa integer, _id integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- editarproductos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.editarproductos(_id integer, _nombre text, _precio_venta numeric, _precio_compra numeric, _id_categoria integer, _codigo_barras text, _codigo_interno text, _id_empresa integer, _sevende_por text, _maneja_inventarios boolean) RETURNS void
        LANGUAGE plpgsql
        AS $$
    begin
    perform 1 from productos where nombre=_nombre and id_empresa=_id_empresa and id!=_id;
    if found then
    raise exception 'Nombre de producto duplicado';  
    else
        perform 1 from productos where (codigo_interno=_codigo_interno and id_empresa=_id_empresa and id!=_id) or 
        (codigo_barras=_codigo_barras
        and id_empresa=_id_empresa and id!=_id);
        if found then
        raise exception 'Codigo de barra ó interno duplicado';
        else
        update  productos set nombre=_nombre,precio_venta=_precio_venta,precio_compra=_precio_compra,id_categoria=_id_categoria,codigo_barras=_codigo_barras,codigo_interno=_codigo_interno,sevende_por=_sevende_por,maneja_inventarios=_maneja_inventarios
        where id=_id;
        end if;
    end if;
    end;
    $$;


    ALTER FUNCTION public.editarproductos(_id integer, _nombre text, _precio_venta numeric, _precio_compra numeric, _id_categoria integer, _codigo_barras text, _codigo_interno text, _id_empresa integer, _sevende_por text, _maneja_inventarios boolean) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- generar_nro_comprobante: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.generar_nro_comprobante(_id_tipo_comprobante integer, _serie text, _id_sucursal integer) RETURNS text
        LANGUAGE plpgsql
        AS $$
    DECLARE
        _nuevo_numero INTEGER;
        _nuevo_comprobante TEXT;
        _cantidad_numeros INTEGER;
    BEGIN
        -- Obtener el correlativo actual y la cantidad de números usando _id_tipo_comprobante
        SELECT correlativo + 1, cantidad_numeros
        INTO _nuevo_numero, _cantidad_numeros
        FROM serializacion_comprobantes
        WHERE id_tipo_comprobante = _id_tipo_comprobante 
        AND serie = _serie 
        AND sucursal_id = _id_sucursal
        FOR UPDATE;

        -- Actualizar el correlativo en la tabla de serialización
        UPDATE serializacion_comprobantes
        SET correlativo = _nuevo_numero
        WHERE id_tipo_comprobante = _id_tipo_comprobante 
        AND serie = _serie 
        AND sucursal_id = _id_sucursal;

        -- Generar el número de comprobante con ceros a la izquierda
        _nuevo_comprobante := _serie || '-' || LPAD(_nuevo_numero::TEXT, _cantidad_numeros, '0');

        RETURN _nuevo_comprobante;
    END;
    $$;


    ALTER FUNCTION public.generar_nro_comprobante(_id_tipo_comprobante integer, _serie text, _id_sucursal integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- incrementarstock: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.incrementarstock(_id integer, cantidad numeric) RETURNS void
        LANGUAGE plpgsql
        AS $$
    BEGIN
    UPDATE stock SET stock = stock + cantidad WHERE id = _id;
    END;
    $$;


    ALTER FUNCTION public.incrementarstock(_id integer, cantidad numeric) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertar_productos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertar_productos() RETURNS void
        LANGUAGE plpgsql
        AS $$
    DECLARE
        i INT;
        nuevo_codigo_interno TEXT;
        nuevo_codigo_barras TEXT;
    BEGIN
        FOR i IN 1..5000 LOOP
            -- Generar códigos únicos usando el ID del ciclo (i) y un prefijo.
            nuevo_codigo_interno := 'INT-' || i || '-' || trunc(random() * 10000)::TEXT;
            nuevo_codigo_barras := 'BAR-' || i || '-' || trunc(random() * 100000)::TEXT;

            -- Insertar cada registro con datos aleatorios y los códigos generados.
            INSERT INTO productos (
                nombre,
                precio_venta,
                precio_compra,
                id_categoria,
                codigo_barras,
                codigo_interno,
                id_empresa,
                sevende_por,
                maneja_inventarios,
                maneja_multiprecios
            ) VALUES (
                'Producto ' || i,                       -- Nombre del producto.
                trunc(random() * 1000 + 1)::NUMERIC,    -- Precio de venta aleatorio.
                trunc(random() * 500 + 1)::NUMERIC,     -- Precio de compra aleatorio.
                2019,                                   -- ID de categoría.
                nuevo_codigo_barras,                    -- Código de barras único.
                nuevo_codigo_interno,                   -- Código interno único.
                6896,                                   -- ID de empresa.
                'unidad',                               -- Se vende por unidad.
                true,                                   -- Maneja inventario.
                false                                   -- No maneja múltiplos.
            );
        END LOOP;
    END;
    $$;


    ALTER FUNCTION public.insertar_productos() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarcategorias: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarcategorias(_nombre text, _color text, _icono text, _id_empresa integer) RETURNS integer
        LANGUAGE plpgsql
        AS $$
    declare nuevo_id int;
    begin
    perform 1 from categorias where nombre=_nombre and id_empresa=_id_empresa;
    if found then
    raise exception 'Datos duplicados';
    else
    insert into categorias(nombre,color,icono,id_empresa)
    values(_nombre,_color,_icono,_id_empresa)
    returning id into nuevo_id;
    return nuevo_id;
    end if;
    end;
    $$;


    ALTER FUNCTION public.insertarcategorias(_nombre text, _color text, _icono text, _id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarclientesproveedores: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarclientesproveedores(_nombres text, _id_empresa integer, _direccion text, _telefono text, _email text, _identificador_nacional text, _identificador_fiscal text, _tipo text) RETURNS void
        LANGUAGE plpgsql
        AS $$

    begin
    perform 1 from clientes_proveedores where (LOWER(nombres)=LOWER(_nombres) and tipo=_tipo) or (LOWER(identificador_fiscal)=LOWER(_identificador_fiscal) and tipo=_tipo) or (LOWER(identificador_nacional)=LOWER(_identificador_nacional) and tipo=_tipo);
    if found then
    raise exception 'Datos duplicados';
    else
    insert into clientes_proveedores(nombres,id_empresa,direccion,telefono,email,identificador_nacional,identificador_fiscal,tipo)
    values(_nombres,_id_empresa,_direccion,_telefono,_email,_identificador_nacional,_identificador_fiscal,_tipo);
    end if;
    end;
    $$;


    ALTER FUNCTION public.insertarclientesproveedores(_nombres text, _id_empresa integer, _direccion text, _telefono text, _email text, _identificador_nacional text, _identificador_fiscal text, _tipo text) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertardetalleventa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertardetalleventa(_id_venta integer, _cantidad numeric, _precio_venta numeric, _id_producto integer, _precio_compra numeric, _descripcion text, _id_sucursal integer, _id_almacen integer) RETURNS void
        LANGUAGE plpgsql
        AS $$BEGIN
        -- Verificar si el producto ya existe en el detalle de venta
        IF EXISTS (
            SELECT 1
            FROM detalle_venta
            WHERE id_venta = _id_venta
            AND id_producto = _id_producto
            AND id_almacen = _id_almacen
        ) THEN
            -- Si existe, actualizar la cantidad y el total
            UPDATE detalle_venta
            SET cantidad = cantidad + _cantidad,
                total = (cantidad + _cantidad) * _precio_venta
            WHERE id_venta = _id_venta
            AND id_producto = _id_producto
            AND id_almacen = _id_almacen;
        ELSE
            -- Si no existe, insertar un nuevo registro
            INSERT INTO detalle_venta (
                id_venta, id_producto, cantidad, precio_venta, 
                precio_compra, descripcion, total, id_sucursal,id_almacen
            ) VALUES (
                _id_venta, _id_producto, _cantidad, _precio_venta, 
                _precio_compra, _descripcion, _cantidad * _precio_venta, _id_sucursal,_id_almacen
            );
        END IF;
    END;$$;


    ALTER FUNCTION public.insertardetalleventa(_id_venta integer, _cantidad numeric, _precio_venta numeric, _id_producto integer, _precio_compra numeric, _descripcion text, _id_sucursal integer, _id_almacen integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarimpresora: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarimpresora() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    begin
    insert into impresoras (id_caja)
    values(new.id);
    return new;
    end
    $$;


    ALTER FUNCTION public.insertarimpresora() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarmarca: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarmarca(_nombre text, _id_empresa integer) RETURNS void
        LANGUAGE plpgsql
        AS $$
    begin
    perform 1 from marca where nombre=_nombre and id_empresa=_id_empresa;
    if found then
    raise exception 'Datos duplicados';
    else
    insert into marca(nombre,id_empresa)
    values(_nombre,_id_empresa);
    end if;
    end;
    $$;


    ALTER FUNCTION public.insertarmarca(_nombre text, _id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarpermisohome: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarpermisohome() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    DECLARE
        id_modulo_home INT;
    BEGIN
        -- Verifica si el rol no es 'superadmin' antes de proceder
        IF EXISTS (
            SELECT 1 
            FROM usuarios u 
            INNER JOIN roles r ON r.id = u.id_rol 
            WHERE r.nombre != 'superadmin' AND r.id = NEW.id_rol
        ) THEN
            -- Obtiene el ID del módulo correspondiente al '/'
            SELECT m.id 
            INTO id_modulo_home
            FROM modulos m 
            WHERE m.link = '/';
            
            -- Inserta el permiso en la tabla 'permisos'
            INSERT INTO permisos (id_usuario, idmodulo)
            VALUES (NEW.id, id_modulo_home);
        END IF;

        RETURN NEW;
    END;
    $$;


    ALTER FUNCTION public.insertarpermisohome() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarproductos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarproductos(_nombre text, _precio_venta numeric, _precio_compra numeric, _id_categoria integer, _codigo_barras text, _codigo_interno text, _id_empresa integer, _sevende_por text, _maneja_inventarios boolean, _maneja_multiprecios boolean) RETURNS integer
        LANGUAGE plpgsql
        AS $$
    declare nuevo_id int;
    begin
    perform 1 from productos where nombre=_nombre and id_empresa=_id_empresa;
    if found then
    raise exception 'Nombre de producto duplicado';  
    else
        perform 1 from productos where codigo_interno=_codigo_interno or 
        codigo_barras=_codigo_barras
        and id_empresa=_id_empresa ;
        if found then
        raise exception 'Codigo de barra ó interno duplicado';
        else
        insert into productos(nombre,precio_venta,precio_compra,id_categoria,codigo_barras,codigo_interno,id_empresa,sevende_por,maneja_inventarios,maneja_multiprecios)
        values(_nombre,_precio_venta,_precio_compra,_id_categoria,_codigo_barras,_codigo_interno,_id_empresa,_sevende_por,_maneja_inventarios,_maneja_multiprecios)
        returning id into nuevo_id;
        return nuevo_id;
        end if;
    end if;
    end;
    $$;


    ALTER FUNCTION public.insertarproductos(_nombre text, _precio_venta numeric, _precio_compra numeric, _id_categoria integer, _codigo_barras text, _codigo_interno text, _id_empresa integer, _sevende_por text, _maneja_inventarios boolean, _maneja_multiprecios boolean) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertarserializaciones: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertarserializaciones() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    begin
    insert into serializacion_comprobantes (
    id_tipo_comprobante, serie, cantidad_numeros, correlativo, sucursal_id, por_default
    )
    values 
    (1, 'F001', 9, 0, NEW.id, false),
    (2, 'B001', 8, 0,  NEW.id, false),
    (3, 'NC01', 8, 0,  NEW.id, false),
    (4, 'ND01', 9, 0,  NEW.id, false),
    (5, 'T001', 8, 0,  NEW.id, true);
    return NEW;
    end
    $$;


    ALTER FUNCTION public.insertarserializaciones() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- insertpordefecto: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.insertpordefecto() RETURNS trigger
        LANGUAGE plpgsql
        AS $$declare new_id_sucursal int;
    declare new_id_tipo_documento int;
    declare id_admin_rol INT;
    declare new_id_usuario INT;
    declare new_id_caja int;
    declare new_id_categoria int;
    declare item record;
    begin


    insert into tipodocumento(nombre,id_empresa)
    values('Generico',new.id)
    returning id into new_id_tipo_documento;
    --mostrar rol admin
    SELECT id INTO id_admin_rol
    FROM roles
    WHERE nombre = 'superadmin';
    --
    --usuario admin
    insert into usuarios(nombres,id_tipodocumento,id_rol,correo,id_auth)
    values('Generico',new_id_tipo_documento,id_admin_rol,new.correo,new.id_auth)
    returning id into new_id_usuario;
    --
    --insertando los permisos al superadmin
    for item in
    select id from modulos
    loop
    
        insert into permisos(id_usuario,idmodulo)
        values(new_id_usuario,item.id);  
    end loop;
    --update a empresa con el id_usuario
    update empresa
    set id_usuario=new_id_usuario
    where id_usuario is null;
    --
    insert into sucursales(nombre,direccion_fiscal,id_empresa,delete)
    values(new.nombre,new.direccion_fiscal,new.id,false)
    returning id into new_id_sucursal;

    insert into almacen(id_sucursal,delete,nombre)
    values(new_id_sucursal,false,'Almacen principal');

    insert into caja (descripcion,id_sucursal,delete)
    values('Caja principal',new_id_sucursal,false)
    returning id into new_id_caja;


    insert into asignacion_sucursal(id_sucursal,id_usuario,id_caja)
    values(new_id_sucursal,new_id_usuario,new_id_caja);


    insert into categorias(nombre,color,icono,id_empresa)
    values('General','#FEC701','-',new.id)
    returning id into new_id_categoria;

    insert into productos(nombre,precio_venta,precio_compra,id_categoria, codigo_barras,codigo_interno,id_empresa)
    values ('Producto de prueba',10,5,new_id_categoria,'123456789','000123456',new.id);

    insert into clientes_proveedores(nombres,id_empresa)
    values ('Generico',new.id);

    --agregar 4 metodos de pago por defecto
    insert into metodos_pago(nombre,id_empresa)
    values ('Efectivo',new.id);

    insert into metodos_pago(nombre,id_empresa)
    values ('Tarjeta',new.id);

    insert into metodos_pago(nombre,id_empresa)
    values ('Credito',new.id);

    insert into metodos_pago(nombre,id_empresa)
    values ('Mixto',new.id);

    return new;
    end$$;


    ALTER FUNCTION public.insertpordefecto() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarcajasabiertasporempresa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarcajasabiertasporempresa(_id_empresa integer) RETURNS TABLE(id_cierre_caja integer, id_caja integer, usuario text, rol text)
        LANGUAGE sql
        AS $$
    select cierrecaja.id as id_cierre_caja, cierrecaja.id_caja,usuarios.nombres as usuario,roles.nombre as rol
    from cierrecaja
    inner join caja on caja.id = cierrecaja.id_caja
    inner join sucursales on sucursales.id = caja.id_sucursal
    inner join usuarios on usuarios.id=cierrecaja.id_usuario
    inner join roles on roles.id = usuarios.id_rol
    where cierrecaja.estado = 0
        and sucursales.id_empresa = _id_empresa
    $$;


    ALTER FUNCTION public.mostrarcajasabiertasporempresa(_id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarcajasabiertasporsucursal: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarcajasabiertasporsucursal(_id_sucursal integer) RETURNS TABLE(id_cierre_caja integer, id_caja integer, usuario text, rol text)
        LANGUAGE sql
        AS $$
    select cierrecaja.id as id_cierre_caja, cierrecaja.id_caja,usuarios.nombres as usuario,roles.nombre as rol
    from cierrecaja
    inner join caja on caja.id = cierrecaja.id_caja
    inner join sucursales on sucursales.id = caja.id_sucursal
    inner join usuarios on usuarios.id=cierrecaja.id_usuario
    inner join roles on roles.id = usuarios.id_rol
    where cierrecaja.estado = 0
        and caja.id_sucursal = _id_sucursal
    $$;


    ALTER FUNCTION public.mostrarcajasabiertasporsucursal(_id_sucursal integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarcajasasignadas: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarcajasasignadas(_id_usuario integer) RETURNS TABLE(id integer, sucursal_caja text, id_caja text, id_sucursal integer)
        LANGUAGE sql
        AS $$
        SELECT
        ac.id,
        CONCAT(s.nombre, ' - ', c.descripcion) AS sucursal_caja,ac.id_caja,ac.id_sucursal
        
        FROM asignacion_sucursal ac inner join caja c on ac.id_caja=c.id
        inner join sucursales s on s.id=ac.id_sucursal 
        WHERE ac.id_usuario = _id_usuario;

    $$;


    ALTER FUNCTION public.mostrarcajasasignadas(_id_usuario integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarcierrecajaabierta: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarcierrecajaabierta(_id_caja integer) RETURNS TABLE(id integer, id_sucursal integer, id_caja integer, id_usuario integer, fechainicio timestamp without time zone, fechacierre timestamp without time zone, caja text, sucursal     text, estado_cierre_caja integer, usuario text, roluser text)
        LANGUAGE sql
        AS $$
        SELECT cc.id,c.id_sucursal,cc.id_caja,cc.id_usuario,cc.fechainicio,cc.fechacierre,c.descripcion as caja,s.nombre as sucursal,cc.estado as estado_cierre_caja,
        u.nombres,r.nombre as rol

        FROM cierrecaja cc inner join caja c on c.id=cc.id_caja
        inner join sucursales s on c.id_sucursal = s.id inner join usuarios as u on u.id=cc.id_usuario
        inner join roles r on r.id = u.id_rol
        where cc.estado = 0 and cc.id_caja = _id_caja;

    $$;


    ALTER FUNCTION public.mostrarcierrecajaabierta(_id_caja integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrardetalleventa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrardetalleventa(_id_venta integer) RETURNS TABLE(producto text, precio_venta numeric, cantidad numeric, estado text, total numeric, id integer)
        LANGUAGE sql
        AS $$
    select p.nombre as producto,dv.precio_venta,dv.cantidad,dv.estado,dv.total,dv.id from detalle_venta as dv
    inner join productos as p on p.id=dv.id_producto
    inner join sucursales as s on s.id=dv.id_sucursal

    where dv.id_venta = _id_venta;
    $$;


    ALTER FUNCTION public.mostrardetalleventa(_id_venta integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarempresaxiduser: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarempresaxiduser(_id_usuario integer) RETURNS TABLE(result public.empresa)
        LANGUAGE sql
        AS $$
    with user_role as (
    select r.nombre as rol
    from usuarios u
    inner join roles r on u.id_rol = r.id
    where u.id = _id_usuario
    )
    select *
    from (
    -- Caso 1: Si el usuario es 'superadmin'
    select *
    from empresa
    where empresa.id_usuario = _id_usuario
    
    union
    
    -- Caso 2: Si el usuario NO es 'superadmin'
    select empresa.*
    from asignacion_sucursal
    inner join usuarios on usuarios.id = asignacion_sucursal.id_usuario
    inner join sucursales on sucursales.id = asignacion_sucursal.id_sucursal
    inner join empresa on empresa.id = sucursales.id_empresa
    where asignacion_sucursal.id_usuario = _id_usuario
    ) result
    where exists (
    select 1
    from user_role
    where (rol = 'superadmin') -- Solo valida el rol aquí
        or (rol <> 'superadmin') -- O cualquier otro rol
    );
    $$;


    ALTER FUNCTION public.mostrarempresaxiduser(_id_usuario integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarmovimientoscajalive: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarmovimientoscajalive(_id_empresa integer) RETURNS TABLE(usuario_nombre text, tipo_movimiento text, monto numeric, descripcion text, fecha_movimiento text, caja_nombre text, sucursal_nombre text, id integer)
        LANGUAGE sql
        AS $$
    SELECT 
        u.nombres AS usuario_nombre,
        mc.tipo_movimiento,
        mc.monto,
        mc.descripcion,
        TO_CHAR(mc.fecha_movimiento,'DD-MM-YYYY HH24:MI:SS') as fecha_movimiento,
        c.descripcion AS caja_nombre,
        s.nombre AS sucursal_nombre,
        mc.id as id_mov_caja
    FROM 
        movimientos_caja mc
    INNER JOIN 
        cierrecaja cc ON mc.id_cierre_caja = cc.id
    INNER JOIN 
        caja c ON cc.id_caja = c.id
    INNER JOIN 
        sucursales s ON c.id_sucursal = s.id
    INNER JOIN 
        usuarios u ON mc.id_usuario = u.id
    WHERE 
        s.id_empresa = _id_empresa
    ORDER BY 
        mc.fecha_movimiento DESC
    LIMIT 10;
    $$;


    ALTER FUNCTION public.mostrarmovimientoscajalive(_id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarproductos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarproductos(_id_empresa integer) RETURNS TABLE(id integer, nombre text, precio_venta numeric, precio_compra numeric, id_categoria integer, sevende_por text, codigo_barras text, codigo_interno text, id_empresa integer, maneja_inventarios boolean, maneja_multiprecios boolean, p_venta text, p_compra text, categoria text)
        LANGUAGE sql
        AS $$
    select p.id,
    p.nombre,p.precio_venta,p.precio_compra,p.id_categoria,p.sevende_por,p.codigo_barras,p.codigo_interno,p.id_empresa,p.maneja_inventarios,p.maneja_multiprecios,concat(e.simbolo_moneda,' ', p.precio_venta) as p_venta,concat(e.simbolo_moneda,' ', p.precio_compra) as p_compra,c.nombre as categoria
    from productos as p inner join empresa as e on e.id=p.id_empresa
    inner join categorias as c on c.id=p.id_categoria
    where p.id_empresa=_id_empresa;
    $$;


    ALTER FUNCTION public.mostrarproductos(_id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarsucursalesasignadas: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarsucursalesasignadas(_id_usuario integer) RETURNS TABLE(id_sucursal integer, sucursal text, id_usuario integer, id_asignacion_sucursal integer)
        LANGUAGE sql
        AS $$
    select s.id as id_sucursal,  s.nombre as sucursal,a.id_usuario,a.id as id_asignacion_sucursal  from 
    asignacion_sucursal as a inner join sucursales
    as s on s.id=a.id_sucursal
    where a.id_usuario = _id_usuario;
    $$;


    ALTER FUNCTION public.mostrarsucursalesasignadas(_id_usuario integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrartop10productosmasvendidosxmonto: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrartop10productosmasvendidosxmonto(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS TABLE(id_producto integer, nombre_producto text, total_vendido numeric, porcentaje numeric)
        LANGUAGE sql
        AS $$
    with top_productos as (
        select dv.id_producto,
        p.nombre as nombre_producto,
        SUM(dv.total) as total_vendido
        from detalle_venta as dv
        inner join 
        ventas as v
        on
        dv.id_venta = v.id
        inner join 
        productos as p
        on 
        dv.id_producto = p.id
        where 
        v.id_empresa = _id_empresa
        and DATE(v.fecha) >= DATE(_fecha_inicio)
        and DATE(v.fecha) <= DATE(_fecha_fin)
        group by 
        dv.id_producto,p.nombre
        order by 
        total_vendido desc
        limit 10
    ),
    total_general as (
        select 
        SUM(total_vendido) as total
        from top_productos
    )
    select 
        tp.id_producto,
        tp.nombre_producto,
        tp.total_vendido,
        ROUND((tp.total_vendido/tg.total) * 100, 2) as porcentaje
    from
    top_productos tp,
    total_general tg;
    $$;


    ALTER FUNCTION public.mostrartop10productosmasvendidosxmonto(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrartop5productosmasvendidosxcantidad: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrartop5productosmasvendidosxcantidad(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS TABLE(id_producto integer, nombre_producto text, total_vendido numeric, porcentaje numeric)
        LANGUAGE sql
        AS $$
    with top_productos as (
        select dv.id_producto,
        p.nombre as nombre_producto,
        SUM(dv.cantidad) as total_vendido
        from detalle_venta as dv
        inner join 
        ventas as v
        on
        dv.id_venta = v.id
        inner join 
        productos as p
        on 
        dv.id_producto = p.id
        where 
        v.id_empresa = _id_empresa
        and DATE(v.fecha) >= DATE(_fecha_inicio)
        and DATE(v.fecha) <= DATE(_fecha_fin)
        group by 
        dv.id_producto,p.nombre
        order by 
        total_vendido desc
        limit 5
    ),
    total_general as (
        select 
        SUM(total_vendido) as total
        from top_productos
    )
    select 
        tp.id_producto,
        tp.nombre_producto,
        tp.total_vendido,
        ROUND((tp.total_vendido/tg.total) * 100, 2) as porcentaje
    from
    top_productos tp,
    total_general tg;
    $$;


    ALTER FUNCTION public.mostrartop5productosmasvendidosxcantidad(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarusuariosasignados: --
    ------------------------------------------------------------------------------
    CREATE or replace FUNCTION public.mostrarusuariosasignados(_id_empresa integer) RETURNS TABLE(id_asignacion integer, id_usuario integer, usuario text, sucursal text, caja text, rol text, email text, estadouser text,id_rol integer, nro_doc text, telefono text)
        LANGUAGE sql
        AS $$
    select asignacion_sucursal.id as id_asignacion,
    usuarios.id as id_usuario,
    usuarios.nombres as usuario,
    sucursales.nombre as sucursal, 
    caja.descripcion as caja,
    roles.nombre as rol , 
    usuarios.correo as email , 
    usuarios.estado as estadouser,
    roles.id as id_rol,
    usuarios.nro_doc,
    usuarios.telefono
    from asignacion_sucursal 
    inner join sucursales on asignacion_sucursal.id_sucursal = sucursales.id
    inner join usuarios on asignacion_sucursal.id_usuario = usuarios.id
    inner join roles on usuarios.id_rol = roles.id
    inner join caja on asignacion_sucursal.id_caja = caja.id
    where sucursales.id_empresa=_id_empresa and roles.nombre!='superadmin';
    $$;


    ALTER FUNCTION public.mostrarusuariosasignados(_id_empresa integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- mostrarventasporsucursalfechas: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.mostrarventasporsucursalfechas(_id_sucursal integer, _fecha_inicio date, _fecha_fin date) RETURNS SETOF public.ventas
        LANGUAGE sql
        AS $$
    select *
    from ventas
    where id_sucursal = _id_sucursal
        and estado = 'confirmada'
        and fecha::date between _fecha_inicio and _fecha_fin
    $$;


    ALTER FUNCTION public.mostrarventasporsucursalfechas(_id_sucursal integer, _fecha_inicio date, _fecha_fin date) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- obtenertotalescaja: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.obtenertotalescaja(p_id_caja integer) RETURNS TABLE(total_ventas numeric, total_ingresos numeric, total_egresos numeric, total_ventas_efectivo numeric, total_ventas_credito numeric, total_ventas_tarjeta numeric)
        LANGUAGE plpgsql
        AS $$
    BEGIN
    RETURN QUERY
        SELECT
            -- Subconsulta para evitar duplicación de ventas
            (SELECT COALESCE(SUM(v.monto_total), 0)
            FROM ventas v
            WHERE v.id_caja = p_id_caja  AND v.estado = 'confirmada'
            AND v.fecha BETWEEN cc.fechainicio AND NOW()) AS total_ventas,

            -- Subconsulta para sumar solo los ingresos
            (SELECT COALESCE(SUM(isc.monto), 0)
            FROM ingresos_salidas_caja isc
            WHERE isc.id_caja = p_id_caja 
            AND isc.tipo = 'ingreso'
            AND isc.fecha BETWEEN cc.fechainicio AND NOW()) AS total_ingresos,

            -- Subconsulta para sumar solo los egresos
            (SELECT COALESCE(SUM(isc.monto), 0)
            FROM ingresos_salidas_caja isc
            WHERE isc.id_caja = p_id_caja 
            AND isc.tipo = 'salida'
            AND isc.fecha BETWEEN cc.fechainicio AND NOW()) AS total_egresos,

            -- Total de ventas en efectivo
            (SELECT COALESCE(SUM(v.monto_total), 0)
            FROM ventas v
            WHERE v.id_caja = p_id_caja
            AND v.efectivo > 0
            AND v.estado = 'confirmada'
            AND v.fecha BETWEEN cc.fechainicio AND NOW()) AS total_ventas_efectivo,

            -- Total de ventas en crédito
            (SELECT COALESCE(SUM(v.monto_total), 0)
            FROM ventas v
            WHERE v.id_caja = p_id_caja
            AND v.credito > 0
            AND v.estado = 'confirmada'
            AND v.fecha BETWEEN cc.fechainicio AND NOW()) AS total_ventas_credito,

            -- Total de ventas en tarjeta
            (SELECT COALESCE(SUM(v.monto_total), 0)
            FROM ventas v
            WHERE v.id_caja = p_id_caja
            AND v.tarjeta > 0
            AND v.estado = 'confirmada'
            AND v.fecha BETWEEN cc.fechainicio AND NOW()) AS total_ventas_tarjeta   

        FROM cierrecaja cc
        WHERE cc.id_caja = p_id_caja;
    END;
    $$;


    ALTER FUNCTION public.obtenertotalescaja(p_id_caja integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- reducirstock: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.reducirstock(_id integer, cantidad numeric) RETURNS void
        LANGUAGE plpgsql
        AS $$
    DECLARE stock_actual numeric;
    BEGIN
            SELECT s.stock 
            INTO stock_actual
            FROM stock s 
            WHERE id = _id;
            IF stock_actual < cantidad then 
                RAISE EXCEPTION 'Stock insuficiente para este producto';
            else     
            UPDATE stock SET stock = stock - cantidad WHERE id = _id;
            end if;
    END;
    $$;


    ALTER FUNCTION public.reducirstock(_id integer, cantidad numeric) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- report_stock_bajo_minimo: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.report_stock_bajo_minimo(sucursal_id integer, almacen_id integer) RETURNS TABLE(codigo_articulo text, descripcion_articulo text, stock numeric, stock_minimo numeric, precio_costo numeric, total numeric)
        LANGUAGE sql
        AS $$
    SELECT 
        p.codigo_interno AS codigo_articulo,
        p.nombre AS descripcion_articulo,
        s.stock,
        s.stock_minimo,
        p.precio_compra AS precio_costo,
        (s.stock * p.precio_compra) AS total
    FROM stock s
    INNER JOIN almacen a ON s.id_almacen = a.id
    INNER JOIN productos p ON s.id_producto = p.id
    WHERE a.id_sucursal = sucursal_id
    AND a.id = almacen_id
    AND s.stock < s.stock_minimo;  -- 🔥 SOLO PRODUCTOS CON STOCK BAJO MÍNIMO
    $$;


    ALTER FUNCTION public.report_stock_bajo_minimo(sucursal_id integer, almacen_id integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- report_stock_por_almacen_sucursal: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.report_stock_por_almacen_sucursal(sucursal_id integer, almacen_id integer) RETURNS TABLE(codigo_articulo text, descripcion_articulo text, stock numeric, precio_costo numeric, total numeric)
        LANGUAGE sql
        AS $$
    SELECT 
        p.codigo_interno AS codigo_articulo,
        p.nombre AS descripcion_articulo,
        s.stock,
        p.precio_compra AS precio_costo,
        (s.stock * p.precio_compra) AS total
    FROM stock s
    INNER JOIN almacen a ON s.id_almacen = a.id
    INNER JOIN productos p ON s.id_producto = p.id
    WHERE a.id_sucursal = sucursal_id
    AND a.id = almacen_id;
    $$;


    ALTER FUNCTION public.report_stock_por_almacen_sucursal(sucursal_id integer, almacen_id integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- report_ventas_por_sucursal: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.report_ventas_por_sucursal(sucursal_id integer, fecha_inicio date, fecha_fin date) RETURNS TABLE(id_venta integer, fecha timestamp without time zone, monto_total numeric, total_impuestos numeric, subtotal numeric, saldo numeric, pago_con text, cantidad_productos integer, id_usuario integer, cajero text, id_cliente integer, estado text)
        LANGUAGE sql
        AS $$
    SELECT 
        v.id AS id_venta,
        (v.fecha) AS fecha,  -- 🔥 Se convierte a solo fecha
        v.monto_total,
        v.total_impuestos,
        v.sub_total AS subtotal,
        v.saldo,
        v.pago_con,
        v.cantidad_productos,
        v.id_usuario,
        u.nombres AS cajero,
        v.id_cliente,
        v.estado
    FROM ventas v
    INNER JOIN usuarios u ON v.id_usuario = u.id
    WHERE v.id_sucursal = sucursal_id
    AND DATE(v.fecha) BETWEEN fecha_inicio AND fecha_fin; -- 🔥 Se filtra solo por día
    $$;


    ALTER FUNCTION public.report_ventas_por_sucursal(sucursal_id integer, fecha_inicio date, fecha_fin date) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- setdefaultserializacion: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.setdefaultserializacion(_id integer, _id_sucursal integer) RETURNS void
        LANGUAGE plpgsql
        AS $$
    begin 
    UPDATE serializacion_comprobantes
    SET por_default = false
    where sucursal_id=_id_sucursal;

        UPDATE serializacion_comprobantes
        SET por_default = true
        WHERE id = _id;
    end;
    $$;


    ALTER FUNCTION public.setdefaultserializacion(_id integer, _id_sucursal integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- sumarefectivosinventasmovcierrecaja: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.sumarefectivosinventasmovcierrecaja(_id_cierre_caja integer) RETURNS TABLE(tipo_movimiento text, monto numeric)
        LANGUAGE sql
        AS $$
    SELECT 
    mc.tipo_movimiento,SUM(mc.monto) as monto
    FROM 
    movimientos_caja AS mc
    INNER JOIN 
    cierrecaja AS cc 
    ON 
    mc.id_cierre_caja = cc.id
    inner join metodos_pago as mp 
    on
    mc.id_metodo_pago = mp.id  
    WHERE 
    mp.nombre = 'Efectivo' and mc.id_ventas is null
    AND mc.id_cierre_caja = _id_cierre_caja and cc.estado=0
    group by mc.tipo_movimiento
    $$;


    ALTER FUNCTION public.sumarefectivosinventasmovcierrecaja(_id_cierre_caja integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- sumarnoefectivosinventasmovcierrecaja: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.sumarnoefectivosinventasmovcierrecaja(_id_cierre_caja integer) RETURNS TABLE(tipo_movimiento text, monto numeric, metodo text)
        LANGUAGE sql
        AS $$
    SELECT 
    mc.tipo_movimiento,SUM(mc.monto) as monto, mp.nombre as metodo
    FROM 
    movimientos_caja AS mc
    INNER JOIN 
    cierrecaja AS cc 
    ON 
    mc.id_cierre_caja = cc.id
    inner join metodos_pago as mp 
    on
    mc.id_metodo_pago = mp.id  
    WHERE 
    mp.nombre != 'Efectivo' and mc.id_ventas is null
    AND mc.id_cierre_caja = _id_cierre_caja and cc.estado=0
    group by mc.tipo_movimiento, mp.nombre
    $$;


    ALTER FUNCTION public.sumarnoefectivosinventasmovcierrecaja(_id_cierre_caja integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- sumarventasmetodopagomovcierrecaja: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.sumarventasmetodopagomovcierrecaja(_id_cierre_caja integer) RETURNS TABLE(metodo_pago text, monto numeric)
        LANGUAGE sql
        AS $$
    select mp.nombre as metodo_pago, SUM(CASE WHEN mp.nombre='Efectivo' THEN mc.monto - mc.vuelto ELSE mc.monto END ) as monto from
    movimientos_caja as mc
    inner join cierrecaja as cc 
    on
    mc.id_cierre_caja = cc.id
    inner join metodos_pago as mp
    on mc.id_metodo_pago = mp.id
    where mc.id_ventas is not  null
    and mc.id_cierre_caja = _id_cierre_caja and cc.estado = 0
    group by mp.nombre

    $$;


    ALTER FUNCTION public.sumarventasmetodopagomovcierrecaja(_id_cierre_caja integer) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- sumarventasporempresa: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.sumarventasporempresa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) RETURNS numeric
        LANGUAGE sql
        AS $$
    SELECT 
        COALESCE(SUM(v.monto_total), 0) -- Asegura que retorne 0 si no hay ventas
    FROM 
        ventas AS v
    WHERE 
        v.id_empresa = _id_empresa
        AND v.fecha >= _fecha_inicio
        AND v.fecha <= _fecha_fin;
    $$;


    ALTER FUNCTION public.sumarventasporempresa(_id_empresa integer, _fecha_inicio timestamp without time zone, _fecha_fin timestamp without time zone) OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- updateuseinventariosproductos: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.updateuseinventariosproductos() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
    begin
    update productos
    set maneja_inventarios=false
    where id=old.id_producto;
    return old;
    end
    $$;


    ALTER FUNCTION public.updateuseinventariosproductos() OWNER TO postgres;


    ------------------------------------------------------------------------------
    -- validarstock: --
    ------------------------------------------------------------------------------
    CREATE FUNCTION public.validarstock() RETURNS trigger
        LANGUAGE plpgsql
        AS $$DECLARE
        stock_actual numeric;
    BEGIN
        -- Verificar si el producto maneja inventarios
        IF (SELECT p.maneja_inventarios FROM productos p WHERE p.id = NEW.id_producto) THEN
            -- Obtener el stock actual
            SELECT s.stock 
            INTO stock_actual
            FROM stock s 
            WHERE s.id_producto = NEW.id_producto 
            AND s.id_almacen = NEW.id_almacen;

            -- Incremento en cantidad
            IF TG_OP = 'UPDATE' AND NEW.cantidad > OLD.cantidad THEN
                -- Verificar si hay suficiente stock disponible para incrementar
                IF stock_actual < (NEW.cantidad - OLD.cantidad) THEN
                    RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.descripcion;
                ELSE
                    -- Descontar solo el incremento de cantidad
                    UPDATE stock 
                    SET stock = stock - (NEW.cantidad - OLD.cantidad)
                    WHERE id_producto = NEW.id_producto 
                    AND id_almacen = NEW.id_almacen;
                    insert into movimientos_stock (id_almacen,id_producto,tipo_movimiento,cantidad,fecha,detalle,origen)
                    values(new.id_almacen,new.id_producto,'salida',new.cantidad,now(),'se edito el detalle de venta','ventas');
                END IF;
            END IF;

            -- Decremento en cantidad
            IF TG_OP = 'UPDATE' AND NEW.cantidad < OLD.cantidad THEN
                -- Aumentar el stock con la cantidad reducida
                UPDATE stock 
                SET stock = stock + (OLD.cantidad - NEW.cantidad)
                WHERE id_producto = NEW.id_producto 
                AND id_almacen = NEW.id_almacen;
                insert into movimientos_stock (id_almacen,id_producto,tipo_movimiento,cantidad,fecha,detalle,origen)
                values(new.id_almacen,new.id_producto,'ingreso',new.cantidad,now(),'se edito el detalle de venta','ventas');
            END IF;

            -- Inserción de nueva cantidad
            IF TG_OP = 'INSERT' THEN
                -- Verificar si hay suficiente stock para la cantidad solicitada
                IF stock_actual < NEW.cantidad THEN
                    RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.descripcion;
                ELSE
                    -- Descontar el stock directamente
                    UPDATE stock 
                    SET stock = stock - NEW.cantidad
                    WHERE id_producto = NEW.id_producto 
                    AND id_almacen = NEW.id_almacen;
                    insert into movimientos_stock (id_almacen,id_producto,tipo_movimiento,cantidad,fecha,detalle,origen)
                    values(new.id_almacen,new.id_producto,'ingreso',new.cantidad,now(),'nuevo registro','ventas');
                END IF;
            END IF;

        
        END IF;

        RETURN NEW;
    END;$$;


    ALTER FUNCTION public.validarstock() OWNER TO postgres;


------------------------------------------------------------------------------
-- TRIGGERS: --
------------------------------------------------------------------------------


------------------------------------------------------------------------------
-- asignarclientegenericotriggerupdate: --
------------------------------------------------------------------------------
CREATE TRIGGER asignarclientegenericotriggerupdate AFTER UPDATE ON public.ventas FOR EACH ROW EXECUTE FUNCTION public.asignarclientegenerico();


------------------------------------------------------------------------------
-- asignarclientegenericotrigger: --
------------------------------------------------------------------------------
CREATE TRIGGER asignarclientegenericotrigger AFTER INSERT ON public.ventas FOR EACH ROW EXECUTE FUNCTION public.asignarclientegenerico();


------------------------------------------------------------------------------
-- insertarimpresoratrigger: --
------------------------------------------------------------------------------
CREATE TRIGGER insertarimpresoratrigger AFTER INSERT ON public.caja FOR EACH ROW EXECUTE FUNCTION public.insertarimpresora();


------------------------------------------------------------------------------
------------------------------------------------------------------------------
-- TRIGGERS: --
------------------------------------------------------------------------------
------------------------------------------------------------------------------
CREATE TRIGGER insertarserializacionestrigger AFTER INSERT ON public.sucursales FOR EACH ROW EXECUTE FUNCTION public.insertarserializaciones();


------------------------------------------------------------------------------
-- pordefectotrigger: --
------------------------------------------------------------------------------
CREATE TRIGGER pordefectotrigger AFTER INSERT ON public.empresa FOR EACH ROW EXECUTE FUNCTION public.insertpordefecto();


------------------------------------------------------------------------------
-- triggerdevolverstockaleliminardv: --
------------------------------------------------------------------------------
CREATE TRIGGER triggerdevolverstockaleliminardv AFTER DELETE ON public.detalle_venta FOR EACH ROW EXECUTE FUNCTION public.devolverstockaleliminardv();


------------------------------------------------------------------------------
-- triggereliminardetalleventa: --
------------------------------------------------------------------------------
CREATE TRIGGER triggereliminardetalleventa AFTER UPDATE ON public.detalle_venta FOR EACH ROW EXECUTE FUNCTION public.deletedetalleventa();


------------------------------------------------------------------------------
-- triggerinsertarpermisohome: --
------------------------------------------------------------------------------
CREATE TRIGGER triggerinsertarpermisohome AFTER INSERT ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.insertarpermisohome();


------------------------------------------------------------------------------
-- triggervalidarstock: --
------------------------------------------------------------------------------
CREATE TRIGGER triggervalidarstock BEFORE INSERT OR UPDATE ON public.detalle_venta FOR EACH ROW EXECUTE FUNCTION public.validarstock();