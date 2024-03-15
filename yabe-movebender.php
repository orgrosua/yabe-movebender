<?php

/**
 * Yabe Movebender - The Breakdance builder extension
 *
 * @wordpress-plugin
 * Plugin Name:         Yabe Movebender
 * Plugin URI:          https://movebender.yabe.land
 * Description:         The Breakdance builder extension
 * Version:             1.0.4
 * Requires at least:   6.0
 * Requires PHP:        7.4
 * Author:              Rosua
 * Author URI:          https://yabe.land
 * Donate link:         https://ko-fi.com/Q5Q75XSF7
 * Text Domain:         yabe-movebender
 * Domain Path:         /languages
 *
 * @package             Yabe
 * @author              Joshua Gugun Siagian <suabahasa@gmail.com>
 */

declare(strict_types=1);

use Yabe\Movebender\Plugin;
use Yabe\Movebender\Utils\Requirement;

defined('ABSPATH') || exit;

if (file_exists(__DIR__ . '/vendor/scoper-autoload.php')) {
    require_once __DIR__ . '/vendor/scoper-autoload.php';
} else {
    require_once __DIR__ . '/vendor/autoload.php';
}

$requirement = new Requirement();
$requirement
    ->php('7.4')
    ->wp('6.0')
    ->plugins([
        [
            'name' => 'Breakdance',
            'slug' => 'breakdance/plugin.php',
            'version' => '1.7.0'
        ]
    ]);

if ($requirement->met()) {
    Plugin::get_instance()->boot();
} else {
    add_action('admin_notices', fn () => $requirement->printNotice(), 0, 0);
}
