// 🧠 Aplicar tema al <html data-bs-theme="..."> antes del DOM
(() => {
    const theme = (window.seguridad?.storage?.get?.('theme') ?? localStorage.getItem('theme') ?? 'dark');
    const safeTheme = ['light', 'dark'].includes(theme) ? theme : 'dark';
    document.documentElement.setAttribute('data-bs-theme', safeTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.querySelector('.theme-toggle');

    const updateThemeIcon = (theme) => {
        const icon = themeBtn?.querySelector('i');
        if (!icon) return;
        icon.className = 'fas';
        icon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
    };

    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    updateThemeIcon(currentTheme);

    // 🔁 Cambiar tema al hacer click
    themeBtn?.addEventListener('click', () => {
        try {
            const html = document.documentElement;
            const current = html.getAttribute('data-bs-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            if (!['light', 'dark'].includes(newTheme)) throw new Error('Tema inválido');

            html.setAttribute('data-bs-theme', newTheme);
            if (seguridad?.storage?.set) {
                seguridad.storage.set('theme', newTheme);
            } else {
                localStorage.setItem('theme', newTheme);
            }
            updateThemeIcon(newTheme);
        } catch (err) {
            console.error('Error al cambiar tema:', err);
        }
    });
});
