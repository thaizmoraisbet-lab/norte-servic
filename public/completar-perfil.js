const PERFIL_TOKEN_STORAGE = "norteServicPerfilWhatsappToken";

function $(id) {
  return document.getElementById(id);
}

function limparNumero(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function mostrarLoadingPerfil(texto = "Carregando...") {
  const loading = $("miniLoading");
  if (!loading) return;
  const p = loading.querySelector("p");
  if (p) p.innerText = texto;
  loading.classList.add("ativo");
}

function esconderLoadingPerfil() {
  const loading = $("miniLoading");
  if (loading) loading.classList.remove("ativo");
}

async function apiPerfil(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = null;
  try { data = await resp.json(); } catch (_) { data = null; }

  if (!resp.ok) {
    throw new Error(data?.erro || data?.mensagem || "Erro na solicitação.");
  }

  return data;
}

function tokenPerfil() {
  return localStorage.getItem(PERFIL_TOKEN_STORAGE) || sessionStorage.getItem(PERFIL_TOKEN_STORAGE) || "";
}

function setTokenPerfil(token) {
  localStorage.setItem(PERFIL_TOKEN_STORAGE, token);
  sessionStorage.setItem(PERFIL_TOKEN_STORAGE, token);
}

function mostrarEtapa(id) {
  ["etapaTelefone", "etapaCodigo", "etapaPerfil"].forEach((etapa) => {
    const el = $(etapa);
    if (el) el.classList.toggle("escondido", etapa !== id);
  });
  const alvo = $(id);
  if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function solicitarCodigoPerfil() {
  const whatsapp = limparNumero($("perfilWhatsapp")?.value || "");
  const msg = $("msgTelefone");
  if (msg) msg.textContent = "";

  if (whatsapp.length < 10) {
    if (msg) msg.textContent = "Digite um WhatsApp válido com DDD.";
    return;
  }

  try {
    mostrarLoadingPerfil("Enviando código pelo WhatsApp...");
    const data = await apiPerfil("/api/profissional-acesso/solicitar-codigo", {
      method: "POST",
      body: JSON.stringify({ whatsapp })
    });

    if (msg) {
      msg.textContent = data.mensagem || "Código enviado pelo WhatsApp.";
      msg.classList.toggle("erro", data.statusWhatsApp === "erro");
    }

    mostrarEtapa("etapaCodigo");
    const codigo = $("perfilCodigo");
    if (codigo) codigo.focus();
  } catch (error) {
    if (msg) {
      msg.textContent = error.message;
      msg.classList.add("erro");
    }
  } finally {
    esconderLoadingPerfil();
  }
}

async function validarCodigoPerfil() {
  const whatsapp = limparNumero($("perfilWhatsapp")?.value || "");
  const codigo = limparNumero($("perfilCodigo")?.value || "");
  const msg = $("msgCodigo");
  if (msg) msg.textContent = "";

  if (codigo.length !== 6) {
    if (msg) msg.textContent = "Digite o código de 6 dígitos.";
    return;
  }

  try {
    mostrarLoadingPerfil("Validando código...");
    const data = await apiPerfil("/api/profissional-acesso/validar-codigo", {
      method: "POST",
      body: JSON.stringify({ whatsapp, codigo })
    });

    setTokenPerfil(data.token);
    await carregarMeuPerfil();
    mostrarEtapa("etapaPerfil");
  } catch (error) {
    if (msg) {
      msg.textContent = error.message;
      msg.classList.add("erro");
    }
  } finally {
    esconderLoadingPerfil();
  }
}

function preencherPerfil(profissional) {
  $("perfilNome").value = profissional.nome || "";
  $("perfilProfissao").value = profissional.profissao || "";
  $("perfilServicos").value = profissional.servicos || "";
  $("perfilDescricao").value = profissional.descricao || "";
  $("perfilBairro").value = profissional.bairro || "";
  $("perfilInstagram").value = profissional.instagram || "";
  $("perfilHorario").value = profissional.horarioAtendimento || "";
  $("perfilAtendeOutras").value = profissional.atendeOutrasCidades || "Não";
  $("perfilCidades").value = Array.isArray(profissional.cidadesAtendidas) ? profissional.cidadesAtendidas.join(", ") : "";
  const img = $("previewFotoPerfil");
  if (img) {
    img.src = profissional.fotoPerfil || "";
    img.classList.toggle("sem-foto", !profissional.fotoPerfil);
  }
}

async function carregarMeuPerfil() {
  const token = tokenPerfil();
  if (!token) return;

  const data = await apiPerfil("/api/profissional-acesso/me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  preencherPerfil(data.profissional);
}

function arquivoParaDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return reject(new Error("Envie apenas JPG, PNG ou WEBP."));
    }
    if (file.size > 3 * 1024 * 1024) {
      return reject(new Error("A foto deve ter no máximo 3 MB."));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

async function salvarPerfil(e) {
  e.preventDefault();
  const msg = $("msgPerfil");
  if (msg) {
    msg.textContent = "";
    msg.classList.remove("erro");
  }

  const token = tokenPerfil();
  if (!token) {
    if (msg) msg.textContent = "Valide o código antes de salvar.";
    return;
  }

  try {
    mostrarLoadingPerfil("Salvando perfil...");
    const arquivo = $("fotoPerfilArquivo")?.files?.[0] || null;
    const fotoPerfil = arquivo ? await arquivoParaDataURL(arquivo) : "";

    const cidades = String($("perfilCidades").value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      servicos: $("perfilServicos").value,
      descricao: $("perfilDescricao").value,
      bairro: $("perfilBairro").value,
      instagram: $("perfilInstagram").value,
      horarioAtendimento: $("perfilHorario").value,
      atendeOutrasCidades: $("perfilAtendeOutras").value,
      cidadesAtendidas: cidades
    };

    if (fotoPerfil) payload.fotoPerfil = fotoPerfil;

    const data = await apiPerfil("/api/profissional-acesso/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    preencherPerfil(data.profissional);
    if (msg) msg.textContent = data.mensagem || "Perfil atualizado.";
  } catch (error) {
    if (msg) {
      msg.textContent = error.message;
      msg.classList.add("erro");
    }
  } finally {
    esconderLoadingPerfil();
  }
}

function iniciarCompletarPerfil() {
  const params = new URLSearchParams(window.location.search);
  const whatsapp = params.get("whatsapp") || "";
  if (whatsapp && $("perfilWhatsapp")) $("perfilWhatsapp").value = whatsapp;

  $("formCompletarPerfil")?.addEventListener("submit", salvarPerfil);

  $("fotoPerfilArquivo")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await arquivoParaDataURL(file);
      const img = $("previewFotoPerfil");
      if (img) {
        img.src = dataUrl;
        img.classList.remove("sem-foto");
      }
    } catch (error) {
      alert(error.message);
      e.target.value = "";
    }
  });

  if (tokenPerfil()) {
    carregarMeuPerfil()
      .then(() => mostrarEtapa("etapaPerfil"))
      .catch(() => {
        localStorage.removeItem(PERFIL_TOKEN_STORAGE);
        sessionStorage.removeItem(PERFIL_TOKEN_STORAGE);
      });
  }
}

document.addEventListener("DOMContentLoaded", iniciarCompletarPerfil);
