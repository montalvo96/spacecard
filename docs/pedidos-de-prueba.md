# Pedidos de prueba (solo administradores)

## ¿Para qué sirve?

Para probar SpaceCard de punta a punta **sin pagar**: diseñar una tarjeta en
SpaceShop, revisarla en Producción, generar su código/QR real e imprimirla en
la impresora de tarjetas. Útil para demos, para que alguien del equipo pruebe
la app y para calibrar la impresora.

Un pedido de prueba:

- **No pasa por Stripe** (no se cobra nada).
- **No cuenta en Ventas** ni en el reporte de Excel.
- Aparece en **Órdenes de Compra** y en **Producción** con la etiqueta negra
  **PRUEBA**, y sigue el mismo flujo que un pedido real.
- Se puede **borrar** cuando ya no sirva.

Los clientes nunca ven esta opción: solo aparece si entraste con una cuenta
de administrador.

## Cómo usarlo

1. Entra con tu cuenta de administrador y abre **SpaceShop** (`/comprar`).
2. Diseña la tarjeta y agrégala al carrito, como cualquier cliente.
3. Llena los datos de entrega (pueden ser de prueba).
4. Activa el interruptor **"Pedido de prueba (sin pago)"**, justo arriba del
   botón. El botón cambia a **"Guardar pedido de prueba · sin cobro"**.
5. Presiónalo. Te lleva directo a **Producción**, donde ya está el pedido con
   la etiqueta PRUEBA.

Si el interruptor está **apagado** (así viene siempre al abrir la tienda), la
compra es normal y se cobra con Stripe. Así lo "desactivas".

## Imprimir la prueba

1. En **Admin → Órdenes de Compra**, busca el pedido (etiqueta PRUEBA) y usa
   **"Fabricar y generar dispositivos"**. Esto crea las tarjetas con su código
   y QR reales.
2. En **Producción**, abre el pedido e imprímelo como uno normal (hoja de
   impresión a tamaño real CR80) y márcalo como impreso.

Como el pedido se hizo con tu cuenta, las tarjetas generadas quedan a tu
nombre y aparecen en **Mi panel → Mis dispositivos**, para probar también el
escaneo con el celular.

## Borrar una prueba

En **Admin → Órdenes de Compra**, el pedido de prueba tiene el botón
**"Borrar pedido de prueba"**. Borra el pedido, sus artículos, las tarjetas que
se generaron para él (con sus escaneos) y el lote automático si queda vacío.
No se puede deshacer, y solo funciona con pedidos marcados como prueba: los
pedidos reales no se pueden borrar desde ahí.
