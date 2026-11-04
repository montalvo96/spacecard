/**
 * Escena Three.js de los productos físicos (SpaceCard y SpaceBand).
 * Este módulo arrastra toda la librería: impórtalo solo con import() dinámico.
 *
 * Autor: SpaceCard 2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const BASE = '/models';
const TARGET_SIZE = 3;
const AUTO_ROTATE_RESUME_MS = 3000;

const PRODUCTS = {
    card: {
        model: `${BASE}/spacecard.glb`,
        color: (name) => `${BASE}/textures/card-${name}.png`,
        roughnessMap: `${BASE}/textures/card-roughness.jpg`,
        normalMap: `${BASE}/textures/card-normal.jpg`,
        // El FBX trae la tarjeta acostada: la paramos de frente a la cámara.
        rotation: [Math.PI / 2, 0, 0],
    },
    band: {
        model: `${BASE}/spaceband.glb`,
        color: (name) => `${BASE}/textures/band-${name}.jpg`,
        roughnessMap: `${BASE}/textures/band-roughness.jpg`,
        rotation: [0.35, 0, 0],
    },
};

export function createProductScene(container, { autoRotate = true } = {}) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = environment;
    scene.environmentIntensity = 0.75;

    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(3, 5, 6);
    scene.add(key);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 6.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false; // la rueda debe seguir desplazando la página
    controls.enableDamping = true;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = (Math.PI * 5) / 6;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.6;
    // OrbitControls fija touch-action: none, que en móvil atraparía el scroll de la página.
    renderer.domElement.style.touchAction = 'pan-y';

    let resumeTimer;
    const onStart = () => {
        clearTimeout(resumeTimer);
        controls.autoRotate = false;
    };
    const onEnd = () => {
        if (!autoRotate) return;
        resumeTimer = setTimeout(() => {
            controls.autoRotate = true;
        }, AUTO_ROTATE_RESUME_MS);
    };
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);

    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const groups = {}; // producto -> Promise<Group>
    const textures = {}; // url -> Promise<Texture>
    let currentGroup = null;
    let requestId = 0;
    let disposed = false;

    function loadTexture(url, srgb = false) {
        textures[url] ??= textureLoader.loadAsync(url).then((texture) => {
            if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return texture;
        });
        return textures[url];
    }

    function loadProduct(product) {
        groups[product] ??= (async () => {
            const config = PRODUCTS[product];
            const [gltf, roughnessMap, normalMap] = await Promise.all([
                gltfLoader.loadAsync(config.model),
                loadTexture(config.roughnessMap),
                config.normalMap ? loadTexture(config.normalMap) : null,
            ]);

            const model = gltf.scene;
            model.rotation.set(...config.rotation);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        roughnessMap,
                        normalMap,
                        side: THREE.DoubleSide,
                    });
                }
            });

            // Normaliza tamaño y centro: los FBX vienen en escalas muy distintas.
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            model.scale.setScalar(
                TARGET_SIZE / Math.max(size.x, size.y, size.z),
            );
            model.position.sub(
                box
                    .getCenter(new THREE.Vector3())
                    .multiplyScalar(model.scale.x),
            );

            const group = new THREE.Group();
            group.add(model);
            return group;
        })();
        return groups[product];
    }

    async function show(product, color) {
        const id = ++requestId;
        const [group, map] = await Promise.all([
            loadProduct(product),
            loadTexture(PRODUCTS[product].color(color), true),
        ]);
        // Se desmontó, o el usuario ya eligió otra cosa mientras esto cargaba.
        if (disposed || id !== requestId) return;

        group.traverse((child) => {
            if (child.isMesh) {
                child.material.map = map;
                child.material.needsUpdate = true;
            }
        });
        if (currentGroup !== group) {
            if (currentGroup) scene.remove(currentGroup);
            scene.add(group);
            currentGroup = group;
        }
    }

    function resize() {
        const { clientWidth: width, clientHeight: height } = container;
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    function frame() {
        controls.update();
        renderer.render(scene, camera);
    }
    // No gasta GPU ni batería mientras el visor está fuera de pantalla.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
        renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
    });
    visibilityObserver.observe(container);

    function dispose() {
        disposed = true;
        clearTimeout(resumeTimer);
        renderer.setAnimationLoop(null);
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        controls.removeEventListener('start', onStart);
        controls.removeEventListener('end', onEnd);
        controls.dispose();
        Object.values(textures).forEach((promise) =>
            promise.then(
                (texture) => texture.dispose(),
                () => {},
            ),
        );
        Object.values(groups).forEach((promise) =>
            promise.then(
                (group) =>
                    group.traverse((child) => {
                        if (child.isMesh) {
                            child.geometry.dispose();
                            child.material.dispose();
                        }
                    }),
                () => {},
            ),
        );
        environment.dispose();
        renderer.dispose();
        renderer.domElement.remove();
    }

    return { show, dispose };
}
