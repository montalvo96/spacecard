/**
 * Configuración e inicialización de librerías JS globales (Axios).
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
