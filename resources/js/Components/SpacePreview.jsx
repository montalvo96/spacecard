/**
 * Vista previa en vivo del Space dentro del editor. Usa la misma hoja de
 * estilos (public/css/space-themes.css) y la misma estructura que la página
 * pública resources/views/spaces/show.blade.php: si cambias una, cambia la otra.
 *
 * Se dibuja a 375 px de ancho (un celular real) y se escala para caber en el marco.
 */

import { useEffect } from 'react';

export const FONT_PAIRS = {
    Outfit_Inter: { label: 'Moderna', title: "'Outfit', sans-serif", body: "'Inter', sans-serif" },
    SpaceGrotesk_Inter: { label: 'Técnica', title: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif" },
    Playfair_Source: { label: 'Editorial', title: "'Playfair Display', serif", body: "'Source Sans 3', sans-serif" },
    Fraunces_Inter: { label: 'Elegante', title: "'Fraunces', serif", body: "'Inter', sans-serif" },
};

const FONTS_HREF =
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&display=swap';

/** Carga una sola vez la hoja de temas y las tipografías en el panel. */
function useSpaceAssets() {
    useEffect(() => {
        const add = (id, href) => {
            if (document.getElementById(id)) return;
            const l = document.createElement('link');
            l.id = id;
            l.rel = 'stylesheet';
            l.href = href;
            document.head.appendChild(l);
        };
        add('sp-themes-css', '/css/space-themes.css?v=20261112b');
        add('sp-fonts-css', FONTS_HREF);
    }, []);
}

const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

/** Luminancia relativa (WCAG) de un color hex. */
export function luminance(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrastRatio(a, b) {
    if (!isHex(a) || !isHex(b)) return 21;
    const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
}
/** Igual que Space::readableOn() en PHP. */
export const readableOn = (hex) => (isHex(hex) && luminance(hex) > 0.179 ? '#0b0b0b' : '#ffffff');

export function themeVars(cfg) {
    const p = cfg?.palette || {};
    const f = FONT_PAIRS[cfg?.font_pair] || FONT_PAIRS.Outfit_Inter;
    return {
        '--accent': p.primary,
        '--accent-2': p.secondary,
        '--bg': p.background,
        '--ink': p.text,
        '--on-accent': readableOn(p.primary),
        '--inv-bg': p.text,
        '--inv-ink': p.background,
        '--radius': cfg?.corner_radius || '12px',
        '--font-title': f.title,
        '--font-body': f.body,
    };
}

/** Igual que $linkIcon en show.blade.php. */
function linkIcon(type, url) {
    let host = '';
    try {
        host = new URL(/^[a-z]+:/i.test(url || '') ? url : `https://${url || ''}`).hostname.toLowerCase();
    } catch {
        host = '';
    }
    const map = [
        ['instagram', 'photo_camera'], ['linkedin', 'work'], ['youtube', 'play_circle'], ['youtu.be', 'play_circle'],
        ['tiktok', 'music_note'], ['spotify', 'music_note'], ['x.com', 'alternate_email'], ['twitter', 'alternate_email'],
        ['threads', 'alternate_email'], ['facebook', 'groups'], ['wa.me', 'chat'], ['whatsapp', 'chat'],
        ['calendly', 'calendar_month'], ['maps', 'location_on'],
    ];
    const hit = host && map.find(([n]) => host.includes(n));
    if (hit) return hit[1];
    return { social: 'share', whatsapp: 'chat', email: 'mail', phone: 'call', file: 'description', embed: 'play_circle' }[type] || 'link';
}

const Ms = ({ children, className = '' }) => (
    <span className={`ms ${className}`} aria-hidden="true">
        {children}
    </span>
);

function RichSection({ block }) {
    // Sin items vacíos (p. ej. una pregunta frecuente sin texto), igual que en la página pública.
    const items = (Array.isArray(block.data) ? block.data : []).filter(
        (it) => it && Object.entries(it).some(([k, v]) => !['icon', 'order', 'rating'].includes(k) && String(v ?? '').trim() !== ''),
    );
    if (!items.length) return null;
    const t = block.type;
    return (
        <section className="sp-card">
            {block.heading && <h2 className="sp-card-title">{block.heading}</h2>}
            {t === 'faq' ? (
                <div>
                    {items.map((it, i) => (
                        <details key={i} className="sp-faq">
                            <summary>
                                {it.question}
                                <Ms>expand_more</Ms>
                            </summary>
                            <p>{it.answer}</p>
                        </details>
                    ))}
                </div>
            ) : t === 'testimonial' ? (
                <div className="sp-list">
                    {items.map((it, i) => (
                        <figure key={i} className="sp-quote">
                            {!!it.rating && (
                                <div className="sp-stars">
                                    {Array.from({ length: Math.min(5, Number(it.rating) || 0) }).map((_, k) => (
                                        <Ms key={k}>star</Ms>
                                    ))}
                                </div>
                            )}
                            <p className="sp-quote-text">“{it.quote}”</p>
                            <figcaption className="sp-quote-by">
                                {it.author}
                                {it.role && <span> · {it.role}</span>}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            ) : t === 'step' ? (
                <div className="sp-list">
                    {items.map((it, i) => (
                        <div key={i} className="sp-row-item">
                            <span className="sp-step-n">{it.order || i + 1}</span>
                            <div>
                                <p className="sp-item-title">{it.title}</p>
                                {it.description && <p className="sp-item-desc">{it.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : t === 'client' ? (
                <div className="sp-chips">
                    {items.map((it, i) => (
                        <span key={i} className="sp-chip">
                            {it.logo_url && <img src={it.logo_url} alt="" />}
                            {it.name}
                        </span>
                    ))}
                </div>
            ) : t === 'media' ? (
                <div className="sp-gallery">
                    {items.filter((it) => it.image_url).map((it, i) => (
                        <figure key={i}>
                            <img src={it.image_url} alt="" />
                            {it.caption && <figcaption>{it.caption}</figcaption>}
                        </figure>
                    ))}
                </div>
            ) : (
                <div className="sp-list">
                    {items.map((it, i) => (
                        <div key={i} className="sp-row-item">
                            <Ms>check_circle</Ms>
                            <div>
                                <p className="sp-item-title">{it.title || it.name}</p>
                                {it.description && <p className="sp-item-desc">{it.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

const RICH = ['differentiator', 'step', 'faq', 'testimonial', 'client', 'media'];

function Btn({ icon, children, main = false }) {
    return (
        <a href="#" className={`sp-btn ${main ? 'sp-btn--main' : ''}`}>
            <span className="sp-btn-ic">
                <Ms>{icon}</Ms>
            </span>
            <span className="sp-btn-label">{children}</span>
        </a>
    );
}

/** Página del Space (mismo marcado que show.blade.php). */
export function SpacePage({ form, blocks, avatar, cover, preview = true, compact = false }) {
    const cfg = form.theme_config;
    const name = form.display_name || 'Tu nombre';
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const digits = (form.contact_phone || '').replace(/\D+/g, '');
    const icons = [
        form.contact_phone && { icon: 'call', label: 'Llamar' },
        digits && { icon: 'chat', label: 'WhatsApp' },
        form.contact_email && { icon: 'mail', label: 'Correo' },
        form.contact_website && { icon: 'language', label: 'Sitio web' },
    ].filter(Boolean);
    const hasContact = !!(form.contact_phone || form.contact_email || form.contact_website);
    const role = [form.headline || (preview ? 'Tu cargo o especialidad' : ''), form.company].filter(Boolean).join(' · ');
    const visible = blocks.filter((b) => b.is_active);
    const bgImage = cover || avatar;

    // En la vista previa nada navega.
    const stop = (e) => {
        if (e.target.closest('a, button, summary')) e.preventDefault();
    };

    return (
        <main
            className={`sp ${preview ? 'sp--preview' : ''}`}
            data-theme={form.theme_template}
            data-btn={cfg.button_style || 'filled'}
            data-avatar={cfg.avatar_shape}
            style={themeVars(cfg)}
            onClick={preview ? stop : undefined}
        >
            <div className="sp-bg" aria-hidden="true">
                {bgImage && <div className="sp-bg-img" style={{ backgroundImage: `url(${bgImage})` }} />}
            </div>

            <div className="sp-shell">
                {cover && <div className="sp-cover" style={{ backgroundImage: `url(${cover})` }} />}

                <header className="sp-profile">
                    <div className="sp-avatar">{avatar ? <img src={avatar} alt="" /> : <span>{initials}</span>}</div>
                    <h1 className="sp-name">{name}</h1>
                    {role && <p className="sp-role">{role}</p>}
                    {form.bio && <p className="sp-bio">{form.bio}</p>}
                    {icons.length > 0 && (
                        <nav className="sp-icons">
                            {icons.map((i) => (
                                <a key={i.icon} href="#" className="sp-icon" aria-label={i.label}>
                                    <Ms>{i.icon}</Ms>
                                </a>
                            ))}
                        </nav>
                    )}
                </header>

                <div className="sp-links">
                    {hasContact && (
                        <Btn icon="person_add" main>
                            Guardar contacto
                        </Btn>
                    )}
                    {visible.map((b) => {
                        if (b.type === 'header') return <h2 key={b._key} className="sp-heading">{b.heading || b.label || 'Encabezado'}</h2>;
                        if (RICH.includes(b.type)) return compact ? null : <RichSection key={b._key} block={b} />;
                        if (['video', 'catalog'].includes(b.type)) return null;
                        return (
                            <Btn key={b._key} icon={linkIcon(b.type, b.url)}>
                                {b.label || 'Nuevo enlace'}
                            </Btn>
                        );
                    })}
                </div>

                {!compact && (
                    <section className="sp-card sp-lead">
                        <h2 className="sp-card-title">¿Hablamos?</h2>
                        <p className="sp-lead-desc">Déjame tus datos y te escribo.</p>
                        <div className="sp-form">
                            <input className="sp-input" placeholder="Nombre" tabIndex={-1} readOnly />
                            <div className="sp-form-row">
                                <input className="sp-input" placeholder="Correo" tabIndex={-1} readOnly />
                                <input className="sp-input" placeholder="Teléfono" tabIndex={-1} readOnly />
                            </div>
                            <textarea className="sp-input" rows={3} tabIndex={-1} readOnly placeholder="¿En qué te puedo ayudar?" />
                            <button type="button" className="sp-btn sp-btn--main" tabIndex={-1}>
                                Enviar mensaje <Ms>send</Ms>
                            </button>
                        </div>
                    </section>
                )}

                <footer className="sp-foot">
                    <a href="#" className="sp-badge">
                        Hecho con <strong>SpaceCard</strong>
                    </a>
                </footer>
            </div>
        </main>
    );
}

/** Marco de celular con la página escalada adentro. */
export default function SpacePreview(props) {
    useSpaceAssets();
    const W = 375;
    const frameW = 272; // ancho interior del marco
    const scale = frameW / W;
    const innerH = 580;

    return (
        <div className="relative mx-auto w-[290px] rounded-[46px] bg-[#0B0B0B] p-[9px] shadow-[0_40px_80px_rgba(0,0,0,0.28)] ring-1 ring-black/10">
            <div className="absolute left-1/2 top-[18px] z-30 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
            <div className="relative overflow-hidden rounded-[38px]" style={{ height: innerH, background: props.form.theme_config?.palette?.background }}>
                <div className="sc-scroll h-full overflow-y-auto overflow-x-hidden">
                    <div style={{ width: W, zoom: scale }}>
                        <div style={{ minHeight: innerH / scale }} className="flex">
                            <SpacePage {...props} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
