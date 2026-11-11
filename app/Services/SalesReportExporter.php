<?php
/**
 * Genera el reporte mensual de ventas de SpaceShop en Excel (.xlsx) con
 * gráficas nativas: hoja "Resumen" (KPIs, ventas por día y por producto),
 * hoja "Pedidos" (un renglón por artículo cobrado) y hoja "No cobrados"
 * (pedidos pendientes o cancelados del mes, para conciliar con Stripe).
 */

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesReportExporter
{
    private const RED = 'D42410';
    private const MONEY = '"$"#,##0.00';
    private const DATE = 'dd/mm/yyyy hh:mm';

    public const PRODUCT_LABELS = [
        'card' => 'Tarjeta',
        'bracelet' => 'Pulsera',
        'review_plate' => 'Placa de reseñas',
    ];

    private const STATUS_LABELS = [
        'pending' => 'Pendiente de pago',
        'paid' => 'Pagado',
        'completed' => 'Completado',
        'cancelled' => 'Cancelado',
    ];

    private const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
        'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    /**
     * Pedidos cobrados del mes. Una venta cuenta en el mes en que se cobró
     * (paid_at); los pedidos anteriores a Stripe no tienen paid_at y usan su
     * fecha de creación.
     */
    public function sales(CarbonImmutable $month): Collection
    {
        return Order::with(['items', 'user'])
            ->where('is_test', false)   // los pedidos de prueba de admin no son ventas
            ->whereIn('status', Order::PAID_STATUSES)
            ->whereRaw('COALESCE(paid_at, created_at) BETWEEN ? AND ?', [$month->startOfMonth(), $month->endOfMonth()])
            ->orderByRaw('COALESCE(paid_at, created_at)')
            ->get();
    }

    /** Pedidos del mes que no se cobraron (pendientes o cancelados). */
    public function unpaid(CarbonImmutable $month): Collection
    {
        return Order::with('items')
            ->where('is_test', false)
            ->whereNotIn('status', Order::PAID_STATUSES)
            ->whereBetween('created_at', [$month->startOfMonth(), $month->endOfMonth()])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Datos del mes para el dashboard de ventas del panel de Admin:
     * KPIs, serie por día, desglose por producto y comparación con el mes anterior.
     */
    public function summary(CarbonImmutable $month): array
    {
        $start = $month->startOfMonth();
        $sales = $this->sales($start);
        $unpaid = $this->unpaid($start);
        $items = $sales->flatMap->items;
        $revenue = (float) $sales->sum('total');
        $count = $sales->count();

        $prev = $this->sales($start->subMonth());
        $prevRevenue = (float) $prev->sum('total');

        $byDay = $sales->groupBy(fn (Order $o) => ($o->paid_at ?? $o->created_at)->day);
        $days = [];
        for ($d = 1; $d <= $start->daysInMonth; $d++) {
            $dayOrders = $byDay->get($d, collect());
            $days[] = ['day' => $d, 'orders' => $dayOrders->count(), 'revenue' => round((float) $dayOrders->sum('total'), 2)];
        }

        $products = [];
        foreach (self::PRODUCT_LABELS as $type => $label) {
            $ofType = $items->where('product_type', $type);
            $products[] = [
                'type' => $type,
                'label' => $label,
                'units' => (int) $ofType->sum('quantity'),
                'revenue' => round((float) $ofType->sum(fn (OrderItem $it) => $it->price * $it->quantity), 2),
            ];
        }

        return [
            'month' => $start->format('Y-m'),
            'label' => ucfirst($this->monthLabel($start)),
            'kpis' => [
                'revenue' => round($revenue, 2),
                'orders' => $count,
                'average' => $count ? round($revenue / $count, 2) : 0,
                'units' => (int) $items->sum('quantity'),
                'unpaid' => $unpaid->count(),
                'prev_revenue' => round($prevRevenue, 2),
                'prev_orders' => $prev->count(),
            ],
            'days' => $days,
            'products' => $products,
            'orders' => $sales->sortByDesc(fn (Order $o) => $o->paid_at ?? $o->created_at)->values()->map(fn (Order $o) => [
                'id' => $o->id,
                'folio' => $this->folio($o),
                'date' => ($o->paid_at ?? $o->created_at)->format('d/m/Y H:i'),
                'customer' => $o->customer_name,
                'email' => $o->customer_email,
                'status' => self::STATUS_LABELS[$o->status] ?? $o->status,
                'items' => $o->items->map(fn ($it) => (self::PRODUCT_LABELS[$it->product_type] ?? $it->product_type) . ' ×' . $it->quantity)->implode(', '),
                'total' => (float) $o->total,
            ]),
        ];
    }

    /**
     * Arma el libro de Excel del mes indicado (día 1 del mes, zona de la app).
     */
    public function build(CarbonImmutable $month): Spreadsheet
    {
        $start = $month->startOfMonth();
        $sales = $this->sales($start);
        $unpaid = $this->unpaid($start);

        $book = new Spreadsheet();
        $book->getProperties()
            ->setCreator('SpaceCard')
            ->setTitle('Reporte de ventas ' . $this->monthLabel($start));

        $summary = $book->getActiveSheet()->setTitle('Resumen');
        $this->fillSummary($summary, $start, $sales);
        $this->fillOrders($book->createSheet()->setTitle('Pedidos'), $sales);
        $this->fillUnpaid($book->createSheet()->setTitle('No cobrados'), $unpaid);

        $book->setActiveSheetIndex(0);

        return $book;
    }

    public function monthLabel(CarbonImmutable $month): string
    {
        return self::MONTHS[$month->month - 1] . ' ' . $month->year;
    }

    private function fillSummary(Worksheet $sheet, CarbonImmutable $start, Collection $sales): void
    {
        $revenue = (float) $sales->sum('total');
        $count = $sales->count();
        $items = $sales->flatMap->items;

        $sheet->setCellValue('A1', 'Reporte de ventas SpaceShop · ' . ucfirst($this->monthLabel($start)));
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setRGB(self::RED);
        $sheet->setCellValue('A2', 'Solo pedidos cobrados (pagados o completados). Generado el ' . now()->format('d/m/Y H:i') . '.');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setRGB('737373');

        // KPIs
        $kpis = [
            ['Ingresos del mes', $revenue, self::MONEY],
            ['Pedidos cobrados', $count, '0'],
            ['Ticket promedio', $count ? $revenue / $count : 0, self::MONEY],
            ['Unidades vendidas', (int) $items->sum('quantity'), '0'],
        ];
        $this->header($sheet, 'A4', ['Indicador', 'Valor']);
        foreach ($kpis as $i => [$label, $value, $format]) {
            $row = 5 + $i;
            $sheet->setCellValue("A{$row}", $label);
            $sheet->setCellValue("B{$row}", $value);
            $sheet->getStyle("B{$row}")->getNumberFormat()->setFormatCode($format);
            $sheet->getStyle("B{$row}")->getFont()->setBold(true);
        }
        $this->box($sheet, 'A4:B8');

        // Ventas por tipo de producto (fila 11 en adelante)
        $this->header($sheet, 'A11', ['Producto', 'Unidades', 'Ingresos']);
        $row = 12;
        foreach (self::PRODUCT_LABELS as $type => $label) {
            $ofType = $items->where('product_type', $type);
            $sheet->setCellValue("A{$row}", $label);
            $sheet->setCellValue("B{$row}", (int) $ofType->sum('quantity'));
            $sheet->setCellValue("C{$row}", (float) $ofType->sum(fn (OrderItem $it) => $it->price * $it->quantity));
            $sheet->getStyle("C{$row}")->getNumberFormat()->setFormatCode(self::MONEY);
            $row++;
        }
        $this->box($sheet, 'A11:C14');

        // Ventas por día (todas las fechas del mes, aunque estén en cero)
        $byDay = $sales->groupBy(fn (Order $o) => ($o->paid_at ?? $o->created_at)->day);
        $this->header($sheet, 'E4', ['Día', 'Pedidos', 'Ingresos']);
        $days = $start->daysInMonth;
        for ($d = 1; $d <= $days; $d++) {
            $r = 4 + $d;
            $dayOrders = $byDay->get($d, collect());
            $sheet->setCellValue("E{$r}", $start->day($d)->format('d/m'));
            $sheet->setCellValue("F{$r}", $dayOrders->count());
            $sheet->setCellValue("G{$r}", (float) $dayOrders->sum('total'));
            $sheet->getStyle("G{$r}")->getNumberFormat()->setFormatCode(self::MONEY);
        }
        $lastDay = 4 + $days;
        $this->box($sheet, "E4:G{$lastDay}");

        foreach (['A' => 22, 'B' => 14, 'C' => 14, 'D' => 3, 'E' => 10, 'F' => 10, 'G' => 14] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        // Gráfica 1: ingresos por día (columnas)
        $sheet->addChart($this->chart(
            'ventas_por_dia',
            'Ingresos por día',
            DataSeries::TYPE_BARCHART,
            "'Resumen'!\$G\$4",
            "'Resumen'!\$E\$5:\$E\${$lastDay}",
            "'Resumen'!\$G\$5:\$G\${$lastDay}",
            $days,
            'I2',
            'T20',
        ));

        // Gráfica 2: ingresos por tipo de producto (pastel)
        $sheet->addChart($this->chart(
            'ventas_por_producto',
            'Ingresos por tipo de producto',
            DataSeries::TYPE_PIECHART,
            "'Resumen'!\$C\$11",
            "'Resumen'!\$A\$12:\$A\$14",
            "'Resumen'!\$C\$12:\$C\$14",
            3,
            'I22',
            'P40',
        ));
    }

    private function fillOrders(Worksheet $sheet, Collection $sales): void
    {
        $this->header($sheet, 'A1', [
            'Folio', 'Fecha de pago', 'Fecha del pedido', 'Cliente', 'Email', 'Cuenta SpaceCard',
            'Estado', 'Producto', 'Cantidad', 'Precio unitario', 'Subtotal artículo',
            'Modo de diseño', 'Color principal', 'Color secundario', 'Total del pedido',
            'Dirección de envío', 'Pago Stripe',
        ]);

        $row = 2;
        foreach ($sales as $order) {
            $items = $order->items->isEmpty() ? [null] : $order->items;
            foreach ($items as $item) {
                $sheet->fromArray([
                    $this->folio($order),
                    $this->excelDate($order->paid_at ?? $order->created_at),
                    $this->excelDate($order->created_at),
                    $order->customer_name,
                    $order->customer_email,
                    $order->user ? $order->user->email : 'Invitado',
                    self::STATUS_LABELS[$order->status] ?? $order->status,
                    $item ? (self::PRODUCT_LABELS[$item->product_type] ?? $item->product_type) : '—',
                    $item?->quantity,
                    $item ? (float) $item->price : null,
                    $item ? (float) $item->price * $item->quantity : null,
                    $item ? $this->designMode($item) : '—',
                    $item?->color_primary,
                    $item?->color_secondary,
                    (float) $order->total,
                    $order->shipping_address,
                    $order->stripe_payment_intent_id,
                ], null, "A{$row}", true);
                $row++;
            }
        }

        $this->formatTable($sheet, $row - 1, 'Q', ['B', 'C'], ['J', 'K', 'O'], 'P');

        if ($row === 2) {
            $sheet->setCellValue('A2', 'No hubo ventas cobradas en este mes.');
        }
    }

    private function fillUnpaid(Worksheet $sheet, Collection $orders): void
    {
        $this->header($sheet, 'A1', [
            'Folio', 'Fecha del pedido', 'Cliente', 'Email', 'Estado', 'Artículos', 'Unidades',
            'Total', 'Dirección de envío',
        ]);

        $row = 2;
        foreach ($orders as $order) {
            $sheet->fromArray([
                $this->folio($order),
                $this->excelDate($order->created_at),
                $order->customer_name,
                $order->customer_email,
                self::STATUS_LABELS[$order->status] ?? $order->status,
                $order->items->map(fn ($it) => (self::PRODUCT_LABELS[$it->product_type] ?? $it->product_type) . ' ×' . $it->quantity)->implode(', '),
                (int) $order->items->sum('quantity'),
                (float) $order->total,
                $order->shipping_address,
            ], null, "A{$row}", true);
            $row++;
        }

        $this->formatTable($sheet, $row - 1, 'I', ['B'], ['H'], 'I');

        if ($row === 2) {
            $sheet->setCellValue('A2', 'No hubo pedidos sin cobrar en este mes.');
        }
    }

    // ----------------------------------------------------------------- helpers

    private function folio(Order $order): string
    {
        return '#SPC-' . (10000 + $order->id);
    }

    private function excelDate($date): ?float
    {
        return $date ? \PhpOffice\PhpSpreadsheet\Shared\Date::PHPToExcel($date->copy()->setTimezone(config('app.timezone'))) : null;
    }

    private function designMode(OrderItem $item): string
    {
        $design = $item->design_config ?? [];
        if (($design['mode'] ?? null) === 'preset') {
            return 'Catálogo · ' . ($design['preset_name'] ?? 'sin nombre');
        }

        return $item->product_type === 'card' || $design ? 'Personalizado' : 'Estándar';
    }

    private function header(Worksheet $sheet, string $from, array $labels): void
    {
        $sheet->fromArray($labels, null, $from);
        [$col, $row] = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::coordinateFromString($from);
        $last = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(
            \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($col) + count($labels) - 1
        );
        $style = $sheet->getStyle("{$from}:{$last}{$row}");
        $style->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $style->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0A0A0A');
    }

    private function box(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('D4D4D4');
    }

    private function formatTable(Worksheet $sheet, int $lastRow, string $lastCol, array $dateCols, array $moneyCols, string $wrapCol): void
    {
        $lastRow = max($lastRow, 2);
        foreach ($dateCols as $c) {
            $sheet->getStyle("{$c}2:{$c}{$lastRow}")->getNumberFormat()->setFormatCode(self::DATE);
        }
        foreach ($moneyCols as $c) {
            $sheet->getStyle("{$c}2:{$c}{$lastRow}")->getNumberFormat()->setFormatCode(self::MONEY);
        }
        foreach (range('A', $lastCol) as $c) {
            $sheet->getColumnDimension($c)->setAutoSize(true);
        }
        $sheet->getColumnDimension($wrapCol)->setAutoSize(false)->setWidth(45);
        $sheet->getStyle("{$wrapCol}2:{$wrapCol}{$lastRow}")->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
        $this->box($sheet, "A1:{$lastCol}{$lastRow}");
        $sheet->setAutoFilter("A1:{$lastCol}{$lastRow}");
        $sheet->freezePane('A2');
    }

    private function chart(string $name, string $title, string $type, string $seriesLabel, string $categories, string $values, int $points, string $topLeft, string $bottomRight): Chart
    {
        $series = new DataSeries(
            $type,
            $type === DataSeries::TYPE_PIECHART ? null : DataSeries::GROUPING_CLUSTERED,
            [0],
            [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, $seriesLabel, null, 1)],
            [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, $categories, null, $points)],
            [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, $values, null, $points)],
        );
        if ($type === DataSeries::TYPE_BARCHART) {
            $series->setPlotDirection(DataSeries::DIRECTION_COL);
            $series->getPlotValuesByIndex(0)->setFillColor(self::RED);
        } else {
            $series->getPlotValuesByIndex(0)->setFillColor(['D42410', '0A0A0A', 'A3A3A3']);
        }

        $chart = new Chart(
            $name,
            new Title($title),
            $type === DataSeries::TYPE_PIECHART ? new Legend(Legend::POSITION_RIGHT, null, false) : null,
            new PlotArea(null, [$series]),
        );
        $chart->setTopLeftPosition($topLeft);
        $chart->setBottomRightPosition($bottomRight);

        return $chart;
    }
}
