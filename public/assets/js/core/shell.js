(() => {
  'use strict';

  const normalizarPath = (valor = '') => {
    let path = String(valor || '/').split('?')[0].split('#')[0].replace(/\/+/g, '/');
    if (path.endsWith('.html')) path = path.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path || '/';
  };

  const caminhoAtual = normalizarPath(window.location.pathname);

  function marcarPaginaAtual() {
    document.body.dataset.page = caminhoAtual.replace(/^\//, '').replace(/\//g, '-') || 'home';
    document.querySelectorAll('.ns-nav a[href]').forEach((link) => {
      try {
        const href = normalizarPath(new URL(link.getAttribute('href'), window.location.origin).pathname);
        const ativo = href === caminhoAtual || (href !== '/' && caminhoAtual.startsWith(`${href}/`));
        if (ativo) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      } catch (_) {}
    });
  }

  function prepararMenuMobile() {
    document.querySelectorAll('.ns-header').forEach((header, indice) => {
      const nav = header.querySelector('.ns-nav');
      if (!nav || header.querySelector('.ns-mobile-toggle')) return;

      if (!nav.id) nav.id = `nsNavV36-${indice + 1}`;
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'ns-mobile-toggle';
      botao.setAttribute('aria-label', 'Abrir menu');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-controls', nav.id);
      botao.innerHTML = '<span aria-hidden="true">☰</span>';
      header.insertBefore(botao, nav);

      const fechar = () => {
        header.classList.remove('ns-menu-aberto');
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-label', 'Abrir menu');
        botao.innerHTML = '<span aria-hidden="true">☰</span>';
      };

      botao.addEventListener('click', () => {
        const abriu = header.classList.toggle('ns-menu-aberto');
        botao.setAttribute('aria-expanded', String(abriu));
        botao.setAttribute('aria-label', abriu ? 'Fechar menu' : 'Abrir menu');
        botao.innerHTML = `<span aria-hidden="true">${abriu ? '×' : '☰'}</span>`;
      });
      nav.addEventListener('click', (evento) => {
        if (evento.target.closest('a')) fechar();
      });
      document.addEventListener('click', (evento) => {
        if (!header.contains(evento.target)) fechar();
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 760) fechar();
      }, { passive: true });
    });
  }

  function corrigirLinksDuplicados() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith(`${window.location.origin}//`)) return;
      link.setAttribute('href', href.replace(`${window.location.origin}//`, `${window.location.origin}/`));
    });
  }

  function prepararTabelasResponsivas() {
    document.querySelectorAll('table').forEach((tabela) => {
      if (tabela.parentElement?.classList.contains('ns-table-scroll-v34')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'ns-table-scroll-v34';
      wrapper.style.cssText = 'width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;';
      tabela.parentNode.insertBefore(wrapper, tabela);
      wrapper.appendChild(tabela);
    });
  }

  function liberarLoaderTravado() {
    const loaders = [...document.querySelectorAll('.mini-loading')];
    const esconder = () => loaders.forEach((loader) => {
      if (loader.dataset.manterAberto === 'true') return;
      loader.classList.remove('ativo', 'mostrar', 'loading-ativo');
      const estilo = getComputedStyle(loader);
      if (estilo.display !== 'none' && !loader.classList.contains('ativo')) loader.style.display = 'none';
    });

    window.addEventListener('load', () => window.setTimeout(esconder, 450), { once: true });
    window.setTimeout(esconder, 8000);
  }

  function observarConteudoDinamico() {
    let agendado = false;
    const observer = new MutationObserver(() => {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(() => {
        agendado = false;
        prepararTabelasResponsivas();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function prepararBotoesComEstado() {
    document.addEventListener('click', (evento) => {
      const botao = evento.target.closest('button, a');
      if (!botao) return;
      botao.classList.add('ns-interacao-v34');
      window.setTimeout(() => botao.classList.remove('ns-interacao-v34'), 280);
    });
  }

  function iniciar() {
    marcarPaginaAtual();
    prepararMenuMobile();
    corrigirLinksDuplicados();
    prepararTabelasResponsivas();
    liberarLoaderTravado();
    observarConteudoDinamico();
    prepararBotoesComEstado();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
