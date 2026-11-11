<?php
/**
 * Ventas de SpaceShop para el panel de Admin: datos del dashboard de ventas
 * (JSON) y descarga del reporte mensual en Excel (solo admins).
 */

namespace App\Http\Controllers;

use App\Services\SalesReportExporter;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SalesReportController extends Controller
{
    /**
     * KPIs, ventas por día y por producto del mes elegido, para las gráficas.
     */
    public function data(Request $request, SalesReportExporter $exporter)
    {
        return response()->json($exporter->summary($this->month($request)));
    }

    public function download(Request $request, SalesReportExporter $exporter)
    {
        $month = $this->month($request);

        $book = $exporter->build($month);
        $writer = new Xlsx($book);
        $writer->setIncludeCharts(true);

        $filename = 'reporte-ventas-' . $month->format('Y-m') . '.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'no-store',
        ]);
    }

    /** Mes pedido en ?mes=AAAA-MM; por defecto, el mes actual. */
    private function month(Request $request): CarbonImmutable
    {
        $data = $request->validate([
            'mes' => ['nullable', 'date_format:Y-m'],
        ], [
            'mes.date_format' => 'Elige un mes válido para el reporte.',
        ]);

        return isset($data['mes'])
            ? CarbonImmutable::createFromFormat('!Y-m', $data['mes'])
            : CarbonImmutable::now()->startOfMonth();
    }
}
