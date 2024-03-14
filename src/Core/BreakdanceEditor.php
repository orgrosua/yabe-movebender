<?php

/*
 * This file is part of the Yabe package.
 *
 * (c) Joshua Gugun Siagian <suabahasa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare(strict_types=1);

namespace Yabe\Movebender\Core;

use Exception;
use MOVEBENDER;
use Yabe\Movebender\Utils\AssetVite;

/**
 * @since 1.0.0
 */
class BreakdanceEditor
{
    /**
     * Stores the instance, implementing a Singleton pattern.
     */
    private static self $instance;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private function __construct()
    {
    }

    /**
     * Singletons should not be cloneable.
     */
    private function __clone()
    {
    }

    /**
     * Singletons should not be restorable from strings.
     *
     * @throws Exception Cannot unserialize a singleton.
     */
    public function __wakeup()
    {
        throw new Exception('Cannot unserialize a singleton.');
    }

    /**
     * This is the static method that controls the access to the singleton
     * instance. On the first run, it creates a singleton object and places it
     * into the static property. On subsequent runs, it returns the client existing
     * object stored in the static property.
     */
    public static function get_instance(): self
    {
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function init()
    {
        add_action('wp', fn () => $this->editor_assets(), 1_000_001);
    }

    public function editor_assets()
    {
        if (!isset($_GET['breakdance']) || $_GET['breakdance'] !== 'builder') {
            return;
        }

        do_action('a!yabe/movebender/core/breakdanceeditor:editor_assets.start');

        $localize = json_encode([
            '_version' => MOVEBENDER::VERSION,
            '_wpnonce' => wp_create_nonce(MOVEBENDER::WP_OPTION),
            'rest_api' => [
                'nonce' => wp_create_nonce('wp_rest'),
                // 'root' => esc_url_raw(rest_url()),
                'namespace' => MOVEBENDER::REST_NAMESPACE,
                // 'url' => esc_url_raw(rest_url(MOVEBENDER::REST_NAMESPACE)),
            ],
            'assets' => [
                'url' => AssetVite::asset_base_url(),
            ],
            'site_meta' => [
                'name' => get_bloginfo('name'),
                'site_url' => get_site_url(),
            ],
        ]);

        $assets = AssetVite::get_instance()->get_assets('assets/breakdance/main.js', [
            'handle' => MOVEBENDER::WP_OPTION . ':editor',
            'in_footer' => true,
        ], true);

        echo <<<HTML
            <script>
                window.movebender = window.movebender || {};
                window.movebender = Object.assign(window.movebender, {$localize});
            </script>
        HTML;

        foreach ($assets['scripts'] as $asset) {
            echo sprintf('<script type="module" src="%s"></script>', $asset);
        }

        foreach ($assets['styles'] as $asset) {
            echo sprintf('<link rel="stylesheet" href="%s">', $asset);
        }

        do_action('a!yabe/movebender/core/breakdanceeditor:editor_assets.end');
    }
}
