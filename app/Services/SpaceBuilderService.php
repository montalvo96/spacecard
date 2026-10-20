<?php
/**
 * Módulo C · Spaces — Lógica del constructor de micrositios.
 *
 * Reimplementa limpio lo que avaspace repartía entre `Space_personal` y
 * `Molde_spaces`: alta/edición/reordenamiento de bloques ricos, catálogo y
 * la plantilla inicial (los "moldes" que sembraban secciones al crear).
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Services;

use App\Enums\SpaceBlockType;
use App\Models\Space;
use App\Models\SpaceBlock;
use App\Models\SpaceProduct;
use App\Models\SpaceProductCategory;
use Illuminate\Support\Facades\DB;

class SpaceBuilderService
{
    /**
     * Agrega un bloque al final del Space y devuelve el bloque creado.
     *
     * @param  array<string, mixed>  $attributes  label, heading, url, icon...
     * @param  array<string, mixed>  $data        payload propio del tipo de bloque
     */
    public function addBlock(
        Space $space,
        SpaceBlockType $type,
        array $attributes = [],
        array $data = [],
    ): SpaceBlock {
        $position = (int) $space->blocks()->max('position') + 1;

        return $space->blocks()->create([
            'type'      => $type,
            'label'     => $attributes['label'] ?? $type->label(),
            'heading'   => $attributes['heading'] ?? null,
            'url'       => $attributes['url'] ?? null,
            'icon'      => $attributes['icon'] ?? null,
            'data'      => $data ?: null,
            'position'  => $position,
            'is_active' => $attributes['is_active'] ?? true,
        ]);
    }

    /**
     * Actualiza un bloque; fusiona el payload `data` en vez de reemplazarlo.
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>|null  $data
     */
    public function updateBlock(SpaceBlock $block, array $attributes = [], ?array $data = null): SpaceBlock
    {
        $block->fill(array_intersect_key($attributes, array_flip(
            ['label', 'heading', 'url', 'icon', 'is_active']
        )));

        if ($data !== null) {
            $block->data = array_merge($block->data ?? [], $data);
        }

        $block->save();

        return $block;
    }

    /**
     * Reordena los bloques de un Space según una lista de IDs.
     * Solo toca bloques que pertenezcan al Space (seguridad).
     *
     * @param  array<int, int>  $orderedIds
     */
    public function reorder(Space $space, array $orderedIds): void
    {
        DB::transaction(function () use ($space, $orderedIds) {
            $position = 1;
            foreach ($orderedIds as $id) {
                $space->blocks()->whereKey($id)->update(['position' => $position++]);
            }
        });
    }

    /**
     * Elimina un bloque y compacta las posiciones restantes.
     */
    public function removeBlock(SpaceBlock $block): void
    {
        DB::transaction(function () use ($block) {
            $spaceId = $block->space_id;
            $block->delete();

            SpaceBlock::where('space_id', $spaceId)
                ->orderBy('position')
                ->get()
                ->each(fn (SpaceBlock $b, int $i) => $b->update(['position' => $i + 1]));
        });
    }

    /**
     * Siembra una plantilla inicial de secciones en un Space nuevo.
     * Equivale a `Molde_spaces::crear_molde_space` + crear_social/pasos/etc.
     */
    public function applyStarterTemplate(Space $space): void
    {
        $this->addBlock($space, SpaceBlockType::Header, [
            'label'   => $space->display_name,
            'heading' => $space->headline,
        ]);

        $this->addBlock($space, SpaceBlockType::Whatsapp, ['label' => 'Escríbeme por WhatsApp']);

        $this->addBlock($space, SpaceBlockType::Differentiator, ['heading' => 'Por qué elegirme'], [
            ['title' => 'Diferenciador 1', 'description' => '', 'icon' => 'star'],
            ['title' => 'Diferenciador 2', 'description' => '', 'icon' => 'shield'],
            ['title' => 'Diferenciador 3', 'description' => '', 'icon' => 'bolt'],
        ]);

        $this->addBlock($space, SpaceBlockType::Step, ['heading' => 'Cómo funciona'], [
            ['order' => 1, 'title' => 'Paso 1', 'description' => ''],
            ['order' => 2, 'title' => 'Paso 2', 'description' => ''],
            ['order' => 3, 'title' => 'Paso 3', 'description' => ''],
        ]);

        $this->addBlock($space, SpaceBlockType::Testimonial, ['heading' => 'Testimonios'], []);

        $this->addBlock($space, SpaceBlockType::Faq, ['heading' => 'Preguntas frecuentes'], [
            ['question' => '', 'answer' => ''],
        ]);
    }

    // ------------------------------------------------------------------
    // Catálogo (productos + categorías)
    // ------------------------------------------------------------------

    public function addCategory(Space $space, string $name): SpaceProductCategory
    {
        $position = (int) $space->categories()->max('position') + 1;

        return $space->categories()->create([
            'name'     => $name,
            'position' => $position,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes  name, description, price, currency, image_url, cta_url, category_id
     */
    public function addProduct(Space $space, array $attributes): SpaceProduct
    {
        $position = (int) $space->products()->max('position') + 1;

        return $space->products()->create([
            'category_id' => $attributes['category_id'] ?? null,
            'name'        => $attributes['name'],
            'description' => $attributes['description'] ?? null,
            'price'       => $attributes['price'] ?? null,
            'currency'    => $attributes['currency'] ?? 'MXN',
            'image_url'   => $attributes['image_url'] ?? null,
            'cta_url'     => $attributes['cta_url'] ?? null,
            'is_active'   => $attributes['is_active'] ?? true,
            'position'    => $position,
        ]);
    }
}
