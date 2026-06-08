/* ================================================= */
/* NORTE SERVIC - FRONTEND CONECTADO AO BACKEND/SUPABASE */
/* ================================================= */

const API_BASE = "";
const ADMIN_PASSWORD_STORAGE = "norteServicAdminPassword";
const PROF_TOKEN_STORAGE = "norteServicProfissionalToken";

/* ================================================= */
/* BASE DE PROFISSÕES, SERVIÇOS E CIDADES */
/* ================================================= */

const baseProfissoesNorteServic = [
  {
    "categoria": "Construção e Reforma",
    "profissoes": [
      "Pedreiro",
      "Servente",
      "Mestre de obras",
      "Engenheiro civil",
      "Arquiteto",
      "Pintor",
      "Eletricista",
      "Encanador",
      "Gesseiro",
      "Drywall",
      "Azulejista",
      "Carpinteiro",
      "Marceneiro",
      "Serralheiro",
      "Telhadista",
      "Calheiro",
      "Vidraceiro",
      "Instalador de forro",
      "Instalador de piso",
      "Instalador de porcelanato",
      "Impermeabilizador",
      "Aplicador de textura",
      "Aplicador de grafiato",
      "Montador de móveis",
      "Reformador geral",
      "Ajudante de obra",
      "Topógrafo",
      "Projetista",
      "Decorador de interiores"
    ],
    "palavras": [
      "obra",
      "reforma",
      "construção",
      "casa",
      "parede",
      "piso",
      "banheiro",
      "cozinha",
      "pintura",
      "reboco",
      "cimento",
      "telhado",
      "instalação",
      "calçada",
      "acabamento",
      "forro",
      "porta",
      "janela",
      "porcelanato",
      "drywall",
      "vidro",
      "metal",
      "projeto",
      "estrutura"
    ]
  },
  {
    "categoria": "Casa e Manutenção",
    "profissoes": [
      "Diarista",
      "Faxineira",
      "Passadeira",
      "Lavadeira",
      "Jardineiro",
      "Piscineiro",
      "Dedetizador",
      "Chaveiro",
      "Marido de aluguel",
      "Técnico de ar-condicionado",
      "Técnico de geladeira",
      "Técnico de freezer",
      "Técnico de máquina de lavar",
      "Técnico de fogão",
      "Técnico de micro-ondas",
      "Técnico de eletrônicos",
      "Técnico de TV",
      "Instalador de antena",
      "Instalador de internet",
      "Instalador de câmera",
      "Instalador de cerca elétrica",
      "Instalador de energia solar",
      "Limpador de caixa d’água",
      "Limpador de sofá",
      "Limpador de estofados",
      "Lavador de tapetes",
      "Desentupidor",
      "Montador de móveis"
    ],
    "palavras": [
      "limpeza",
      "faxina",
      "manutenção",
      "conserto",
      "instalação",
      "casa",
      "quintal",
      "jardim",
      "ar-condicionado",
      "geladeira",
      "máquina",
      "fogão",
      "chave",
      "antena",
      "internet",
      "dedetização",
      "piscina",
      "sofá",
      "tapete",
      "câmera",
      "segurança",
      "solar"
    ]
  },
  {
    "categoria": "Beleza e Estética",
    "profissoes": [
      "Manicure",
      "Pedicure",
      "Nail designer",
      "Cabeleireiro",
      "Cabeleireira",
      "Barbeiro",
      "Maquiadora",
      "Designer de sobrancelhas",
      "Micropigmentadora",
      "Lash designer",
      "Depiladora",
      "Trancista",
      "Massoterapeuta",
      "Esteticista",
      "Extensionista capilar",
      "Bronzeadora",
      "Podóloga",
      "Consultora de imagem",
      "Terapeuta capilar",
      "Aplicadora de mega hair",
      "Designer de unhas"
    ],
    "palavras": [
      "unha",
      "unhas",
      "cabelo",
      "barba",
      "maquiagem",
      "sobrancelha",
      "cílios",
      "depilação",
      "estética",
      "beleza",
      "massagem",
      "alongamento",
      "fibra",
      "gel",
      "escova",
      "corte",
      "tranças",
      "bronze",
      "pele"
    ]
  },
  {
    "categoria": "Saúde e Bem-estar",
    "profissoes": [
      "Personal trainer",
      "Nutricionista",
      "Fisioterapeuta",
      "Psicólogo",
      "Cuidador de idosos",
      "Técnico de enfermagem",
      "Enfermeiro",
      "Massoterapeuta",
      "Instrutor de pilates",
      "Professor de dança",
      "Professor de yoga",
      "Terapeuta ocupacional",
      "Fonoaudiólogo",
      "Quiropraxista",
      "Acupunturista",
      "Cuidador infantil",
      "Acompanhante hospitalar"
    ],
    "palavras": [
      "saúde",
      "treino",
      "dieta",
      "fisioterapia",
      "terapia",
      "cuidado",
      "idoso",
      "enfermagem",
      "bem-estar",
      "exercício",
      "pilates",
      "dança",
      "massagem",
      "acompanhamento",
      "consulta"
    ]
  },
  {
    "categoria": "Automotivo e Motos",
    "profissoes": [
      "Mecânico",
      "Mecânico de motos",
      "Borracheiro",
      "Eletricista automotivo",
      "Autoelétrico",
      "Lavador de carros",
      "Lavador de motos",
      "Polidor automotivo",
      "Funileiro",
      "Pintor automotivo",
      "Instalador de som automotivo",
      "Chaveiro automotivo",
      "Guincho",
      "Tapeceiro automotivo",
      "Martelinho de ouro",
      "Instalador de película",
      "Alinhador",
      "Balanceador",
      "Troca de óleo",
      "Mecânico diesel"
    ],
    "palavras": [
      "carro",
      "moto",
      "pneu",
      "motor",
      "bateria",
      "som",
      "lavagem",
      "polimento",
      "funilaria",
      "pintura",
      "guincho",
      "óleo",
      "freio",
      "injeção",
      "ar automotivo",
      "diesel",
      "alinhamento"
    ]
  },
  {
    "categoria": "Tecnologia e Serviços Digitais",
    "profissoes": [
      "Designer gráfico",
      "Social media",
      "Editor de vídeo",
      "Fotógrafo",
      "Filmaker",
      "Técnico de informática",
      "Desenvolvedor de sites",
      "Gestor de tráfego",
      "Criador de identidade visual",
      "Digitador",
      "Suporte técnico",
      "Programador",
      "Analista de sistemas",
      "Designer UX/UI",
      "Copywriter",
      "Criador de conteúdo",
      "Videomaker",
      "Operador de drone",
      "Técnico de celular",
      "Técnico de impressora",
      "Instalador de rede",
      "Consultor de marketing",
      "Gestor de e-commerce"
    ],
    "palavras": [
      "arte",
      "logo",
      "logotipo",
      "identidade visual",
      "vídeo",
      "foto",
      "edição",
      "computador",
      "site",
      "instagram",
      "anúncio",
      "tráfego",
      "social media",
      "design",
      "cartão",
      "convite",
      "banner",
      "reels",
      "sistema",
      "celular",
      "drone",
      "marketing"
    ]
  },
  {
    "categoria": "Eventos e Festas",
    "profissoes": [
      "Fotógrafo",
      "Filmaker",
      "Decorador",
      "Cerimonialista",
      "Garçom",
      "Churrasqueiro",
      "Cozinheira",
      "Boleira",
      "Salgadeira",
      "DJ",
      "Locutor",
      "Equipe de som",
      "Iluminador",
      "Aluguel de mesas e cadeiras",
      "Buffet",
      "Animador de festa",
      "Recreador infantil",
      "Bartender",
      "Confeiteira",
      "Mestre de cerimônia",
      "Segurança de evento",
      "Montador de estrutura",
      "Aluguel de brinquedos",
      "Painel de festa"
    ],
    "palavras": [
      "festa",
      "aniversário",
      "casamento",
      "evento",
      "decoração",
      "bolo",
      "salgado",
      "churrasco",
      "som",
      "foto",
      "vídeo",
      "iluminação",
      "garçom",
      "cerimonial",
      "mesas",
      "cadeiras",
      "buffet",
      "brinquedo"
    ]
  },
  {
    "categoria": "Alimentação",
    "profissoes": [
      "Confeiteira",
      "Salgadeira",
      "Marmitaria",
      "Cozinheira",
      "Churrasqueiro",
      "Pizzaiolo",
      "Doceira",
      "Vendedor de comida",
      "Lancheiro",
      "Padeiro",
      "Assador",
      "Hamburgueiro",
      "Sushiman",
      "Boleira",
      "Cozinheiro",
      "Fornecedor de marmitas",
      "Fornecedor de salgados",
      "Fornecedor de doces",
      "Buffet",
      "Sorveteiro",
      "Açaí",
      "Cafeteria"
    ],
    "palavras": [
      "bolo",
      "salgado",
      "marmita",
      "comida",
      "almoço",
      "jantar",
      "churrasco",
      "doce",
      "lanche",
      "pizza",
      "torta",
      "brigadeiro",
      "festa",
      "refeição",
      "hambúrguer",
      "açaí"
    ]
  },
  {
    "categoria": "Serviços Rurais",
    "profissoes": [
      "Tratorista",
      "Vaqueiro",
      "Diarista rural",
      "Operador de máquina",
      "Roçador",
      "Cercador",
      "Trabalhador rural",
      "Técnico agrícola",
      "Aplicador de veneno",
      "Motorista rural",
      "Peão",
      "Caseiro",
      "Ordenhador",
      "Operador de colheitadeira",
      "Operador de retroescavadeira",
      "Operador de pá carregadeira",
      "Técnico agropecuário",
      "Agrônomo",
      "Veterinário rural",
      "Montador de cerca",
      "Roçagem de terreno"
    ],
    "palavras": [
      "fazenda",
      "chácara",
      "roça",
      "gado",
      "cerca",
      "trator",
      "máquina",
      "pasto",
      "plantio",
      "rural",
      "roçagem",
      "veneno",
      "agricultura",
      "boi",
      "colheita",
      "retroescavadeira"
    ]
  },
  {
    "categoria": "Serviços Empresariais",
    "profissoes": [
      "Contador",
      "Advogado",
      "Consultor",
      "Despachante",
      "Corretor",
      "Técnico de segurança do trabalho",
      "Auxiliar administrativo",
      "Vendedor",
      "Representante comercial",
      "Consultor financeiro",
      "Consultor empresarial",
      "Assistente virtual",
      "Secretária remota",
      "RH",
      "Recrutador",
      "Treinador empresarial",
      "Auditor",
      "Analista fiscal",
      "Analista contábil",
      "Consultor MEI"
    ],
    "palavras": [
      "empresa",
      "documento",
      "contrato",
      "contabilidade",
      "imposto",
      "consultoria",
      "venda",
      "administração",
      "segurança do trabalho",
      "declaração",
      "regularização",
      "jurídico",
      "processo",
      "mei",
      "financeiro"
    ]
  },
  {
    "categoria": "Transporte e Entregas",
    "profissoes": [
      "Motorista particular",
      "Mototaxista",
      "Entregador",
      "Freteiro",
      "Carreteiro",
      "Motorista de caminhão",
      "Mudanceiro",
      "Carregador",
      "Transportador escolar",
      "Motorista de van",
      "Motorista de aplicativo",
      "Entregador de moto",
      "Entregador de bicicleta",
      "Guincho",
      "Transporte de móveis",
      "Transporte de carga",
      "Serviço de mudança"
    ],
    "palavras": [
      "frete",
      "entrega",
      "mudança",
      "transporte",
      "carga",
      "moto",
      "carro",
      "caminhão",
      "van",
      "motorista",
      "carretos",
      "móveis"
    ]
  },
  {
    "categoria": "Pets e Animais",
    "profissoes": [
      "Banho e tosa",
      "Tosador",
      "Dog walker",
      "Pet sitter",
      "Adestrador",
      "Veterinário",
      "Cuidador de pets",
      "Hospedagem pet",
      "Taxi dog",
      "Tratador de animais",
      "Ferrador",
      "Cuidador de cavalos"
    ],
    "palavras": [
      "pet",
      "cachorro",
      "gato",
      "banho",
      "tosa",
      "veterinário",
      "animal",
      "passeio",
      "adestramento",
      "hospedagem"
    ]
  },
  {
    "categoria": "Educação e Aulas",
    "profissoes": [
      "Professor particular",
      "Reforço escolar",
      "Professor de matemática",
      "Professor de português",
      "Professor de inglês",
      "Professor de informática",
      "Professor de música",
      "Professor de violão",
      "Professor de teclado",
      "Professor de redação",
      "Professor de dança",
      "Instrutor de autoescola",
      "Tutor infantil",
      "Preparador para concurso",
      "Aulas de artesanato"
    ],
    "palavras": [
      "aula",
      "professor",
      "reforço",
      "escola",
      "matemática",
      "português",
      "inglês",
      "música",
      "violão",
      "redação",
      "concurso",
      "informática"
    ]
  },
  {
    "categoria": "Moda, Costura e Reparos",
    "profissoes": [
      "Costureira",
      "Alfaiate",
      "Modelista",
      "Bordadeira",
      "Crocheteira",
      "Artesã",
      "Sapateiro",
      "Consertador de bolsas",
      "Ajuste de roupas",
      "Customização de roupas",
      "Estilista",
      "Vendedor de roupas"
    ],
    "palavras": [
      "costura",
      "roupa",
      "ajuste",
      "barra",
      "vestido",
      "calça",
      "sapato",
      "bolsa",
      "bordado",
      "crochê",
      "artesanato"
    ]
  },
  {
    "categoria": "Segurança e Monitoramento",
    "profissoes": [
      "Segurança",
      "Vigilante",
      "Porteiro",
      "Controlador de acesso",
      "Instalador de câmeras",
      "Instalador de alarme",
      "Instalador de cerca elétrica",
      "Monitoramento",
      "Técnico de segurança eletrônica",
      "Brigadista",
      "Cuidador patrimonial"
    ],
    "palavras": [
      "segurança",
      "câmera",
      "alarme",
      "vigilante",
      "portaria",
      "monitoramento",
      "acesso",
      "cerca elétrica",
      "proteção"
    ]
  },
  {
    "categoria": "Comércio e Vendas",
    "profissoes": [
      "Vendedor",
      "Representante comercial",
      "Consultor de vendas",
      "Promotor de vendas",
      "Atendente",
      "Caixa",
      "Repositor",
      "Vendedor ambulante",
      "Vendedor online",
      "Sacoleira",
      "Revendedor",
      "Consultor de cosméticos"
    ],
    "palavras": [
      "venda",
      "loja",
      "atendimento",
      "comércio",
      "cliente",
      "produto",
      "online",
      "revenda",
      "cosméticos"
    ]
  }
];

const servicosPorProfissaoNorteServic = {
  "Pedreiro": ["Reforma", "Piso", "Reboco", "Calçada", "Banheiro", "Cozinha", "Construção", "Parede", "Acabamento", "Pequenos reparos"],
  "Servente": ["Auxílio em obra", "Mistura de massa", "Limpeza de obra", "Carregamento de material", "Apoio em construção", "Apoio em reforma"],
  "Pintor": ["Pintura residencial", "Pintura comercial", "Textura", "Massa corrida", "Grafiato", "Pintura externa", "Pintura interna", "Retoque"],
  "Eletricista": ["Instalação elétrica", "Tomadas", "Chuveiro", "Disjuntor", "Lâmpadas", "Ventilador", "Padrão de energia", "Manutenção elétrica", "Curto-circuito"],
  "Encanador": ["Vazamento", "Caixa d’água", "Torneira", "Descarga", "Tubulação", "Banheiro", "Cozinha", "Esgoto", "Instalação hidráulica"],
  "Gesseiro": ["Forro de gesso", "Moldura", "Sanca", "Parede de drywall", "Reparo em gesso", "Acabamento em gesso"],
  "Azulejista": ["Assentamento de piso", "Assentamento de revestimento", "Porcelanato", "Cerâmica", "Banheiro", "Cozinha", "Acabamento"],
  "Marceneiro": ["Móveis planejados", "Guarda-roupa", "Armário", "Painel", "Porta", "Prateleira", "Reparo em móveis"],
  "Serralheiro": ["Portão", "Grade", "Estrutura metálica", "Corrimão", "Solda", "Reparo em ferro", "Cobertura metálica"],
  "Telhadista": ["Telhado", "Goteira", "Troca de telha", "Madeiramento", "Cobertura", "Calha", "Reparo em telhado"],
  "Montador de móveis": ["Montagem de guarda-roupa", "Montagem de cama", "Montagem de painel", "Montagem de mesa", "Desmontagem de móveis", "Instalação de móveis"],
  "Diarista": ["Faxina residencial", "Limpeza pós-obra", "Organização", "Limpeza pesada", "Limpeza de banheiro", "Limpeza de cozinha", "Passar roupa"],
  "Faxineira": ["Faxina residencial", "Limpeza pesada", "Limpeza pós-obra", "Organização", "Limpeza de banheiro", "Limpeza de cozinha"],
  "Jardineiro": ["Corte de grama", "Poda", "Limpeza de quintal", "Jardinagem", "Plantio", "Manutenção de jardim"],
  "Técnico de ar-condicionado": ["Instalação de ar-condicionado", "Limpeza de ar-condicionado", "Manutenção", "Carga de gás", "Conserto", "Desinstalação", "Higienização"],
  "Técnico de geladeira": ["Conserto de geladeira", "Troca de borracha", "Manutenção", "Carga de gás", "Freezer", "Refrigerador"],
  "Técnico de máquina de lavar": ["Conserto de máquina", "Manutenção", "Troca de peça", "Instalação", "Máquina não centrifuga", "Máquina vazando"],
  "Manicure": ["Unha simples", "Pedicure", "Alongamento", "Fibra", "Gel", "Blindagem", "Decoração", "Esmaltação"],
  "Pedicure": ["Pedicure simples", "Spa dos pés", "Esmaltação", "Cutilagem", "Tratamento dos pés"],
  "Cabeleireiro": ["Corte feminino", "Corte masculino", "Escova", "Progressiva", "Coloração", "Hidratação", "Luzes", "Penteado"],
  "Barbeiro": ["Corte masculino", "Barba", "Sobrancelha", "Degradê", "Pigmentação", "Acabamento"],
  "Maquiadora": ["Maquiagem social", "Maquiagem para festa", "Maquiagem para noiva", "Produção", "Maquiagem artística", "Atendimento a domicílio"],
  "Designer de sobrancelhas": ["Design de sobrancelhas", "Henna", "Micropigmentação", "Limpeza", "Sobrancelha masculina", "Retoque"],
  "Lash designer": ["Extensão de cílios", "Volume brasileiro", "Volume russo", "Manutenção", "Remoção de cílios", "Lash lifting"],
  "Designer gráfico": ["Logo", "Identidade visual", "Arte para Instagram", "Cartão de visita", "Banner", "Convite digital", "Panfleto", "Posts para redes sociais"],
  "Social media": ["Gestão de Instagram", "Criação de conteúdo", "Calendário de postagens", "Legendas", "Planejamento", "Posts", "Reels"],
  "Editor de vídeo": ["Vídeo para Instagram", "Reels", "Vídeo institucional", "Cortes de vídeo", "Legenda em vídeo", "Edição para YouTube"],
  "Fotógrafo": ["Fotos de evento", "Ensaio fotográfico", "Fotos profissionais", "Fotos para comércio", "Aniversário", "Casamento", "Batizado"],
  "Filmaker": ["Vídeo de evento", "Vídeo institucional", "Filmagem", "Reels", "Casamento", "Aniversário", "Edição de vídeo"],
  "Técnico de informática": ["Formatação", "Limpeza de computador", "Instalação de programas", "Manutenção", "Notebook", "Computador lento", "Backup"],
  "Desenvolvedor de sites": ["Site institucional", "Landing page", "Loja virtual", "Página profissional", "Manutenção de site", "Sistema web"],
  "Gestor de tráfego": ["Anúncios no Instagram", "Anúncios no Facebook", "Google Ads", "Campanhas", "Tráfego pago", "Captação de clientes"],
  "Mecânico": ["Motor", "Freio", "Suspensão", "Troca de óleo", "Revisão", "Injeção eletrônica", "Manutenção preventiva"],
  "Borracheiro": ["Troca de pneu", "Remendo", "Calibragem", "Pneu furado", "Alinhamento", "Balanceamento"],
  "Eletricista automotivo": ["Bateria", "Som automotivo", "Farol", "Parte elétrica", "Vidro elétrico", "Trava elétrica", "Diagnóstico"],
  "Confeiteira": ["Bolo personalizado", "Doces", "Tortas", "Brigadeiro", "Bolo de aniversário", "Sobremesas"],
  "Salgadeira": ["Salgados para festa", "Coxinha", "Risole", "Pastel", "Empada", "Kibe", "Encomendas"],
  "Churrasqueiro": ["Churrasco para evento", "Espetinho", "Almoço", "Jantar", "Festa", "Evento familiar"],
  "Cozinheira": ["Almoço", "Jantar", "Comida caseira", "Evento", "Marmita", "Cozinha para festa"],
  "Decorador": ["Decoração de festa", "Aniversário", "Casamento", "Painel", "Mesa decorada", "Balões", "Evento"],
  "DJ": ["Som para festa", "Aniversário", "Casamento", "Evento", "Playlist", "Iluminação"],
  "Tratorista": ["Serviço com trator", "Gradagem", "Roçagem", "Preparo de terra", "Serviço rural", "Transporte rural"],
  "Vaqueiro": ["Cuidado com gado", "Manejo", "Apartação", "Serviço em fazenda", "Diarista rural"],
  "Roçador": ["Roçagem", "Limpeza de terreno", "Limpeza de chácara", "Pasto", "Quintal", "Serviço rural"],
  "Contador": ["Abertura de MEI", "Declaração", "Imposto de renda", "Regularização", "Empresa", "Notas fiscais", "Contabilidade mensal"],
  "Advogado": ["Consulta jurídica", "Contrato", "Processo", "Direito civil", "Direito trabalhista", "Direito familiar", "Regularização"]
};

const cidadesNorteServic = [
  "Toda a região",
  "Todo o Tocantins",
  "Todo o Pará",
  "Todo o Maranhão",
  "Atendimento online",
  "Região Norte",
  "Bico do Papagaio",
  "Muricilândia",
  "Santa Fé do Araguaia",
  "Araguaína",
  "Araguanã",
  "Carmolândia",
  "Wanderlândia",
  "Xambioá",
  "Riachinho",
  "Ananás",
  "Araguatins",
  "Tocantinópolis",
  "Babaçulândia",
  "Filadélfia",
  "Nova Olinda",
  "Colinas do Tocantins",
  "Palmas",
  "Imperatriz",
  "Marabá",
  "Belém",
  "São Luís",
  "Abreulândia - TO",
  "Aguiarnópolis - TO",
  "Aliança do Tocantins - TO",
  "Almas - TO",
  "Alvorada - TO",
  "Ananás - TO",
  "Angico - TO",
  "Aparecida do Rio Negro - TO",
  "Aragominas - TO",
  "Araguacema - TO",
  "Araguaçu - TO",
  "Araguaína - TO",
  "Araguanã - TO",
  "Araguatins - TO",
  "Arapoema - TO",
  "Arraias - TO",
  "Augustinópolis - TO",
  "Aurora do Tocantins - TO",
  "Axixá do Tocantins - TO",
  "Babaçulândia - TO",
  "Bandeirantes do Tocantins - TO",
  "Barra do Ouro - TO",
  "Barrolândia - TO",
  "Bernardo Sayão - TO",
  "Bom Jesus do Tocantins - TO",
  "Brasilândia do Tocantins - TO",
  "Brejinho de Nazaré - TO",
  "Buriti do Tocantins - TO",
  "Cachoeirinha - TO",
  "Campos Lindos - TO",
  "Cariri do Tocantins - TO",
  "Carmolândia - TO",
  "Carrasco Bonito - TO",
  "Caseara - TO",
  "Centenário - TO",
  "Chapada de Areia - TO",
  "Chapada da Natividade - TO",
  "Colinas do Tocantins - TO",
  "Colméia - TO",
  "Combinado - TO",
  "Conceição do Tocantins - TO",
  "Couto Magalhães - TO",
  "Cristalândia - TO",
  "Crixás do Tocantins - TO",
  "Darcinópolis - TO",
  "Dianópolis - TO",
  "Divinópolis do Tocantins - TO",
  "Dois Irmãos do Tocantins - TO",
  "Dueré - TO",
  "Esperantina - TO",
  "Fátima - TO",
  "Figueirópolis - TO",
  "Filadélfia - TO",
  "Formoso do Araguaia - TO",
  "Goianorte - TO",
  "Goiatins - TO",
  "Guaraí - TO",
  "Gurupi - TO",
  "Ipueiras - TO",
  "Itacajá - TO",
  "Itaguatins - TO",
  "Itapiratins - TO",
  "Itaporã do Tocantins - TO",
  "Jaú do Tocantins - TO",
  "Juarina - TO",
  "Lajeado - TO",
  "Lagoa da Confusão - TO",
  "Lagoa do Tocantins - TO",
  "Lavandeira - TO",
  "Lizarda - TO",
  "Luzinópolis - TO",
  "Marianópolis do Tocantins - TO",
  "Mateiros - TO",
  "Maurilândia do Tocantins - TO",
  "Miracema do Tocantins - TO",
  "Miranorte - TO",
  "Monte do Carmo - TO",
  "Monte Santo do Tocantins - TO",
  "Muricilândia - TO",
  "Natividade - TO",
  "Nazaré - TO",
  "Nova Olinda - TO",
  "Nova Rosalândia - TO",
  "Novo Acordo - TO",
  "Novo Alegre - TO",
  "Novo Jardim - TO",
  "Oliveira de Fátima - TO",
  "Palmas - TO",
  "Palmeirante - TO",
  "Palmeiras do Tocantins - TO",
  "Palmeirópolis - TO",
  "Paraíso do Tocantins - TO",
  "Paranã - TO",
  "Pau d'Arco - TO",
  "Pedro Afonso - TO",
  "Peixe - TO",
  "Pequizeiro - TO",
  "Pindorama do Tocantins - TO",
  "Piraquê - TO",
  "Pium - TO",
  "Ponte Alta do Bom Jesus - TO",
  "Ponte Alta do Tocantins - TO",
  "Porto Alegre do Tocantins - TO",
  "Porto Nacional - TO",
  "Praia Norte - TO",
  "Presidente Kennedy - TO",
  "Pugmil - TO",
  "Recursolândia - TO",
  "Riachinho - TO",
  "Rio da Conceição - TO",
  "Rio dos Bois - TO",
  "Rio Sono - TO",
  "Sampaio - TO",
  "Sandolândia - TO",
  "Santa Fé do Araguaia - TO",
  "Santa Maria do Tocantins - TO",
  "Santa Rita do Tocantins - TO",
  "Santa Rosa do Tocantins - TO",
  "Santa Tereza do Tocantins - TO",
  "Santa Terezinha do Tocantins - TO",
  "São Bento do Tocantins - TO",
  "São Félix do Tocantins - TO",
  "São Miguel do Tocantins - TO",
  "São Salvador do Tocantins - TO",
  "São Sebastião do Tocantins - TO",
  "São Valério - TO",
  "Silvanópolis - TO",
  "Sítio Novo do Tocantins - TO",
  "Sucupira - TO",
  "Tabocão - TO",
  "Taguatinga - TO",
  "Taipas do Tocantins - TO",
  "Talismã - TO",
  "Tocantínia - TO",
  "Tocantinópolis - TO",
  "Tupirama - TO",
  "Tupiratins - TO",
  "Wanderlândia - TO",
  "Xambioá - TO",
  "Abaetetuba - PA",
  "Abel Figueiredo - PA",
  "Acará - PA",
  "Afuá - PA",
  "Água Azul do Norte - PA",
  "Alenquer - PA",
  "Almeirim - PA",
  "Altamira - PA",
  "Anajás - PA",
  "Ananindeua - PA",
  "Anapu - PA",
  "Augusto Corrêa - PA",
  "Aurora do Pará - PA",
  "Aveiro - PA",
  "Bagre - PA",
  "Baião - PA",
  "Bannach - PA",
  "Barcarena - PA",
  "Belém - PA",
  "Belterra - PA",
  "Benevides - PA",
  "Bom Jesus do Tocantins - PA",
  "Bonito - PA",
  "Bragança - PA",
  "Brasil Novo - PA",
  "Brejo Grande do Araguaia - PA",
  "Breu Branco - PA",
  "Breves - PA",
  "Bujaru - PA",
  "Cachoeira do Arari - PA",
  "Cachoeira do Piriá - PA",
  "Cametá - PA",
  "Canaã dos Carajás - PA",
  "Capanema - PA",
  "Capitão Poço - PA",
  "Castanhal - PA",
  "Chaves - PA",
  "Colares - PA",
  "Conceição do Araguaia - PA",
  "Concórdia do Pará - PA",
  "Cumaru do Norte - PA",
  "Curionópolis - PA",
  "Curralinho - PA",
  "Curuá - PA",
  "Curuçá - PA",
  "Dom Eliseu - PA",
  "Eldorado do Carajás - PA",
  "Faro - PA",
  "Floresta do Araguaia - PA",
  "Garrafão do Norte - PA",
  "Goianésia do Pará - PA",
  "Gurupá - PA",
  "Igarapé-Açu - PA",
  "Igarapé-Miri - PA",
  "Inhangapi - PA",
  "Ipixuna do Pará - PA",
  "Irituia - PA",
  "Itaituba - PA",
  "Itupiranga - PA",
  "Jacareacanga - PA",
  "Jacundá - PA",
  "Juruti - PA",
  "Limoeiro do Ajuru - PA",
  "Mãe do Rio - PA",
  "Magalhães Barata - PA",
  "Marabá - PA",
  "Maracanã - PA",
  "Marapanim - PA",
  "Marituba - PA",
  "Medicilândia - PA",
  "Melgaço - PA",
  "Mocajuba - PA",
  "Moju - PA",
  "Mojuí dos Campos - PA",
  "Monte Alegre - PA",
  "Muaná - PA",
  "Nova Esperança do Piriá - PA",
  "Nova Ipixuna - PA",
  "Nova Timboteua - PA",
  "Novo Progresso - PA",
  "Novo Repartimento - PA",
  "Óbidos - PA",
  "Oeiras do Pará - PA",
  "Oriximiná - PA",
  "Ourém - PA",
  "Ourilândia do Norte - PA",
  "Pacajá - PA",
  "Palestina do Pará - PA",
  "Paragominas - PA",
  "Parauapebas - PA",
  "Pau d'Arco - PA",
  "Peixe-Boi - PA",
  "Piçarra - PA",
  "Placas - PA",
  "Ponta de Pedras - PA",
  "Portel - PA",
  "Porto de Moz - PA",
  "Prainha - PA",
  "Primavera - PA",
  "Quatipuru - PA",
  "Redenção - PA",
  "Rio Maria - PA",
  "Rondon do Pará - PA",
  "Rurópolis - PA",
  "Salinópolis - PA",
  "Salvaterra - PA",
  "Santa Bárbara do Pará - PA",
  "Santa Cruz do Arari - PA",
  "Santa Izabel do Pará - PA",
  "Santa Luzia do Pará - PA",
  "Santa Maria das Barreiras - PA",
  "Santa Maria do Pará - PA",
  "Santana do Araguaia - PA",
  "Santarém - PA",
  "Santarém Novo - PA",
  "Santo Antônio do Tauá - PA",
  "São Caetano de Odivelas - PA",
  "São Domingos do Araguaia - PA",
  "São Domingos do Capim - PA",
  "São Félix do Xingu - PA",
  "São Francisco do Pará - PA",
  "São Geraldo do Araguaia - PA",
  "São João da Ponta - PA",
  "São João de Pirabas - PA",
  "São João do Araguaia - PA",
  "São Miguel do Guamá - PA",
  "São Sebastião da Boa Vista - PA",
  "Sapucaia - PA",
  "Senador José Porfírio - PA",
  "Soure - PA",
  "Tailândia - PA",
  "Terra Alta - PA",
  "Terra Santa - PA",
  "Tomé-Açu - PA",
  "Tracuateua - PA",
  "Trairão - PA",
  "Tucumã - PA",
  "Tucuruí - PA",
  "Ulianópolis - PA",
  "Uruará - PA",
  "Vigia - PA",
  "Vitória do Xingu - PA",
  "Viseu - PA",
  "Xinguara - PA",
  "Açailândia - MA",
  "Afonso Cunha - MA",
  "Água Doce do Maranhão - MA",
  "Alcântara - MA",
  "Aldeias Altas - MA",
  "Altamira do Maranhão - MA",
  "Alto Alegre do Maranhão - MA",
  "Alto Alegre do Pindaré - MA",
  "Alto Parnaíba - MA",
  "Amapá do Maranhão - MA",
  "Amarante do Maranhão - MA",
  "Anajatuba - MA",
  "Anapurus - MA",
  "Apicum-Açu - MA",
  "Araguanã - MA",
  "Araioses - MA",
  "Arame - MA",
  "Arari - MA",
  "Axixá - MA",
  "Bacabal - MA",
  "Bacabeira - MA",
  "Bacuri - MA",
  "Bacurituba - MA",
  "Balsas - MA",
  "Barão de Grajaú - MA",
  "Barra do Corda - MA",
  "Barreirinhas - MA",
  "Bela Vista do Maranhão - MA",
  "Belágua - MA",
  "Benedito Leite - MA",
  "Bequimão - MA",
  "Bernardo do Mearim - MA",
  "Boa Vista do Gurupi - MA",
  "Bom Jardim - MA",
  "Bom Jesus das Selvas - MA",
  "Bom Lugar - MA",
  "Brejo - MA",
  "Brejo de Areia - MA",
  "Buriti - MA",
  "Buriti Bravo - MA",
  "Buriticupu - MA",
  "Buritirana - MA",
  "Cachoeira Grande - MA",
  "Cajapió - MA",
  "Cajari - MA",
  "Campestre do Maranhão - MA",
  "Cândido Mendes - MA",
  "Cantanhede - MA",
  "Capinzal do Norte - MA",
  "Carolina - MA",
  "Carutapera - MA",
  "Caxias - MA",
  "Cedral - MA",
  "Central do Maranhão - MA",
  "Centro do Guilherme - MA",
  "Centro Novo do Maranhão - MA",
  "Chapadinha - MA",
  "Cidelândia - MA",
  "Codó - MA",
  "Coelho Neto - MA",
  "Colinas - MA",
  "Conceição do Lago-Açu - MA",
  "Coroatá - MA",
  "Cururupu - MA",
  "Davinópolis - MA",
  "Dom Pedro - MA",
  "Duque Bacelar - MA",
  "Esperantinópolis - MA",
  "Estreito - MA",
  "Feira Nova do Maranhão - MA",
  "Fernando Falcão - MA",
  "Formosa da Serra Negra - MA",
  "Fortaleza dos Nogueiras - MA",
  "Fortuna - MA",
  "Godofredo Viana - MA",
  "Gonçalves Dias - MA",
  "Governador Archer - MA",
  "Governador Eugênio Barros - MA",
  "Governador Luiz Rocha - MA",
  "Governador Newton Bello - MA",
  "Governador Nunes Freire - MA",
  "Graça Aranha - MA",
  "Grajaú - MA",
  "Guimarães - MA",
  "Humberto de Campos - MA",
  "Icatu - MA",
  "Igarapé do Meio - MA",
  "Igarapé Grande - MA",
  "Imperatriz - MA",
  "Itaipava do Grajaú - MA",
  "Itapecuru Mirim - MA",
  "Itinga do Maranhão - MA",
  "Jatobá - MA",
  "Jenipapo dos Vieiras - MA",
  "João Lisboa - MA",
  "Joselândia - MA",
  "Junco do Maranhão - MA",
  "Lago da Pedra - MA",
  "Lago do Junco - MA",
  "Lago dos Rodrigues - MA",
  "Lago Verde - MA",
  "Lagoa do Mato - MA",
  "Lagoa Grande do Maranhão - MA",
  "Lajeado Novo - MA",
  "Lima Campos - MA",
  "Loreto - MA",
  "Luís Domingues - MA",
  "Magalhães de Almeida - MA",
  "Maracaçumé - MA",
  "Marajá do Sena - MA",
  "Maranhãozinho - MA",
  "Mata Roma - MA",
  "Matinha - MA",
  "Matões - MA",
  "Matões do Norte - MA",
  "Milagres do Maranhão - MA",
  "Mirador - MA",
  "Miranda do Norte - MA",
  "Mirinzal - MA",
  "Monção - MA",
  "Montes Altos - MA",
  "Morros - MA",
  "Nina Rodrigues - MA",
  "Nova Colinas - MA",
  "Nova Iorque - MA",
  "Nova Olinda do Maranhão - MA",
  "Olho d'Água das Cunhãs - MA",
  "Olinda Nova do Maranhão - MA",
  "Paço do Lumiar - MA",
  "Palmeirândia - MA",
  "Paraibano - MA",
  "Parnarama - MA",
  "Passagem Franca - MA",
  "Pastos Bons - MA",
  "Paulino Neves - MA",
  "Paulo Ramos - MA",
  "Pedreiras - MA",
  "Pedro do Rosário - MA",
  "Penalva - MA",
  "Peri Mirim - MA",
  "Peritoró - MA",
  "Pindaré Mirim - MA",
  "Pinheiro - MA",
  "Pio XII - MA",
  "Pirapemas - MA",
  "Poção de Pedras - MA",
  "Porto Franco - MA",
  "Porto Rico do Maranhão - MA",
  "Presidente Dutra - MA",
  "Presidente Juscelino - MA",
  "Presidente Médici - MA",
  "Presidente Sarney - MA",
  "Presidente Vargas - MA",
  "Primeira Cruz - MA",
  "Raposa - MA",
  "Riachão - MA",
  "Ribamar Fiquene - MA",
  "Ribeirãozinho do Maranhão - MA",
  "Rosário - MA",
  "Sambaíba - MA",
  "Santa Filomena do Maranhão - MA",
  "Santa Helena - MA",
  "Santa Inês - MA",
  "Santa Luzia - MA",
  "Santa Luzia do Paruá - MA",
  "Santa Quitéria do Maranhão - MA",
  "Santa Rita - MA",
  "Santana do Maranhão - MA",
  "Santo Amaro do Maranhão - MA",
  "Santo Antônio dos Lopes - MA",
  "São Benedito do Rio Preto - MA",
  "São Bento - MA",
  "São Bernardo - MA",
  "São Domingos do Azeitão - MA",
  "São Domingos do Maranhão - MA",
  "São Félix de Balsas - MA",
  "São Francisco do Brejão - MA",
  "São Francisco do Maranhão - MA",
  "São João Batista - MA",
  "São João do Caru - MA",
  "São João do Paraíso - MA",
  "São João do Soter - MA",
  "São João dos Patos - MA",
  "São José de Ribamar - MA",
  "São José dos Basílios - MA",
  "São Luís - MA",
  "São Luís Gonzaga do Maranhão - MA",
  "São Mateus do Maranhão - MA",
  "São Pedro da Água Branca - MA",
  "São Pedro dos Crentes - MA",
  "São Raimundo do Doca Bezerra - MA",
  "São Raimundo das Mangabeiras - MA",
  "São Roberto - MA",
  "São Vicente Ferrer - MA",
  "Satubinha - MA",
  "Senador Alexandre Costa - MA",
  "Senador La Rocque - MA",
  "Serrano do Maranhão - MA",
  "Sítio Novo - MA",
  "Sucupira do Norte - MA",
  "Sucupira do Riachão - MA",
  "Tasso Fragoso - MA",
  "Timbiras - MA",
  "Timon - MA",
  "Trizidela do Vale - MA",
  "Tufilândia - MA",
  "Tuntum - MA",
  "Turiaçu - MA",
  "Turilândia - MA",
  "Tutóia - MA",
  "Urbano Santos - MA",
  "Vargem Grande - MA",
  "Viana - MA",
  "Vila Nova dos Martírios - MA",
  "Vitória do Mearim - MA",
  "Vitorino Freire - MA",
  "Zé Doca - MA"
];

let servicosSelecionadosCadastro = [];
let cidadesSelecionadasCadastro = [];
let filtroAdminAtual = "todos";
let filtroPagamentosAdminAtual = "todos";
let pagamentosAdminCache = [];
let indicacoesAdminCache = { indicacoes: [], saques: [] };
let profissionaisCache = [];
let fotosTrabalhosEdicaoAtuais = [];

/* ================================================= */
/* API E UTILITÁRIOS */
/* ================================================= */

function normalizarTextoNorteServic(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function limparNumero(valor) {
  return String(valor || "").replace(/\D/g, "");
}

async function apiFetch(url, options = {}) {
  const resposta = await fetch(API_BASE + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let dados = null;
  try {
    dados = await resposta.json();
  } catch (_) {
    dados = null;
  }

  if (!resposta.ok) {
    const detalhe = dados?.detalhe ? ` Detalhe: ${dados.detalhe}` : "";
    const mensagemErro = dados?.erro || dados?.mensagem || "Erro na requisição.";
    console.error("Erro API", { url, status: resposta.status, dados });
    throw new Error(`${mensagemErro}${detalhe}`);
  }

  return dados;
}

function obterCodigoIndicacaoDaURL() {
  const params = new URLSearchParams(window.location.search);
  const ref = (params.get("ref") || params.get("indicacao") || "").trim();
  if (ref) {
    localStorage.setItem("norteServicCodigoIndicacaoRecebido", ref);
    return ref;
  }
  return localStorage.getItem("norteServicCodigoIndicacaoRecebido") || "";
}

function formatarMoedaIndicacao(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataIndicacao(data) {
  if (!data) return "-";
  try {
    return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (_) {
    return "-";
  }
}

function statusIndicacaoClasse(status = "") {
  const normalizado = String(status || "").toLowerCase();
  if (["disponivel", "pago"].includes(normalizado)) return "ok";
  if (["cancelada", "recusado"].includes(normalizado)) return "erro";
  if (["saque_solicitado", "aguardando", "pendente_liberacao"].includes(normalizado)) return "alerta";
  return "neutro";
}

function getTokenProfissional() {
  return (
    localStorage.getItem(PROF_TOKEN_STORAGE) ||
    localStorage.getItem("tokenProfissional") ||
    localStorage.getItem("profissionalToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem(PROF_TOKEN_STORAGE) ||
    sessionStorage.getItem("tokenProfissional") ||
    sessionStorage.getItem("profissionalToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}


function estrelasHTML(nota = 0) {
  const valor = Number(nota || 0);
  return Array.from({ length: 5 }, (_, index) => index < valor ? "★" : "☆").join("");
}

function formatarDataCurta(data) {
  if (!data) return "";
  try {
    return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (_) {
    return "";
  }
}

function formatarDataHoraCurta(data) {
  if (!data) return "";
  try {
    return new Date(data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return "";
  }
}

function formatarMoedaBR(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorPagamentoNumero(pagamento) {
  if (!pagamento) return 0;
  const valor = Number(pagamento.valor || 0);
  if (valor > 0) return valor;
  const centavos = Number(pagamento.valor_centavos || pagamento.valorCentavos || 0);
  return centavos > 0 ? centavos / 100 : 0;
}

function taxaEfiEstimada(valor) {
  // Baseada no primeiro teste real: R$ 19,90 virou R$ 19,66 na Efí.
  const percentual = 0.0120603015;
  return Number(valor || 0) * percentual;
}

function valorLiquidoEstimado(pagamento) {
  const valorBanco = Number(pagamento?.valor_liquido || pagamento?.valor_liquido_estimado || 0);
  if (valorBanco > 0) return valorBanco;
  const bruto = valorPagamentoNumero(pagamento);
  return Math.max(0, bruto - taxaEfiEstimada(bruto));
}

function statusPagamentoAdmin(pagamento) {
  const status = String(pagamento?.status || pagamento?.efi_status || "").trim().toLowerCase();
  if (status === "pago" || status === "concluida" || status === "concluído") return "pago";
  if (status === "expirado" || status === "expirada" || status === "cancelado" || status === "cancelada") return "expirado";

  const criado = pagamento?.criado_em || pagamento?.criadoEm;
  const expira = pagamento?.expira_em || pagamento?.expiraEm;
  const dataExpira = expira ? new Date(expira) : (criado ? new Date(new Date(criado).getTime() + (Number(pagamento?.expiracao || 3600) * 1000)) : null);
  if (dataExpira && !Number.isNaN(dataExpira.getTime()) && dataExpira.getTime() < Date.now()) return "expirado";

  if (status === "erro") return "erro";
  return "aguardando";
}

function labelStatusPagamentoAdmin(status) {
  const mapa = {
    pago: "Pago",
    aguardando: "Aguardando",
    expirado: "Expirado",
    erro: "Erro"
  };
  return mapa[status] || "Aguardando";
}

function mensagemWhatsAppPagamentoExpirado(pagamento) {
  const nome = pagamento?.profissional_nome || pagamento?.profissionalNome || "";
  const plano = pagamento?.plano_nome || pagamento?.planoNome || pagamento?.plano_key || "plano de destaque";
  return encodeURIComponent(`Olá${nome ? " " + nome : ""}! Vi que você iniciou a assinatura do ${plano} da Norte Servic, mas não concluiu o pagamento.

Seu perfil pode perder benefícios como destaque, selo e mais visibilidade para clientes da região.

Quer que eu te ajude a concluir a assinatura?`);
}

function linkWhatsappNumeroMensagem(numero, mensagem) {
  const limpo = limparNumero(numero || "");
  if (!limpo) return "#";
  return `https://wa.me/55${limpo.length <= 11 ? limpo : limpo.replace(/^55/, "")}?text=${mensagem}`;
}

async function carregarAvaliacoesProfissional(profissionalId) {
  if (!profissionalId) return [];
  return apiFetch(`/api/profissionais/${profissionalId}/avaliacoes`);
}

async function enviarAvaliacaoProfissional(profissionalId, dados) {
  return apiFetch(`/api/profissionais/${profissionalId}/avaliacoes`, {
    method: "POST",
    body: JSON.stringify(dados)
  });
}


function setTokenProfissional(token) {
  localStorage.setItem(PROF_TOKEN_STORAGE, token);
  localStorage.setItem("tokenProfissional", token);
}

function removerTokenProfissional() {
  localStorage.removeItem(PROF_TOKEN_STORAGE);
  localStorage.removeItem("tokenProfissional");
  localStorage.removeItem("profissionalToken");
  localStorage.removeItem("token");
  sessionStorage.removeItem(PROF_TOKEN_STORAGE);
  sessionStorage.removeItem("tokenProfissional");
  sessionStorage.removeItem("profissionalToken");
  sessionStorage.removeItem("token");
}

function getAdminPassword() {
  return sessionStorage.getItem(ADMIN_PASSWORD_STORAGE) || "";
}

function headersAuth() {
  const token = getTokenProfissional();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function headersAdmin() {
  const senha = getAdminPassword();
  return senha ? { "x-admin-password": senha } : {};
}

function setAdminPassword(senha) {
  sessionStorage.setItem(ADMIN_PASSWORD_STORAGE, senha);
}

function mostrarLoading(texto = "Carregando...") {
  const loading = document.getElementById("miniLoading");
  if (!loading) return;

  const p = loading.querySelector("p");
  if (p) p.innerText = texto;
  loading.classList.add("ativo");
}

function esconderLoading() {
  const loading = document.getElementById("miniLoading");
  if (loading) loading.classList.remove("ativo");
}

function aguardarPinturaTela(ms = 80) {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, ms)));
}

function iniciarCarregamentoNorteServic() {
  if (document.querySelector(".ns-page-loader")) return;

  const loader = document.createElement("div");
  loader.className = "ns-page-loader ativo";
  loader.innerHTML = `
    <div class="ns-loader-card">
      <div class="ns-loader-logo"><span>✓</span></div>
      <strong>Norte Servic</strong>
      <p>Carregando informações...</p>
      <div class="ns-loader-bar"><span></span></div>
    </div>
  `;

  document.body.appendChild(loader);

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("saindo");
      setTimeout(() => loader.remove(), 420);
    }, 450);
  });
}

function ativarEstadoCarregandoBotao(botao, texto = "Enviando...") {
  if (!botao) return "";
  const textoOriginal = botao.innerText;
  botao.disabled = true;
  botao.classList.add("botao-carregando");
  botao.innerHTML = `<span class="spinner-botao"></span><span>${texto}</span>`;
  return textoOriginal;
}

function restaurarEstadoBotao(botao, textoOriginal = "Enviar") {
  if (!botao) return;
  botao.disabled = false;
  botao.classList.remove("botao-carregando");
  botao.innerText = textoOriginal;
}


function criarLinkWhatsApp(numero) {
  const telefone = limparNumero(numero);
  const mensagem = encodeURIComponent("Olá! Encontrei seu perfil no Norte Servic e gostaria de solicitar um orçamento.");
  return `https://wa.me/${telefone}?text=${mensagem}`;
}

function carregarImagemDoArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) return resolve(null);

    const url = URL.createObjectURL(arquivo);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem enviada."));
    };

    img.src = url;
  });
}

async function converterImagemParaBase64(arquivo, opcoes = {}) {
  if (!arquivo) return "";

  const {
    maxSize = 900,
    qualidade = 0.82,
    exigirQuadrada = false
  } = opcoes;

  const img = await carregarImagemDoArquivo(arquivo);
  if (!img) return "";

  const larguraOriginal = img.naturalWidth || img.width;
  const alturaOriginal = img.naturalHeight || img.height;

  let origemX = 0;
  let origemY = 0;
  let origemLargura = larguraOriginal;
  let origemAltura = alturaOriginal;

  if (exigirQuadrada) {
    const menorLado = Math.min(larguraOriginal, alturaOriginal);
    origemX = Math.floor((larguraOriginal - menorLado) / 2);
    origemY = Math.floor((alturaOriginal - menorLado) / 2);
    origemLargura = menorLado;
    origemAltura = menorLado;
  }

  const maiorLado = Math.max(origemLargura, origemAltura);
  const escala = maiorLado > maxSize ? maxSize / maiorLado : 1;
  const largura = Math.max(1, Math.round(origemLargura * escala));
  const altura = Math.max(1, Math.round(origemAltura * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, origemX, origemY, origemLargura, origemAltura, 0, 0, largura, altura);

  return canvas.toDataURL("image/jpeg", qualidade);
}

async function validarFotoPerfil1000(arquivo, obrigatoria = false) {
  if (!arquivo) {
    if (obrigatoria) throw new Error("Envie uma foto de perfil.");
    return;
  }

  if (!String(arquivo.type || "").startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem válido para a foto de perfil.");
  }
}

function limiteFotosPorPlano(profissional = {}) {
  const plano = normalizarTextoNorteServic(profissional.planoAtual || profissional.plano_atual || "Gratuito");

  if (plano.includes("premium") || plano.includes("top")) return 30;
  if (plano.includes("profissional")) return 12;
  if (plano.includes("destaque")) return 6;
  return 3;
}

function criarLinkInstagram(instagram) {
  const valor = String(instagram || "").trim();
  if (!valor) return "";

  let usuario = valor.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  usuario = usuario.replace(/^@/, "").split(/[/?#]/)[0].trim();

  if (!usuario) return "";

  return `https://instagram.com/${encodeURIComponent(usuario)}`;
}

function instagramHTML(instagram, classe = "") {
  const link = criarLinkInstagram(instagram);
  if (!link) return "Não informado";

  const usuario = String(instagram || "").trim().replace(/^@/, "");
  return `<a class="instagram-link ${classe}" href="${link}" target="_blank" rel="noopener">@${usuario}</a>`;
}

async function converterVariasImagensParaBase64(arquivos) {
  const listaArquivos = Array.from(arquivos || []);
  const imagens = [];

  for (const arquivo of listaArquivos) {
    imagens.push(await converterImagemParaBase64(arquivo, {
      maxSize: 1200,
      qualidade: 0.78,
      exigirQuadrada: false
    }));
  }

  return imagens;
}

function pegarPalavrasDaCategoria(categoriaNome) {
  const categoria = baseProfissoesNorteServic.find(item => item.categoria === categoriaNome);
  if (!categoria) return "";
  return [categoria.categoria, ...categoria.profissoes, ...categoria.palavras].join(" ");
}

function pegarCidadesAtendidasCadastro() {
  const cidadePrincipal = document.getElementById("cidade")?.value.trim() || "";
  const todas = [cidadePrincipal, ...cidadesSelecionadasCadastro].filter(Boolean);
  return [...new Set(todas)];
}

function formatarCidadesAtendidas(p) {
  const cidades = Array.isArray(p.cidadesAtendidas) && p.cidadesAtendidas.length > 0
    ? p.cidadesAtendidas
    : [p.cidade].filter(Boolean);

  if (p.formaAtendimento === "Online") return "Atendimento online";
  if (p.formaAtendimento === "Presencial e online" && cidades.includes("Toda a região")) return "Toda a região e online";
  if (cidades.includes("Toda a região")) return "Toda a região";
  if (cidades.length === 1) return cidades[0];
  if (cidades.length > 3) return `${cidades.slice(0, 3).join(", ")} e região`;
  return cidades.join(", ");
}

function calcularForcaPerfil(p) {
  let pontos = 0;
  if (p.nome) pontos += 10;
  if (p.fotoPerfil) pontos += 15;
  if (p.descricao && p.descricao.length > 40) pontos += 15;
  if (p.servicos) pontos += 15;
  if (p.categoria && p.profissao) pontos += 15;
  if (p.cidade && p.bairro) pontos += 10;
  if (p.whatsapp) pontos += 10;
  if (Array.isArray(p.fotosTrabalhos) && p.fotosTrabalhos.length > 0) pontos += 10;
  return Math.min(100, pontos);
}

async function carregarProfissionais() {
  const profissionais = await apiFetch("/api/profissionais");
  profissionaisCache = ordenarProfissionaisPorPlano(profissionais);
  return profissionaisCache;
}

async function carregarProfissionalPorId(id) {
  return apiFetch(`/api/profissionais/${id}`);
}


function normalizarPlanoNome(plano) {
  return normalizarTextoNorteServic(plano || "Gratuito");
}

function planoEstaAtivo(p) {
  return normalizarTextoNorteServic(p?.planoStatus || "ativo") === "ativo";
}

function planoRankNorteServic(p) {
  if (!p || !planoEstaAtivo(p)) return 0;

  const plano = normalizarPlanoNome(p.planoAtual);

  if (plano.includes("premium") || plano.includes("top")) return 3;
  if (plano.includes("profissional") || plano.includes("plus")) return 2;
  if (plano.includes("destaque") || plano.includes("essencial")) return 1;

  return 0;
}

function profissionalTemPlanoPago(p) {
  return planoRankNorteServic(p) > 0;
}

function seloPlanoTexto(p) {
  const rank = planoRankNorteServic(p);
  const plano = p?.planoAtual || "Gratuito";

  if (rank === 3) return "Top";
  if (rank === 2) return "Pro";
  if (rank === 1) return "Destaque";
  return plano;
}

function seloVerificadoPlanoHTML(p, modo = "card") {
  if (!p) return "";

  if (!profissionalTemPlanoPago(p)) {
    if (p.verificado) {
      return `<span class="selo-plano-verificado verificado ${modo}" title="Profissional verificado pela Norte Servic">✓</span>`;
    }

    return "";
  }

  const texto = seloPlanoTexto(p);
  const classe = planoRankNorteServic(p) === 3 ? "premium" : planoRankNorteServic(p) === 2 ? "profissional" : "destaque";

  return `<span class="selo-plano-verificado ${classe} ${modo}" title="Plano ${p.planoAtual || texto} ativo">✓ ${texto}</span>`;
}

function ordenarProfissionaisPorPlano(lista = []) {
  return [...lista].sort((a, b) => {
    const rankA = planoRankNorteServic(a);
    const rankB = planoRankNorteServic(b);

    if (rankB !== rankA) return rankB - rankA;

    const avaliacoesB = Number(b.avaliacoes || 0);
    const avaliacoesA = Number(a.avaliacoes || 0);

    if (avaliacoesB !== avaliacoesA) return avaliacoesB - avaliacoesA;

    return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
  });
}

/* ================================================= */
/* BUSCA INTELIGENTE */
/* ================================================= */

function pegarTodasSugestoesNorteServic() {
  const sugestoes = [];

  baseProfissoesNorteServic.forEach(item => {
    sugestoes.push({ nome: item.categoria, tipo: "Categoria" });
    item.profissoes.forEach(profissao => sugestoes.push({ nome: profissao, tipo: item.categoria }));
    item.palavras.forEach(palavra => sugestoes.push({ nome: palavra, tipo: item.categoria }));
  });

  const controle = new Set();
  return sugestoes.filter(item => {
    const chave = normalizarTextoNorteServic(item.nome);
    if (controle.has(chave)) return false;
    controle.add(chave);
    return true;
  });
}

function iniciarBuscaInteligente() {
  const campo = document.getElementById("campoBusca");
  const caixa = document.getElementById("sugestoesBusca");
  if (!campo || !caixa) return;

  campo.addEventListener("input", function() {
    const termo = normalizarTextoNorteServic(campo.value);
    caixa.innerHTML = "";

    if (termo.length < 1) {
      caixa.classList.remove("ativo");
      return;
    }

    const sugestoes = pegarTodasSugestoesNorteServic()
      .filter(item => normalizarTextoNorteServic(item.nome).includes(termo))
      .slice(0, 7);

    if (sugestoes.length === 0) {
      caixa.classList.remove("ativo");
      return;
    }

    sugestoes.forEach(item => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "sugestao-item";
      botao.innerHTML = `<span>${item.nome}</span><small>${item.tipo}</small>`;
      botao.addEventListener("click", () => selecionarSugestaoBusca(item.nome));
      caixa.appendChild(botao);
    });

    caixa.classList.add("ativo");
  });

  campo.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      caixa.classList.remove("ativo");
      buscarProfissionais();
    }
    if (e.key === "Escape") caixa.classList.remove("ativo");
  });

  document.addEventListener("click", function(e) {
    if (!e.target.closest(".busca-inteligente-area")) caixa.classList.remove("ativo");
  });
}

function selecionarSugestaoBusca(valor) {
  const campo = document.getElementById("campoBusca");
  const caixa = document.getElementById("sugestoesBusca");
  if (!campo) return;

  campo.value = valor;
  if (caixa) {
    caixa.classList.remove("ativo");
    caixa.innerHTML = "";
  }
  buscarProfissionais();
}

/* ================================================= */
/* HOME / PROFISSIONAIS */
/* ================================================= */

function cardProfissionalHTML(p, index = 0) {
  const linkWhatsApp = criarLinkWhatsApp(p.whatsapp);
  const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : "?";
  const fotoCard = p.fotoPerfil ? `<img src="${p.fotoPerfil}" alt="Foto de ${p.nome}">` : `<span>${inicial}</span>`;
  const temFotosTrabalhos = Array.isArray(p.fotosTrabalhos) && p.fotosTrabalhos.length > 0;
  const cidadesTexto = formatarCidadesAtendidas(p);
  const temPlano = profissionalTemPlanoPago(p);
  const planoTexto = seloPlanoTexto(p);

  const classePlano = temPlano ? ` plano-ativo plano-${planoTexto.toLowerCase()}` : "";
  const statusPlano = temPlano
    ? `<p class="plano-status-card ativo">✓ Plano ${p.planoAtual || planoTexto} ativo</p>`
    : (p.verificado ? `<p class="plano-status-card verificado">✓ Profissional verificado</p>` : "");

  return `
    <div class="card${classePlano}" style="animation-delay: ${index * 0.08}s">
      <div class="foto-card">${fotoCard}</div>

      <div class="card-conteudo-mobile">
        <h3 class="nome-profissional-linha">
          <span>${p.nome}</span>
          ${seloVerificadoPlanoHTML(p, "card")}
        </h3>

        <p class="profissao">${p.profissao || "Profissional"}</p>
        ${statusPlano}

        <p class="descricao-card">${p.descricao || "Profissional cadastrado na Norte Servic."}</p>
        <p class="atende-card"><strong>Atende:</strong> ${cidadesTexto}</p>
        <p class="atendimento-card"><strong>Atendimento:</strong> ${p.formaAtendimento || "Não informado"}</p>
        <p class="avaliacao-card">⭐ ${p.avaliacao || "Novo"} | ${p.avaliacoes || 0} avaliações</p>
        <p class="whatsapp-card">⚡ Responde pelo WhatsApp</p>

        <div class="selos">
          ${temPlano ? `<p class="selo-pago-card">✓ Plano ${p.planoAtual || planoTexto} ativo</p>` : ""}
          <p>✓ WhatsApp confirmado</p>
          <p>${temFotosTrabalhos ? "✓ Fotos reais disponíveis" : "✓ Fotos reais em análise"}</p>
          <p>${p.verificado ? "✓ Profissional verificado" : "• Aguardando verificação"}</p>
        </div>

        <div class="acoes-card">
          <a href="perfil.html?id=${p.id}">Ver detalhes</a>
          <a class="whatsapp" href="${linkWhatsApp}" target="_blank">Chamar no WhatsApp</a>
        </div>
      </div>
    </div>
  `;
}

async function mostrarProfissionais(lista = null) {
  const container = document.getElementById("listaProfissionais");
  if (!container) return;

  try {
    const profissionais = ordenarProfissionaisPorPlano(lista || await carregarProfissionais());
    container.innerHTML = "";

    if (!profissionais || profissionais.length === 0) {
      container.innerHTML = `
        <div class="admin-vazio">
          <h3>Nenhum profissional encontrado</h3>
          <p>Tente buscar por outro serviço, profissão ou cidade.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = profissionais.map(cardProfissionalHTML).join("");
  } catch (error) {
    container.innerHTML = `
      <div class="admin-vazio">
        <h3>Erro ao carregar profissionais</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

async function buscarProfissionais() {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;

  const termo = campo.value.trim();
  try {
    const query = termo ? `?q=${encodeURIComponent(termo)}` : "";
    const profissionais = await apiFetch(`/api/profissionais${query}`);
    mostrarProfissionais(ordenarProfissionaisPorPlano(profissionais));
  } catch (error) {
    const container = document.getElementById("listaProfissionais");
    if (container) container.innerHTML = `<div class="admin-vazio"><h3>Erro na busca</h3><p>${error.message}</p></div>`;
  }
}

function buscarCategoria(categoria) {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;
  campo.value = categoria;
  buscarProfissionais();
}

function ativarBuscaComEnter() {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;
  campo.addEventListener("keyup", e => {
    if (e.key === "Enter") buscarProfissionais();
  });
}

/* ================================================= */
/* CADASTRO GUIADO */
/* ================================================= */

function preencherCategoriasCadastro() {
  const selectCategoria = document.getElementById("categoria");
  if (!selectCategoria) return;

  selectCategoria.innerHTML = `<option value="">Selecione uma categoria</option>`;
  baseProfissoesNorteServic.forEach(item => {
    selectCategoria.innerHTML += `<option value="${item.categoria}">${item.categoria}</option>`;
  });

  selectCategoria.addEventListener("change", preencherProfissoesDaCategoria);
}

function preencherProfissoesDaCategoria() {
  const selectCategoria = document.getElementById("categoria");
  const selectProfissao = document.getElementById("profissao");
  const servicosBox = document.getElementById("servicosTagsBox");
  if (!selectCategoria || !selectProfissao) return;

  selectProfissao.innerHTML = `<option value="">Selecione uma profissão</option>`;
  servicosSelecionadosCadastro = [];
  atualizarInputServicosSelecionados();

  if (servicosBox) {
    servicosBox.innerHTML = `<p class="servicos-placeholder">Selecione uma profissão para ver os serviços disponíveis.</p>`;
  }

  const categoria = baseProfissoesNorteServic.find(item => item.categoria === selectCategoria.value);
  if (!categoria) return;

  categoria.profissoes.forEach(profissao => {
    selectProfissao.innerHTML += `<option value="${profissao}">${profissao}</option>`;
  });
}

function ativarProfissaoServicos() {
  const selectProfissao = document.getElementById("profissao");
  if (!selectProfissao) return;
  selectProfissao.addEventListener("change", carregarServicosDaProfissao);
}

function pegarServicosFallbackDaCategoria() {
  const categoriaSelecionada = document.getElementById("categoria")?.value || "";
  const categoria = baseProfissoesNorteServic.find(item => item.categoria === categoriaSelecionada);
  return categoria ? categoria.palavras : [];
}

function carregarServicosDaProfissao() {
  const selectProfissao = document.getElementById("profissao");
  const servicosBox = document.getElementById("servicosTagsBox");
  if (!selectProfissao || !servicosBox) return;

  const profissao = selectProfissao.value;
  servicosSelecionadosCadastro = [];
  atualizarInputServicosSelecionados();
  servicosBox.innerHTML = "";

  if (!profissao) {
    servicosBox.innerHTML = `<p class="servicos-placeholder">Selecione uma profissão para ver os serviços disponíveis.</p>`;
    return;
  }

  const servicos = servicosPorProfissaoNorteServic[profissao] || pegarServicosFallbackDaCategoria();

  if (!servicos.length) {
    servicosBox.innerHTML = `<p class="servicos-placeholder">Nenhum serviço pré-definido encontrado. Use o campo "Outro serviço".</p>`;
    return;
  }

  servicos.forEach(servico => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "servico-tag-opcao";
    botao.innerText = servico;
    botao.addEventListener("click", () => alternarServicoSelecionado(servico, botao));
    servicosBox.appendChild(botao);
  });
}

function alternarServicoSelecionado(servico, botao) {
  const existe = servicosSelecionadosCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(servico));

  if (existe) {
    servicosSelecionadosCadastro = servicosSelecionadosCadastro.filter(item => normalizarTextoNorteServic(item) !== normalizarTextoNorteServic(servico));
    botao.classList.remove("ativo");
  } else {
    servicosSelecionadosCadastro.push(servico);
    botao.classList.add("ativo");
  }

  atualizarInputServicosSelecionados();
}

function adicionarServicoExtra() {
  const input = document.getElementById("servicoExtra");
  if (!input) return;

  const valor = input.value.trim();
  if (!valor) return;

  const existe = servicosSelecionadosCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(valor));
  if (!existe) servicosSelecionadosCadastro.push(valor);

  input.value = "";
  atualizarInputServicosSelecionados();
}

function atualizarInputServicosSelecionados() {
  const inputServicos = document.getElementById("servicos");
  const boxSelecionados = document.getElementById("servicosSelecionados");

  if (inputServicos) inputServicos.value = servicosSelecionadosCadastro.join(", ");

  if (boxSelecionados) {
    boxSelecionados.innerHTML = "";
    servicosSelecionadosCadastro.forEach(servico => {
      const tag = document.createElement("span");
      tag.innerText = servico;
      boxSelecionados.appendChild(tag);
    });
  }
}

/* ================================================= */
/* CIDADE INTELIGENTE */
/* ================================================= */

function filtrarCidadesNorteServic(termo) {
  const termoNormalizado = normalizarTextoNorteServic(termo);
  if (!termoNormalizado) return [];

  return cidadesNorteServic
    .filter(cidade => normalizarTextoNorteServic(cidade).includes(termoNormalizado))
    .sort((a, b) => {
      const na = normalizarTextoNorteServic(a);
      const nb = normalizarTextoNorteServic(b);
      const aInicio = na.startsWith(termoNormalizado) ? 0 : 1;
      const bInicio = nb.startsWith(termoNormalizado) ? 0 : 1;
      return aInicio - bInicio || a.localeCompare(b, "pt-BR");
    })
    .slice(0, 12);
}

function iniciarCidadeInteligente() {
  ativarSugestaoCidadePrincipal();
  ativarSugestaoCidadeAtendida();
}

function ativarSugestaoCidadePrincipal() {
  const input = document.getElementById("cidade");
  const caixa = document.getElementById("sugestoesCidade");
  if (!input || !caixa) return;

  input.addEventListener("input", function() {
    const sugestoes = filtrarCidadesNorteServic(input.value);
    caixa.innerHTML = "";

    if (sugestoes.length === 0) {
      caixa.classList.remove("ativo");
      return;
    }

    sugestoes.forEach(cidade => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "sugestao-cidade-item";
      botao.innerText = cidade;
      botao.addEventListener("click", () => {
        input.value = cidade;
        caixa.classList.remove("ativo");
        caixa.innerHTML = "";
      });
      caixa.appendChild(botao);
    });

    caixa.classList.add("ativo");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".campo-cidade-inteligente")) caixa.classList.remove("ativo");
  });
}

function ativarSugestaoCidadeAtendida() {
  const input = document.getElementById("cidadeAtendidaInput");
  const caixa = document.getElementById("sugestoesCidadeAtendida");
  if (!input || !caixa) return;

  input.addEventListener("input", function() {
    const sugestoes = filtrarCidadesNorteServic(input.value);
    caixa.innerHTML = "";

    if (sugestoes.length === 0) {
      caixa.classList.remove("ativo");
      return;
    }

    sugestoes.forEach(cidade => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "sugestao-cidade-item";
      botao.innerText = cidade;
      botao.addEventListener("click", () => {
        adicionarCidadeAtendida(cidade);
        input.value = "";
        caixa.classList.remove("ativo");
        caixa.innerHTML = "";
      });
      caixa.appendChild(botao);
    });

    caixa.classList.add("ativo");
  });
}

function adicionarCidadeAtendida(cidade) {
  const existe = cidadesSelecionadasCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(cidade));
  if (!existe) cidadesSelecionadasCadastro.push(cidade);
  atualizarCidadesSelecionadasVisual();
}

function removerCidadeAtendida(cidade) {
  cidadesSelecionadasCadastro = cidadesSelecionadasCadastro.filter(item => normalizarTextoNorteServic(item) !== normalizarTextoNorteServic(cidade));
  atualizarCidadesSelecionadasVisual();
}

function atualizarCidadesSelecionadasVisual() {
  const box = document.getElementById("cidadesSelecionadas");
  if (!box) return;

  box.innerHTML = "";
  cidadesSelecionadasCadastro.forEach(cidade => {
    const tag = document.createElement("span");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.innerText = "×";
    botao.addEventListener("click", () => removerCidadeAtendida(cidade));
    tag.append(document.createTextNode(cidade + " "), botao);
    box.appendChild(tag);
  });
}

function alternarCidadesAtendidas() {
  const select = document.getElementById("atendeOutrasCidades");
  const box = document.getElementById("boxCidadesAtendidas");
  if (!select || !box) return;

  if (select.value === "Sim" || select.value === "Depende do serviço") {
    box.classList.remove("escondido");
  } else {
    box.classList.add("escondido");
    cidadesSelecionadasCadastro = [];
    atualizarCidadesSelecionadasVisual();
  }
}

/* ================================================= */
/* CADASTRO -> BACKEND */
/* ================================================= */

function dadosFormularioProfissional(incluirSenha = true) {
  const categoriaSelecionada = document.getElementById("categoria")?.value || "";
  const dados = {
    nome: document.getElementById("nome")?.value.trim() || "",
    tipoProfissional: document.getElementById("tipoProfissional")?.value || "",
    categoria: categoriaSelecionada,
    profissao: document.getElementById("profissao")?.value || "",
    servicos: document.getElementById("servicos")?.value.trim() || "",
    palavrasChave: pegarPalavrasDaCategoria(categoriaSelecionada),
    cidade: document.getElementById("cidade")?.value.trim() || "",
    bairro: document.getElementById("bairro")?.value.trim() || "",
    atendeOutrasCidades: document.getElementById("atendeOutrasCidades")?.value || "",
    cidadesAtendidas: pegarCidadesAtendidasCadastro(),
    formaAtendimento: document.getElementById("formaAtendimento")?.value || "",
    whatsapp: limparNumero(document.getElementById("whatsapp")?.value || ""),
    instagram: document.getElementById("instagram")?.value.trim() || "",
    descricao: document.getElementById("descricao")?.value.trim() || "",
    aceitouTermos: !!document.getElementById("aceitouTermos")?.checked,
    aceitouPrivacidade: !!document.getElementById("aceitouPrivacidade")?.checked,
    termosVersao: "2026.06",
    privacidadeVersao: "2026.06"
  };

  if (incluirSenha) {
    dados.senha = document.getElementById("senhaCadastro")?.value.trim() || "";
  }

  return dados;
}


function mostrarAvisoIndicacaoCadastro() {
  const ref = obterCodigoIndicacaoDaURL();
  if (!ref) return;
  const topo = document.querySelector(".cadastro-form-topo");
  if (!topo || document.querySelector(".cadastro-ref-alerta")) return;
  const aviso = document.createElement("div");
  aviso.className = "cadastro-ref-alerta";
  aviso.innerHTML = `<strong>Cadastro por indicação ativo</strong><span>Código aplicado: ${ref}</span>`;
  topo.appendChild(aviso);
}

function iniciarCadastroBackend() {
  const formCadastro = document.getElementById("formCadastro");
  if (!formCadastro) return;

  formCadastro.addEventListener("submit", async function(e) {
    e.preventDefault();

    const botao = formCadastro.querySelector("button[type='submit']") || formCadastro.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";
    const mensagemCadastro = document.getElementById("mensagemCadastro");
    const senhaCadastro = document.getElementById("senhaCadastro")?.value.trim() || "";
    const confirmarSenhaCadastro = document.getElementById("confirmarSenhaCadastro")?.value.trim() || "";
    const servicosSelecionados = document.getElementById("servicos")?.value.trim() || "";

    if (senhaCadastro.length < 6) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Crie uma senha com pelo menos 6 caracteres.";
      return;
    }

    if (senhaCadastro !== confirmarSenhaCadastro) {
      if (mensagemCadastro) mensagemCadastro.innerText = "As senhas não conferem. Verifique e tente novamente.";
      return;
    }

    if (!servicosSelecionados) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Selecione pelo menos um serviço que você realiza.";
      return;
    }

    const aceitouTermos = !!document.getElementById("aceitouTermos")?.checked;
    const aceitouPrivacidade = !!document.getElementById("aceitouPrivacidade")?.checked;

    if (!aceitouTermos || !aceitouPrivacidade) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Para concluir o cadastro, aceite os Termos de Uso e a Política de Privacidade.";
      const boxAceite = document.querySelector(".cadastro-legal-aceite");
      if (boxAceite) boxAceite.classList.add("legal-aceite-alerta");
      return;
    }

    try {
      const textoBotaoLoading = ativarEstadoCarregandoBotao(botao, "Enviando cadastro...");
      mostrarLoading("Otimizando fotos e enviando cadastro...");
      await aguardarPinturaTela(120);

      const arquivoFotoPerfil = document.getElementById("fotoPerfil")?.files[0];
      const arquivosTrabalhos = document.getElementById("fotosTrabalhos")?.files;

      await validarFotoPerfil1000(arquivoFotoPerfil, true);

      const dados = dadosFormularioProfissional(true);
      const refIndicacao = obterCodigoIndicacaoDaURL();
      if (refIndicacao) dados.refIndicacao = refIndicacao;
      dados.fotoPerfil = await converterImagemParaBase64(arquivoFotoPerfil, { maxSize: 700, qualidade: 0.82, exigirQuadrada: true });
      dados.fotosTrabalhos = (await converterVariasImagensParaBase64(arquivosTrabalhos)).slice(0, 3);

      await apiFetch("/api/cadastro", {
        method: "POST",
        body: JSON.stringify(dados)
      });

      if (mensagemCadastro) mensagemCadastro.innerText = "Cadastro enviado com sucesso! Agora ele passará por análise.";

      formCadastro.reset();
      servicosSelecionadosCadastro = [];
      cidadesSelecionadasCadastro = [];
      preencherCategoriasCadastro();
      atualizarInputServicosSelecionados();
      atualizarCidadesSelecionadasVisual();
      alternarCidadesAtendidas();
  adicionarAdminNoRodape();

      const servicosBox = document.getElementById("servicosTagsBox");
      if (servicosBox) {
        servicosBox.innerHTML = `<p class="servicos-placeholder">Selecione uma profissão para ver os serviços disponíveis.</p>`;
      }
    } catch (error) {
      if (mensagemCadastro) mensagemCadastro.innerText = error.message;
    } finally {
      esconderLoading();
      restaurarEstadoBotao(botao, typeof textoBotaoLoading !== "undefined" ? textoBotaoLoading : textoOriginal);
    }
  });
}

/* ================================================= */
/* PERFIL PÚBLICO */
/* ================================================= */


function avaliacoesPerfilHTML(avaliacoes = []) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return `
      <div class="avaliacoes-vazio avaliacoes-vazio-elite">
        <div class="avaliacoes-empty-icon">★</div>
        <div>
          <strong>Nenhuma avaliação publicada ainda.</strong>
          <p>Contratou este profissional? Seja o primeiro a deixar uma avaliação analisada pela Norte Servic.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="avaliacoes-lista avaliacoes-lista-elite">
      ${avaliacoes.slice(0, 6).map(item => `
        <article class="avaliacao-card-publica avaliacao-card-elite">
          <div class="avaliacao-card-topo">
            <div class="avaliacao-avatar">${String(item.nomeCliente || "C").charAt(0).toUpperCase()}</div>
            <div class="avaliacao-identidade">
              <strong>${item.nomeCliente}</strong>
              <small>${formatarDataCurta(item.criadoEm)}</small>
            </div>
            <span class="avaliacao-nota-badge">${estrelasHTML(item.nota)}</span>
          </div>
          <p>${item.comentario}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function formularioAvaliacaoHTML(profissionalId) {
  return `
    <form class="form-avaliacao form-avaliacao-elite" id="formAvaliacaoProfissional" data-profissional-id="${profissionalId}">
      <div class="form-avaliacao-topo form-avaliacao-topo-elite">
        <div>
          <span>Avaliação segura</span>
          <h3>Avalie este atendimento</h3>
          <p>Sua opinião passa por análise antes de aparecer no perfil.</p>
        </div>
        <div class="avaliacao-mini-selo">✓ Moderado</div>
      </div>

      <div class="form-avaliacao-grid form-avaliacao-grid-elite">
        <div>
          <label>Seu nome</label>
          <input type="text" id="avaliacaoNomeCliente" placeholder="Ex: Ana Silva" required>
        </div>

        <div>
          <label>Nota</label>
          <div class="avaliacao-estrelas avaliacao-estrelas-elite" id="avaliacaoEstrelas">
            ${[1,2,3,4,5].map(nota => `<button type="button" data-nota="${nota}" aria-label="${nota} estrelas">★</button>`).join("")}
          </div>
          <input type="hidden" id="avaliacaoNota" value="5">
        </div>
      </div>

      <div class="avaliacao-comentario-linha">
        <label>Comentário breve</label>
        <textarea id="avaliacaoComentario" rows="3" placeholder="Como foi o atendimento? Seja direto." required></textarea>
      </div>

      <button type="submit" class="avaliacao-submit-elite">Enviar avaliação</button>
      <p id="mensagemAvaliacao"></p>
    </form>
  `;
}

function iniciarFormularioAvaliacao(profissionalId) {
  const form = document.getElementById("formAvaliacaoProfissional");
  const estrelas = document.getElementById("avaliacaoEstrelas");
  const notaInput = document.getElementById("avaliacaoNota");
  if (!form || !estrelas || !notaInput) return;

  function pintarEstrelas(nota) {
    estrelas.querySelectorAll("button").forEach(botao => {
      botao.classList.toggle("ativo", Number(botao.dataset.nota) <= nota);
    });
  }

  pintarEstrelas(Number(notaInput.value || 5));

  estrelas.querySelectorAll("button").forEach(botao => {
    botao.addEventListener("click", () => {
      const nota = Number(botao.dataset.nota || 5);
      notaInput.value = String(nota);
      pintarEstrelas(nota);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemAvaliacao");
    const botao = form.querySelector("button[type='submit']");
    const textoOriginal = botao ? botao.innerText : "";

    const dados = {
      nomeCliente: document.getElementById("avaliacaoNomeCliente")?.value.trim() || "",
      nota: Number(notaInput.value || 5),
      comentario: document.getElementById("avaliacaoComentario")?.value.trim() || ""
    };

    try {
      if (botao) {
        botao.disabled = true;
        botao.innerText = "Enviando...";
      }

      await enviarAvaliacaoProfissional(profissionalId, dados);

      if (mensagem) mensagem.innerText = "Avaliação enviada! Ela aparecerá no perfil após aprovação da Norte Servic.";
      form.reset();
      notaInput.value = "5";
      pintarEstrelas(5);
    } catch (error) {
      if (mensagem) mensagem.innerText = error.message;
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.innerText = textoOriginal;
      }
    }
  });
}


async function carregarPerfilProfissional() {
  const container = document.getElementById("perfilProfissional");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  try {
    const profissional = await carregarProfissionalPorId(id);
    const avaliacoesPublicas = await carregarAvaliacoesProfissional(id);
    const linkWhatsApp = criarLinkWhatsApp(profissional.whatsapp);
    const inicial = profissional.nome ? profissional.nome.charAt(0).toUpperCase() : "?";
    const fotoPerfil = profissional.fotoPerfil ? `<img src="${profissional.fotoPerfil}" alt="Foto de ${profissional.nome}">` : inicial;
    const servicosArray = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean);
    const cidadesTexto = formatarCidadesAtendidas(profissional);

    const fotosTrabalhosPerfil = Array.isArray(profissional.fotosTrabalhos) ? profissional.fotosTrabalhos : [];
    const galeriaTrabalhos = fotosTrabalhosPerfil.length > 0
      ? `
        <div class="galeria-carousel" data-carousel="trabalhos">
          <div class="galeria-carousel-track">
            ${fotosTrabalhosPerfil.map((foto, idx) => `
              <figure class="galeria-slide">
                <img src="${foto}" alt="Foto ${idx + 1} de trabalho realizado por ${profissional.nome}">
              </figure>
            `).join("")}
          </div>
          ${fotosTrabalhosPerfil.length > 1 ? `<div class="galeria-carousel-dots">${fotosTrabalhosPerfil.map((_, idx) => `<button type="button" class="${idx === 0 ? "ativo" : ""}" aria-label="Ver foto ${idx + 1}"></button>`).join("")}</div>` : ""}
        </div>
      `
      : `<p>Este profissional ainda não adicionou fotos dos trabalhos. Mesmo assim, você pode entrar em contato e solicitar referências.</p>`;

    container.innerHTML = `
      <a class="botao-voltar-perfil" href="index.html">← Voltar para a busca</a>
      <div class="perfil-premium">
        <aside class="perfil-lateral">
          <div class="perfil-capa"></div>
          <div class="perfil-foto-area"><div class="perfil-foto-premium">${fotoPerfil}</div></div>
          <div class="perfil-lateral-info">
            <span class="selo-verificado-premium">${profissional.verificado ? "✓ Profissional verificado" : "Cadastro em análise"}</span>
            <h1 class="nome-profissional-linha perfil-nome"><span>${profissional.nome}</span>${seloVerificadoPlanoHTML(profissional, "perfil")}</h1>
            <p class="profissao">${profissional.profissao}</p>
            <div class="perfil-meta">
              <p>📍 ${profissional.cidade} - ${profissional.bairro}</p>
              <p>🏷️ ${profissional.categoria || "Categoria não informada"}</p>
              <p>🌎 Atende: ${cidadesTexto}</p>
              <p>💼 ${profissional.formaAtendimento || "Atendimento não informado"}</p>
              <p>⭐ ${profissional.avaliacao || "Novo"} | ${profissional.avaliacoes || 0} avaliações</p>
              <p>⚡ Atendimento direto pelo WhatsApp</p>
            </div>
            <a class="botao-whatsapp-premium" href="${linkWhatsApp}" target="_blank">Chamar no WhatsApp</a>
          </div>
        </aside>
        <section class="perfil-conteudo">
          <div class="perfil-hero-texto perfil-hero-compacto-premium">
            <div>
              <span>Perfil profissional</span>
              <h2>${profissional.nome}</h2>
              <p>Informações, serviços, atendimento e avaliações em um perfil verificado pela Norte Servic.</p>
            </div>
            <div class="perfil-hero-mini-stats">
              <strong>${profissional.avaliacao || "Novo"}</strong>
              <small>${profissional.avaliacoes || 0} avaliações</small>
            </div>
          </div>

          <div class="perfil-info-compact-grid">
            <div class="perfil-section-clean perfil-section-mini perfil-section-sobre">
              <span class="perfil-mini-label">Sobre</span>
              <h2>Sobre o profissional</h2>
              <p>${profissional.descricao}</p>
            </div>

            <div class="perfil-section-clean perfil-section-mini perfil-section-servicos">
              <span class="perfil-mini-label">Serviços</span>
              <h2>Serviços que realiza</h2>
              <div class="servicos-premium servicos-premium-compacto">${servicosArray.slice(0, 8).map(s => `<span>${s}</span>`).join("")}</div>
            </div>

            <div class="perfil-section-clean perfil-section-mini perfil-section-atendimento">
              <span class="perfil-mini-label">Atendimento</span>
              <h2>Área de atendimento</h2>
              <div class="perfil-atendimento-lista">
                <p><strong>Cidade:</strong> ${profissional.cidade}</p>
                <p><strong>Atende:</strong> ${cidadesTexto}</p>
                <p><strong>Formato:</strong> ${profissional.formaAtendimento || "Não informado"}</p>
                <p><strong>Instagram:</strong> ${instagramHTML(profissional.instagram, "perfil-instagram")}</p>
              </div>
            </div>
          </div>

          <div class="perfil-section-clean perfil-avaliacoes-section perfil-avaliacoes-prioridade perfil-avaliacoes-elite">
            <div class="avaliacoes-header avaliacoes-header-elite">
              <div>
                <span>Confiança pública</span>
                <h2>Avaliações verificadas</h2>
                <p>Comentários analisados antes de aparecer no perfil.</p>
              </div>
              <div class="avaliacoes-score-box">
                <strong>${profissional.avaliacao || "Novo"}</strong>
                <small>${profissional.avaliacoes || 0} avaliações</small>
              </div>
            </div>
            ${avaliacoesPerfilHTML(avaliacoesPublicas)}
            ${formularioAvaliacaoHTML(profissional.id)}
          </div>
          <div class="perfil-section-clean perfil-section-mini perfil-fotos-compacto"><h2>Fotos dos trabalhos</h2>${galeriaTrabalhos}</div>
        </section>
      </div>
    `;
    iniciarCarrosseisFotos();
    iniciarFormularioAvaliacao(profissional.id);
  } catch (error) {
    container.innerHTML = `
      <a class="botao-voltar-perfil" href="index.html">← Voltar para a busca</a>
      <div class="perfil-conteudo"><div class="perfil-hero-texto"><span>Perfil indisponível</span><h2>Profissional não encontrado</h2><p>${error.message}</p></div></div>
    `;
  }
}


function iniciarCarrosseisFotos() {
  document.querySelectorAll(".galeria-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".galeria-carousel-track");
    const slides = Array.from(carousel.querySelectorAll(".galeria-slide"));
    const dots = Array.from(carousel.querySelectorAll(".galeria-carousel-dots button"));

    if (!track || slides.length <= 1 || carousel.dataset.iniciado === "true") return;

    carousel.dataset.iniciado = "true";
    let index = 0;

    function irPara(proximo) {
      index = (proximo + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, idx) => dot.classList.toggle("ativo", idx === index));
    }

    dots.forEach((dot, idx) => dot.addEventListener("click", () => irPara(idx)));
    setInterval(() => irPara(index + 1), 4200);
  });
}

function iniciarCarrosselBannersMobile() {
  const track = document.querySelector(".home-banners-track");
  if (!track || track.dataset.autoMobile === "true") return;

  track.dataset.autoMobile = "true";
  let index = 0;

  function mover() {
    if (!window.matchMedia("(max-width: 820px)").matches) return;

    const cards = Array.from(track.querySelectorAll(".home-banner-card"));
    if (cards.length <= 1) return;

    index = (index + 1) % cards.length;
    const card = cards[index];
    track.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  }

  let intervalo = setInterval(mover, 3800);

  track.addEventListener("touchstart", () => {
    clearInterval(intervalo);
    intervalo = setInterval(mover, 5200);
  }, { passive: true });
}


function iniciarAutoScrollFaixasHome() {
  const faixas = [
    { seletor: ".categorias", item: "button", intervalo: 2400, media: "(max-width: 820px)" },
    { seletor: ".passos", item: "div", intervalo: 3200, media: "(max-width: 820px)" },
    { seletor: ".por-que-grid", item: ".por-que-card", intervalo: 3600, media: "(max-width: 820px)" }
  ];

  faixas.forEach((config) => {
    const faixa = document.querySelector(config.seletor);
    if (!faixa || faixa.dataset.autoScrollFaixa === "true") return;

    faixa.dataset.autoScrollFaixa = "true";
    let indice = 0;
    let timer;

    const reiniciar = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!window.matchMedia(config.media).matches) return;

        const itens = Array.from(faixa.querySelectorAll(config.item));
        if (itens.length <= 1) return;

        indice = (indice + 1) % itens.length;
        const alvo = itens[indice];
        const margem = config.seletor === ".categorias" ? 8 : 16;

        faixa.scrollTo({
          left: Math.max(0, alvo.offsetLeft - margem),
          behavior: "smooth"
        });
      }, config.intervalo);
    };

    reiniciar();

    ["touchstart", "pointerdown", "wheel"].forEach((evento) => {
      faixa.addEventListener(evento, reiniciar, { passive: true });
    });
  });
}

/* ================================================= */
/* LOGIN E PAINEL PROFISSIONAL */
/* ================================================= */

function iniciarLoginProfissional() {
  const form = document.getElementById("formLoginProfissional");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemLoginProfissional");
    const whatsapp = limparNumero(document.getElementById("loginWhatsapp")?.value || "");
    const senha = document.getElementById("loginSenha")?.value.trim() || "";
    const botao = form.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";

    try {
      if (botao) {
        botao.innerText = "Entrando...";
        botao.disabled = true;
      }
      mostrarLoading("Entrando...");

      const dados = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ whatsapp, senha })
      });

      setTokenProfissional(dados.token);
      const paramsLogin = new URLSearchParams(window.location.search);
      const voltar = paramsLogin.get("voltar");
      window.location.href = voltar === "planos" ? "planos.html?origem=login" : "painel-profissional.html";
    } catch (error) {
      if (mensagem) mensagem.innerText = error.message;
    } finally {
      esconderLoading();
      if (botao) {
        botao.innerText = textoOriginal;
        botao.disabled = false;
      }
    }
  });
}

async function carregarMinhaConta() {
  const token = getTokenProfissional();
  if (!token) throw new Error("Login necessário.");

  return apiFetch("/api/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

function sairProfissional() {
  removerTokenProfissional();
  window.location.href = "login.html";
}

function exigirLoginRedirect() {
  if (!getTokenProfissional()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}


async function carregarMinhasIndicacoes() {
  const token = getTokenProfissional();
  if (!token) throw new Error("Login necessário.");
  return apiFetch("/api/me/indicacoes", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function copiarTextoNorteServic(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    alert("Link copiado com sucesso.");
  } catch (_) {
    prompt("Copie seu link de indicação:", texto);
  }
}

async function solicitarSaqueIndicacao() {
  const chavePix = document.getElementById("indicacaoChavePix")?.value.trim() || "";
  const tipoChavePix = document.getElementById("indicacaoTipoChavePix")?.value.trim() || "";
  const nomeTitular = document.getElementById("indicacaoNomeTitular")?.value.trim() || "";
  const cpfCnpjTitular = document.getElementById("indicacaoCpfCnpjTitular")?.value.trim() || "";

  if (!tipoChavePix || !chavePix || !nomeTitular || !cpfCnpjTitular) {
    alert("Preencha todos os dados para saque: tipo de chave, chave Pix, nome do titular e CPF/CNPJ.");
    return;
  }

  if (!confirm("Enviar solicitação de saque para análise do administrador?")) return;

  try {
    await apiFetch("/api/me/indicacoes/saques", {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({ chavePix, tipoChavePix, nomeTitular, cpfCnpjTitular })
    });
    alert("Solicitação de saque enviada para análise do admin.");
    const dados = await carregarMinhasIndicacoes();
    renderizarPainelIndicacoes(dados);
  } catch (error) {
    alert(error.message);
  }
}

function renderizarPainelIndicacoes(dados) {
  const box = document.getElementById("painelIndicacoesProfissional");
  if (!box) return;

  const resumo = dados.resumo || {};
  const saldoDisponivel = Number(resumo.saldoDisponivel || 0);
  const saqueMinimo = Number(dados.saqueMinimo || 100);
  const podeSacar = saldoDisponivel >= saqueMinimo;
  const indicacoes = Array.isArray(dados.indicacoes) ? dados.indicacoes.slice(0, 8) : [];
  const saques = Array.isArray(dados.saques) ? dados.saques.slice(0, 5) : [];

  box.innerHTML = `
    <div class="indicacoes-topo">
      <span class="painel-box-badge">Programa de indicação</span>
      <h3>Minhas indicações</h3>
      <p>Ganhe <strong>${formatarMoedaIndicacao(dados.comissaoPorIndicacao || 10)}</strong> quando seu indicado assinar o Plano Premium de R$ 39,90. A comissão libera após ${dados.diasLiberacao || 5} dias.</p>
    </div>

    <div class="indicacoes-link-box">
      <small>Seu link exclusivo de indicação</small>
      <div>
        <input type="text" value="${dados.link || ""}" readonly>
        <button type="button" onclick="copiarTextoNorteServic('${String(dados.link || "").replace(/'/g, "\'")}')">Copiar</button>
      </div>
      <span>Código: ${dados.codigo || "-"}</span>
    </div>

    <div class="indicacoes-stats">
      <article><strong>${resumo.totalIndicacoes || 0}</strong><span>Total de indicados</span></article>
      <article><strong>${resumo.assinaturasConfirmadas || 0}</strong><span>Assinaturas confirmadas</span></article>
      <article><strong>${formatarMoedaIndicacao(saldoDisponivel)}</strong><span>Saldo disponível</span></article>
      <article><strong>${formatarMoedaIndicacao(resumo.saldoPendente || 0)}</strong><span>Comissão pendente</span></article>
    </div>

    <div class="indicacoes-saque-box indicacoes-saque-box-completo">
      <div class="indicacoes-saque-head">
        <strong>Saque mínimo: ${formatarMoedaIndicacao(saqueMinimo)}</strong>
        <span>${podeSacar ? "Você já pode solicitar saque." : `Faltam ${formatarMoedaIndicacao(Math.max(0, saqueMinimo - saldoDisponivel))} para liberar saque.`}</span>
      </div>
      <div class="indicacoes-saque-form">
        <label>Tipo de Chave Pix
          <select id="indicacaoTipoChavePix" ${podeSacar ? "" : "disabled"}>
            <option value="">Selecione</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="aleatoria">Chave aleatória</option>
          </select>
        </label>
        <label>Chave Pix
          <input id="indicacaoChavePix" type="text" placeholder="Digite sua chave Pix" ${podeSacar ? "" : "disabled"}>
        </label>
        <label>Nome do Titular
          <input id="indicacaoNomeTitular" type="text" placeholder="Nome do titular da chave" ${podeSacar ? "" : "disabled"}>
        </label>
        <label>CPF/CNPJ do Titular
          <input id="indicacaoCpfCnpjTitular" type="text" placeholder="CPF ou CNPJ do titular" ${podeSacar ? "" : "disabled"}>
        </label>
      </div>
      <p>A chave Pix deve pertencer ao profissional cadastrado ou responsável informado.</p>
      <button type="button" ${podeSacar ? "" : "disabled"} onclick="solicitarSaqueIndicacao()">Solicitar saque</button>
    </div>

    <div class="indicacoes-lista">
      <h4>Histórico de comissões</h4>
      ${indicacoes.length ? indicacoes.map(item => `
        <div class="indicacao-item">
          <div>
            <strong>${item.indicadoNome || "Profissional indicado"}</strong>
            <span>${item.statusLabel || item.status || "Pendente"} · ${formatarDataIndicacao(item.criadoEm)}</span>
          </div>
          <b class="status-${statusIndicacaoClasse(item.status)}">${formatarMoedaIndicacao(item.valorComissao || 0)}</b>
        </div>
      `).join("") : `<p class="indicacoes-vazio">Compartilhe seu link para começar a indicar.</p>`}
    </div>

    ${saques.length ? `<div class="indicacoes-lista"><h4>Saques recentes</h4>${saques.map(s => `<div class="indicacao-item"><div><strong>${formatarMoedaIndicacao(s.valor)}</strong><span>${s.status} · ${formatarDataIndicacao(s.solicitado_em)}</span></div><b>${s.chave_pix || ""}</b></div>`).join("")}</div>` : ""}
  `;
}

async function carregarPainelProfissional() {
  const header = document.getElementById("painelProfissionalHeader");
  const resumo = document.getElementById("painelResumoProfissional");
  const status = document.getElementById("painelStatusProfissional");
  const linkPerfil = document.getElementById("linkPerfilPublico");
  const painelPlano = document.getElementById("painelPlanoProfissional");
  const painelDicas = document.getElementById("painelDicasProfissional");
  const painelIndicacoes = document.getElementById("painelIndicacoesProfissional");

  if (!header || !resumo || !status) return;
  if (!exigirLoginRedirect()) return;

  try {
    const profissional = await carregarMinhaConta();
    const cidadesTexto = formatarCidadesAtendidas(profissional);
    const perfilDisponivel = profissional.status === "aprovado";
    const planoAtual = profissional.planoAtual || "Gratuito";
    const planoStatus = profissional.planoStatus || "ativo";
    const forcaPerfil = calcularForcaPerfil(profissional);
    const totalServicos = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean).length;
    const foto = profissional.fotoPerfil ? `<img src="${profissional.fotoPerfil}" alt="Foto de ${profissional.nome}">` : `<span>${profissional.nome ? profissional.nome.charAt(0).toUpperCase() : "?"}</span>`;

    header.innerHTML = `<span>Painel do profissional</span><h1>Olá, ${profissional.nome}.</h1><p>Gerencie sua conta e acompanhe seu perfil na Norte Servic.</p>`;

    resumo.innerHTML = `
      <div class="painel-foto-profissional">${foto}</div>
      <div class="painel-card-conteudo-premium">
        <span class="admin-status ${perfilDisponivel ? "status-aprovado" : "status-pendente"}">${perfilDisponivel ? "Perfil publicado" : "Aguardando aprovação"}</span>
        <h2 class="nome-profissional-linha painel-nome"><span>${profissional.nome}</span>${seloVerificadoPlanoHTML(profissional, "painel")}</h2>
        <p class="profissao">${profissional.profissao || "Profissão não informada"}</p>
        <div class="painel-chip-row">
          <span>${profissional.categoria || "Categoria não informada"}</span>
          <span>${profissional.tipoProfissional || "Tipo não informado"}</span>
          <span>${profissional.formaAtendimento || "Atendimento não informado"}</span>
        </div>
        <div class="painel-info-lista">
          <p><strong>Atende:</strong> ${cidadesTexto}</p>
          <p><strong>WhatsApp:</strong> ${profissional.whatsapp || "Não informado"}</p>
          <p><strong>Serviços selecionados:</strong> ${totalServicos}</p>
          <p class="painel-linha-plano"><strong>Plano:</strong> <span class="painel-plano-chip destaque">${planoAtual}</span></p>
        </div>
        <p class="painel-descricao-preview">${profissional.descricao || "Adicione uma descrição profissional para aumentar a confiança dos clientes."}</p>
      </div>
    `;

    status.innerHTML = `
      <div class="admin-stat-card admin-stat-destaque plano-card"><strong>${planoAtual}</strong><span>Plano atual</span></div>
      <div class="admin-stat-card admin-stat-destaque status-card"><strong>${String(planoStatus).toUpperCase()}</strong><span>Status do plano</span></div>
      <div class="admin-stat-card"><strong>${perfilDisponivel ? "Sim" : "Não"}</strong><span>Perfil publicado</span></div>
      <div class="admin-stat-card"><strong>${forcaPerfil}%</strong><span>Força do perfil</span></div>
    `;

    if (painelPlano) {
      painelPlano.innerHTML = `
        <span class="painel-box-badge">Plano ativo</span>
        <h3>${planoAtual}</h3>
        <p>Status: <strong>${planoStatus}</strong> · Força do perfil: <strong>${forcaPerfil}%</strong>.</p>
        <div class="painel-forca-perfil"><div style="width: ${forcaPerfil}%"></div></div>
        <a href="planos.html?origem=painel" class="painel-plano-cta">Ver planos</a>
      `;
    }

    if (painelDicas) {
      painelDicas.innerHTML = `
        <span class="painel-box-badge">Ajustes rápidos</span>
        <h3>Melhore seu perfil</h3>
        <div class="painel-dicas-compactas">
          <span>Foto real</span>
          <span>Serviços corretos</span>
          <span>Cidades atualizadas</span>
          <span>WhatsApp ativo</span>
        </div>
      `;
    }

    if (painelIndicacoes) {
      try {
        const dadosIndicacoes = await carregarMinhasIndicacoes();
        renderizarPainelIndicacoes(dadosIndicacoes);
      } catch (erroIndicacoes) {
        painelIndicacoes.innerHTML = `<span class="painel-box-badge">Programa de indicação</span><h3>Indicações indisponíveis</h3><p>${erroIndicacoes.message}</p>`;
      }
    }

    if (linkPerfil) {
      if (perfilDisponivel) {
        linkPerfil.href = `perfil.html?id=${profissional.id}`;
      } else {
        linkPerfil.href = "#";
        linkPerfil.addEventListener("click", e => {
          e.preventDefault();
          alert("Seu perfil ainda está aguardando aprovação.");
        });
      }
    }
  } catch (error) {
    removerTokenProfissional();
    window.location.href = "login.html";
  }
}

/* ================================================= */
/* EDITAR PERFIL */
/* ================================================= */

async function preencherFormularioEdicao(profissional) {
  const setValue = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.value = valor || "";
  };

  setValue("nome", profissional.nome);
  setValue("tipoProfissional", profissional.tipoProfissional);
  setValue("cidade", profissional.cidade);
  setValue("bairro", profissional.bairro);
  setValue("atendeOutrasCidades", profissional.atendeOutrasCidades);
  setValue("formaAtendimento", profissional.formaAtendimento);
  setValue("whatsapp", profissional.whatsapp);
  setValue("instagram", profissional.instagram);
  setValue("descricao", profissional.descricao);

  const categoria = document.getElementById("categoria");
  const profissao = document.getElementById("profissao");

  if (categoria) {
    categoria.value = profissional.categoria || "";
    preencherProfissoesDaCategoria();
  }

  if (profissao) {
    profissao.value = profissional.profissao || "";
    carregarServicosDaProfissao();
  }

  servicosSelecionadosCadastro = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean);
  atualizarInputServicosSelecionados();

  document.querySelectorAll(".servico-tag-opcao").forEach(botao => {
    const texto = botao.innerText.trim();
    if (servicosSelecionadosCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(texto))) {
      botao.classList.add("ativo");
    }
  });

  cidadesSelecionadasCadastro = Array.isArray(profissional.cidadesAtendidas)
    ? profissional.cidadesAtendidas.filter(cidade => normalizarTextoNorteServic(cidade) !== normalizarTextoNorteServic(profissional.cidade))
    : [];

  fotosTrabalhosEdicaoAtuais = Array.isArray(profissional.fotosTrabalhos)
    ? profissional.fotosTrabalhos.slice(0, limiteFotosPorPlano(profissional))
    : [];

  renderizarPreviewImagensEdicao(profissional);

  alternarCidadesAtendidas();
  adicionarAdminNoRodape();
  atualizarCidadesSelecionadasVisual();
}


function renderizarPreviewImagensEdicao(profissional = {}) {
  const preview = document.getElementById("previewImagensEdicao");
  if (!preview) return;

  const fotoPerfilHtml = profissional.fotoPerfil
    ? `<img src="${profissional.fotoPerfil}" alt="Foto atual do perfil" loading="lazy" decoding="async">`
    : `<span>Sem foto de perfil</span>`;

  const fotos = Array.isArray(fotosTrabalhosEdicaoAtuais) ? fotosTrabalhosEdicaoAtuais : [];

  preview.innerHTML = `
    <div class="preview-foto-atual">
      <strong>Foto atual do perfil</strong>
      ${fotoPerfilHtml}
    </div>

    <div class="preview-trabalhos-atual">
      <strong>Fotos atuais dos serviços</strong>
      ${fotos.length ? fotos.map((foto, index) => `
        <div class="foto-servico-editavel">
          <img src="${foto}" alt="Foto de serviço atual" loading="lazy" decoding="async">
          <button type="button" onclick="removerFotoTrabalhoEdicao(${index})">Remover</button>
        </div>
      `).join("") : `<span>Nenhuma foto de serviço adicionada.</span>`}
    </div>
  `;
}

function removerFotoTrabalhoEdicao(index) {
  fotosTrabalhosEdicaoAtuais = fotosTrabalhosEdicaoAtuais.filter((_, i) => i !== index);
  renderizarPreviewImagensEdicao(profissionalAtualEdicaoGlobal || {});
}

let profissionalAtualEdicaoGlobal = null;

function iniciarEditarPerfil() {
  const form = document.getElementById("formEditarPerfil");
  if (!form) return;

  if (!exigirLoginRedirect()) return;

  let profissionalAtual = null;

  carregarMinhaConta()
    .then(profissional => {
      profissionalAtual = profissional;
      profissionalAtualEdicaoGlobal = profissional;
      preencherFormularioEdicao(profissional);
    })
    .catch(() => {
      removerTokenProfissional();
      window.location.href = "login.html";
    });

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemEditarPerfil");
    const novaSenha = document.getElementById("novaSenhaPerfil")?.value.trim() || "";
    const confirmarSenha = document.getElementById("confirmarNovaSenhaPerfil")?.value.trim() || "";
    const servicos = document.getElementById("servicos")?.value.trim() || "";
    const botao = form.querySelector("button[type='submit']") || form.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";

    if (!servicos) {
      if (mensagem) mensagem.innerText = "Selecione pelo menos um serviço.";
      return;
    }

    if (novaSenha || confirmarSenha) {
      if (novaSenha.length < 6) {
        if (mensagem) mensagem.innerText = "A nova senha precisa ter pelo menos 6 caracteres.";
        return;
      }
      if (novaSenha !== confirmarSenha) {
        if (mensagem) mensagem.innerText = "As novas senhas não conferem.";
        return;
      }
    }

    try {
      if (botao) {
        botao.innerText = "Salvando...";
        botao.disabled = true;
      }
      mostrarLoading("Salvando alterações...");

      const dados = dadosFormularioProfissional(false);
      dados.servicos = servicos;
      dados.senha = novaSenha || undefined;

      const arquivoFotoPerfil = document.getElementById("fotoPerfilEditar")?.files[0];
      const arquivosTrabalhos = document.getElementById("fotosTrabalhosEditar")?.files;
      const fotosAtuais = Array.isArray(fotosTrabalhosEdicaoAtuais) ? fotosTrabalhosEdicaoAtuais : [];
      const limiteFotos = limiteFotosPorPlano(profissionalAtual || {});

      await validarFotoPerfil1000(arquivoFotoPerfil, false);

      dados.fotoPerfil = arquivoFotoPerfil
        ? await converterImagemParaBase64(arquivoFotoPerfil, { maxSize: 700, qualidade: 0.82, exigirQuadrada: true })
        : (profissionalAtual?.fotoPerfil || "");

      const novasFotosTrabalho = await converterVariasImagensParaBase64(arquivosTrabalhos);
      dados.fotosTrabalhos = novasFotosTrabalho.length
        ? [...fotosAtuais, ...novasFotosTrabalho].slice(0, limiteFotos)
        : fotosAtuais;

      await apiFetch("/api/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${getTokenProfissional()}` },
        body: JSON.stringify(dados)
      });

      if (mensagem) mensagem.innerText = "Alterações salvas. Se dados importantes mudaram, seu perfil voltou para análise.";
      setTimeout(() => window.location.href = "painel-profissional.html", 900);
    } catch (error) {
      if (mensagem) mensagem.innerText = error.message;
    } finally {
      esconderLoading();
      if (botao) {
        botao.innerText = textoOriginal;
        botao.disabled = false;
      }
    }
  });
}

/* ================================================= */
/* ADMIN */
/* ================================================= */

function entrarAdmin() {
  const senha = document.getElementById("senhaAdmin")?.value || "";
  const erro = document.getElementById("erroSenha");

  if (!senha) {
    if (erro) erro.innerText = "Digite a senha do admin.";
    return;
  }

  setAdminPassword(senha);
  const loginAdmin = document.getElementById("loginAdmin");
  const painelAdmin = document.getElementById("painelAdmin");
  if (loginAdmin) loginAdmin.classList.add("escondido");
  if (painelAdmin) painelAdmin.classList.remove("escondido");
  mostrarAdmin();
}

function ativarEnterNoAdmin() {
  const campoSenha = document.getElementById("senhaAdmin");
  if (!campoSenha) return;
  campoSenha.addEventListener("keyup", e => {
    if (e.key === "Enter") entrarAdmin();
  });
}

function filtrarAdmin(status, botao = null) {
  filtroAdminAtual = status;
  document.querySelectorAll(".admin-filtros button").forEach(btn => btn.classList.remove("ativo"));
  if (botao) botao.classList.add("ativo");
  mostrarAdmin();
}

async function buscarAdminProfissionais() {
  return apiFetch("/api/admin/profissionais", {
    headers: { "x-admin-password": getAdminPassword() }
  });
}

async function buscarAdminPagamentos() {
  return apiFetch("/api/admin/pagamentos", {
    headers: { "x-admin-password": getAdminPassword() }
  });
}

function filtrarPagamentosAdmin(status, botao = null) {
  filtroPagamentosAdminAtual = status;
  document.querySelectorAll(".admin-filtros-pagamentos button").forEach(btn => btn.classList.remove("ativo"));
  if (botao) botao.classList.add("ativo");
  renderizarAdminPagamentos(pagamentosAdminCache);
}

function calcularResumoFinanceiroAdmin(pagamentos = [], profissionais = []) {
  const pagos = pagamentos.filter(p => statusPagamentoAdmin(p) === "pago");
  const aguardando = pagamentos.filter(p => statusPagamentoAdmin(p) === "aguardando");
  const expirados = pagamentos.filter(p => statusPagamentoAdmin(p) === "expirado");
  const bruto = pagos.reduce((total, p) => total + valorPagamentoNumero(p), 0);
  const liquido = pagos.reduce((total, p) => total + valorLiquidoEstimado(p), 0);
  const taxa = Math.max(0, bruto - liquido);

  const aprovados = profissionais.filter(p => p.status === "aprovado");
  const assinantes = aprovados.filter(p => {
    const plano = String(p.planoAtual || p.plano_atual || "Gratuito").toLowerCase();
    const status = String(p.planoStatus || p.plano_status || "ativo").toLowerCase();
    return plano && plano !== "gratuito" && plano !== "free" && status === "ativo";
  });
  const gratuitos = aprovados.filter(p => !assinantes.includes(p));

  return { pagos, aguardando, expirados, bruto, liquido, taxa, assinantes, gratuitos };
}

function renderizarResumoFinanceiroAdmin(pagamentos = [], profissionais = []) {
  const resumo = calcularResumoFinanceiroAdmin(pagamentos, profissionais);
  const box = document.getElementById("adminFinanceiroResumo");
  if (box) {
    box.innerHTML = `
      <article class="finance-card destaque"><span>Faturamento bruto</span><strong>${formatarMoedaBR(resumo.bruto)}</strong><small>Total de planos pagos</small></article>
      <article class="finance-card"><span>Saldo estimado Efí</span><strong>${formatarMoedaBR(resumo.liquido)}</strong><small>Descontando taxa estimada</small></article>
      <article class="finance-card"><span>Taxas estimadas</span><strong>${formatarMoedaBR(resumo.taxa)}</strong><small>Aprox. 1,21% pelo primeiro pagamento</small></article>
      <article class="finance-card"><span>Assinaturas pagas</span><strong>${resumo.pagos.length}</strong><small>Pagamentos confirmados</small></article>
      <article class="finance-card"><span>Aguardando</span><strong>${resumo.aguardando.length}</strong><small>Pix gerados e não pagos</small></article>
      <article class="finance-card"><span>Expirados</span><strong>${resumo.expirados.length}</strong><small>Pix vencidos ou não concluídos</small></article>
      <article class="finance-card"><span>Assinantes ativos</span><strong>${resumo.assinantes.length}</strong><small>Profissionais com plano</small></article>
      <article class="finance-card"><span>Gratuitos</span><strong>${resumo.gratuitos.length}</strong><small>Perfis aprovados sem plano</small></article>
    `;
  }

  renderizarGraficoFaturamentoAdmin(resumo.pagos);
}

function renderizarGraficoFaturamentoAdmin(pagos = []) {
  const grafico = document.getElementById("adminGraficoFaturamento");
  if (!grafico) return;

  const dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (6 - i));
    return {
      chave: data.toISOString().slice(0, 10),
      label: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      total: 0
    };
  });

  pagos.forEach(p => {
    const data = new Date(p.pago_em || p.atualizado_em || p.criado_em || Date.now()).toISOString().slice(0, 10);
    const dia = dias.find(d => d.chave === data);
    if (dia) dia.total += valorPagamentoNumero(p);
  });

  const max = Math.max(...dias.map(d => d.total), 1);
  grafico.innerHTML = dias.map(d => {
    const altura = Math.max(8, Math.round((d.total / max) * 100));
    return `<div class="grafico-dia"><div class="grafico-barra" style="height:${altura}%"><span>${d.total > 0 ? formatarMoedaBR(d.total) : ""}</span></div><small>${d.label}</small></div>`;
  }).join("");
}

function renderizarAdminPagamentos(pagamentos = []) {
  const container = document.getElementById("listaAdminPagamentos");
  const contador = document.getElementById("contadorPagamentosAdmin");
  if (!container) return;

  const filtrados = pagamentos.filter(p => filtroPagamentosAdminAtual === "todos" || statusPagamentoAdmin(p) === filtroPagamentosAdminAtual);
  if (contador) contador.innerText = `${filtrados.length} pagamento(s)`;

  if (!filtrados.length) {
    container.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum pagamento encontrado</h3><p>Quando profissionais gerarem Pix, eles aparecerão aqui.</p></div>`;
    return;
  }

  container.innerHTML = filtrados.map(p => {
    const status = statusPagamentoAdmin(p);
    const bruto = valorPagamentoNumero(p);
    const liquido = valorLiquidoEstimado(p);
    const taxa = Math.max(0, bruto - liquido);
    const nome = p.profissional_nome || p.profissionalNome || "Profissional";
    const whatsapp = p.profissional_whatsapp || p.profissionalWhatsapp || "";
    const plano = p.plano_nome || p.planoNome || p.plano_key || p.plano || "Plano";
    const txid = p.efi_txid || p.txid || "";
    const dataCriacao = formatarDataHoraCurta(p.criado_em || p.criadoEm);
    const dataPago = formatarDataHoraCurta(p.pago_em || p.pagoEm);
    const vencimentoPlano = formatarDataCurta(p.plano_vencimento || p.planoVencimento || "");
    const mensagemExpirado = mensagemWhatsAppPagamentoExpirado(p);
    const linkExpirado = linkWhatsappNumeroMensagem(whatsapp, mensagemExpirado);

    return `
      <article class="admin-pagamento-card status-${status}">
        <div class="pagamento-card-topo">
          <div>
            <span class="pagamento-status ${status}">${labelStatusPagamentoAdmin(status)}</span>
            <h3>${nome}</h3>
            <p>${plano}</p>
          </div>
          <strong>${formatarMoedaBR(bruto)}</strong>
        </div>
        <div class="pagamento-metricas">
          <p><span>Líquido estimado</span><strong>${formatarMoedaBR(liquido)}</strong></p>
          <p><span>Taxa estimada</span><strong>${formatarMoedaBR(taxa)}</strong></p>
          <p><span>WhatsApp</span><strong>${whatsapp || "Não informado"}</strong></p>
          <p><span>Criado</span><strong>${dataCriacao || "-"}</strong></p>
          <p><span>Pago em</span><strong>${dataPago || "-"}</strong></p>
          <p><span>Vencimento do plano</span><strong>${vencimentoPlano || "Após ativação + 35 dias"}</strong></p>
        </div>
        <small class="pagamento-txid">TXID: ${txid || "não informado"}</small>
        <div class="pagamento-acoes">
          ${whatsapp ? `<a href="${criarLinkWhatsApp(whatsapp)}" target="_blank">WhatsApp</a>` : ""}
          ${status === "expirado" && whatsapp ? `<a class="alerta" href="${linkExpirado}" target="_blank">Cobrar assinatura</a>` : ""}
          ${p.profissional_id ? `<a href="perfil.html?id=${p.profissional_id}" target="_blank">Ver perfil</a>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

async function mostrarAdminPagamentos(profissionais = []) {
  try {
    pagamentosAdminCache = await buscarAdminPagamentos();
    renderizarResumoFinanceiroAdmin(pagamentosAdminCache, profissionais);
    renderizarAdminPagamentos(pagamentosAdminCache);
  } catch (error) {
    const container = document.getElementById("listaAdminPagamentos");
    if (container) container.innerHTML = `<div class="admin-vazio"><h3>Erro nos pagamentos</h3><p>${error.message}</p></div>`;
  }
}



async function buscarAdminIndicacoes() {
  return apiFetch("/api/admin/indicacoes", {
    headers: { "x-admin-password": getAdminPassword() }
  });
}

function renderizarAdminIndicacoes(dados = {}) {
  const resumoBox = document.getElementById("adminIndicacoesResumo");
  const saquesBox = document.getElementById("listaAdminSaquesIndicacoes");
  const indicacoesBox = document.getElementById("listaAdminIndicacoes");
  const indicacoes = Array.isArray(dados.indicacoes) ? dados.indicacoes : [];
  const saques = Array.isArray(dados.saques) ? dados.saques : [];

  if (resumoBox) {
    const disponivel = indicacoes.filter(i => i.status === "disponivel").reduce((s, i) => s + Number(i.valor_comissao || 0), 0);
    const pendente = indicacoes.filter(i => ["pendente_liberacao", "aguardando_aprovacao", "pendente"].includes(i.status)).reduce((s, i) => s + Number(i.valor_comissao || 0), 0);
    const pago = indicacoes.filter(i => i.status === "pago").reduce((s, i) => s + Number(i.valor_comissao || 0), 0);
    const aguardandoSaque = saques.filter(s => s.status === "aguardando");
    resumoBox.innerHTML = `
      <article class="finance-card destaque"><span>Saques aguardando</span><strong>${aguardandoSaque.length}</strong><small>Aprovação manual</small></article>
      <article class="finance-card"><span>Saldo disponível</span><strong>${formatarMoedaBR(disponivel)}</strong><small>Comissões liberadas</small></article>
      <article class="finance-card"><span>Pendente</span><strong>${formatarMoedaBR(pendente)}</strong><small>Liberação/aprovação</small></article>
      <article class="finance-card"><span>Pago</span><strong>${formatarMoedaBR(pago)}</strong><small>Comissões quitadas</small></article>
    `;
  }

  if (saquesBox) {
    const listaSaques = saques.slice(0, 50);
    saquesBox.innerHTML = listaSaques.length ? listaSaques.map(s => {
      const whatsapp = s.profissional_whatsapp || "";
      return `
        <article class="admin-pagamento-card status-${s.status === "pago" ? "pago" : s.status === "recusado" ? "expirado" : "aguardando"}">
          <div class="pagamento-card-topo">
            <div><span class="pagamento-status ${s.status === "pago" ? "pago" : "aguardando"}">${s.status}</span><h3>${s.profissional_nome || "Profissional"}</h3><p>${s.profissional_email || "E-mail não informado"}</p></div>
            <strong>${formatarMoedaBR(s.valor)}</strong>
          </div>
          <div class="pagamento-metricas">
            <p><span>Solicitado</span><strong>${formatarDataHoraCurta(s.solicitado_em)}</strong></p>
            <p><span>WhatsApp</span><strong>${whatsapp || "-"}</strong></p>
            <p><span>Tipo chave Pix</span><strong>${s.tipo_chave_pix || "Não informado"}</strong></p>
            <p><span>Chave Pix</span><strong>${s.chave_pix || "-"}</strong></p>
            <p><span>Titular</span><strong>${s.nome_titular || "-"}</strong></p>
            <p><span>CPF/CNPJ</span><strong>${s.cpf_cnpj_titular || "-"}</strong></p>
            <p><span>Saldo disponível</span><strong>${formatarMoedaBR(s.saldo_disponivel || s.valor || 0)}</strong></p>
            <p><span>Pago em</span><strong>${formatarDataHoraCurta(s.pago_em) || "-"}</strong></p>
          </div>
          <div class="pagamento-acoes">
            ${whatsapp ? `<a href="${criarLinkWhatsApp(whatsapp)}" target="_blank">WhatsApp</a>` : ""}
            ${s.status === "aguardando" ? `<button onclick="marcarSaqueIndicacaoPago(${s.id})">Marcar pago</button><button class="alerta" onclick="recusarSaqueIndicacao(${s.id})">Recusar</button>` : ""}
          </div>
        </article>
      `;
    }).join("") : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum saque solicitado</h3><p>Quando o profissional atingir R$ 100,00, ele poderá solicitar por aqui.</p></div>`;
  }

  if (indicacoesBox) {
    indicacoesBox.innerHTML = indicacoes.length ? indicacoes.slice(0, 80).map(i => `
      <article class="admin-avaliacao-card">
        <div class="admin-avaliacao-topo">
          <div><span class="admin-status status-${statusIndicacaoClasse(i.status)}">${i.status}</span><h3>${i.indicador_nome || "Indicador"} → ${i.indicado_nome || "Indicado"}</h3><p>Plano: ${i.plano_key || "-"} · Libera em: ${formatarDataIndicacao(i.liberado_em)}</p></div>
          <strong>${formatarMoedaBR(i.valor_comissao || 0)}</strong>
        </div>
        <p>${i.motivo || ""}</p>
      </article>
    `).join("") : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhuma indicação registrada</h3><p>As indicações aparecerão após uso de link de convite.</p></div>`;
  }
}

async function mostrarAdminIndicacoes() {
  const container = document.getElementById("listaAdminSaquesIndicacoes");
  if (!container) return;
  try {
    indicacoesAdminCache = await buscarAdminIndicacoes();
    renderizarAdminIndicacoes(indicacoesAdminCache);
  } catch (error) {
    container.innerHTML = `<div class="admin-vazio"><h3>Erro nas indicações</h3><p>${error.message}</p></div>`;
  }
}

async function marcarSaqueIndicacaoPago(id) {
  const observacao = prompt("Observação do pagamento manual pela Efí (opcional):", "Pago manualmente pela Efí");
  try {
    await apiFetch(`/api/admin/indicacoes/saques/${id}/pagar`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() },
      body: JSON.stringify({ observacao })
    });
    alert("Saque marcado como pago.");
    mostrarAdminIndicacoes();
    mostrarAdminExclusoes();
  } catch (error) {
    alert(error.message);
  }
}

async function recusarSaqueIndicacao(id) {
  const observacao = prompt("Informe o motivo da recusa:", "Dados Pix incorretos ou revisão necessária");
  if (observacao === null) return;
  try {
    await apiFetch(`/api/admin/indicacoes/saques/${id}/recusar`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() },
      body: JSON.stringify({ observacao })
    });
    alert("Saque recusado e saldo devolvido.");
    mostrarAdminIndicacoes();
    mostrarAdminExclusoes();
  } catch (error) {
    alert(error.message);
  }
}

async function buscarAdminAvaliacoes(status = "pendente") {
  const senhaAdmin = getAdminPassword();
  const urlPrincipal = `/api/admin/avaliacoes?status=${encodeURIComponent(status)}&_=${Date.now()}`;

  try {
    const dados = await apiFetch(urlPrincipal, {
      headers: { "x-admin-password": senhaAdmin }
    });

    if (Array.isArray(dados)) return dados;
    return [];
  } catch (erroPrincipal) {
    // Compatibilidade com deploys intermediários/rotas antigas.
    if (status === "pendente") {
      try {
        const dadosFallback = await apiFetch(`/api/admin/avaliacoes/pendentes?_=${Date.now()}`, {
          headers: { "x-admin-password": senhaAdmin }
        });
        return Array.isArray(dadosFallback) ? dadosFallback : [];
      } catch (_) {
        throw erroPrincipal;
      }
    }

    throw erroPrincipal;
  }
}

async function mostrarAdminAvaliacoes() {
  const container = document.getElementById("listaAdminAvaliacoes");
  const contador = document.getElementById("contadorAvaliacoesPendentes");
  if (!container) return;

  try {
    const avaliacoes = await buscarAdminAvaliacoes("pendente");
    const validas = (avaliacoes || [])
      .filter(item => item && item.id)
      .filter(item => String(item.status || "pendente").trim().toLowerCase() === "pendente");

    if (contador) contador.innerText = `${validas.length} pendente(s)`;

    if (!validas || validas.length === 0) {
      container.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Nenhuma avaliação pendente</h3><p>Quando clientes enviarem avaliações, elas aparecerão aqui para aprovação.</p></div>`;
      return;
    }

    container.innerHTML = validas.map(item => {
      const idSeguro = String(item.id).replace(/"/g, "&quot;");

      return `
        <article class="admin-avaliacao-card" data-avaliacao-id="${idSeguro}">
          <div class="admin-avaliacao-topo">
            <div>
              <span>${item.profissionalNome || "Profissional"}</span>
              <h3>${item.nomeCliente || "Cliente"}</h3>
            </div>
            <strong>${estrelasHTML(item.nota)}</strong>
          </div>

          <p>${item.comentario || "Sem comentário."}</p>

          <small>
            ${item.profissionalProfissao || ""}
            ${item.profissionalCidade ? "• " + item.profissionalCidade : ""}
            ${item.criadoEm ? "• " + formatarDataCurta(item.criadoEm) : ""}
          </small>

          <div class="admin-avaliacao-acoes">
            <button class="aprovar" type="button" data-acao-avaliacao="aprovar" data-id="${idSeguro}">Aprovar</button>
            <button type="button" data-acao-avaliacao="recusar" data-id="${idSeguro}">Recusar</button>
            <button class="remover" type="button" data-acao-avaliacao="excluir" data-id="${idSeguro}">Excluir</button>
          </div>
        </article>
      `;
    }).join("");

    container.querySelectorAll("[data-acao-avaliacao]").forEach(botao => {
      botao.addEventListener("click", async () => {
        const id = botao.getAttribute("data-id");
        const acao = botao.getAttribute("data-acao-avaliacao");

        if (acao === "aprovar") return aprovarAvaliacao(id);
        if (acao === "recusar") return recusarAvaliacao(id);
        if (acao === "excluir") return excluirAvaliacao(id);
      });
    });
  } catch (error) {
    container.innerHTML = `<div class="admin-vazio"><h3>Erro nas avaliações</h3><p>${error.message}</p></div>`;
  }
}

function normalizarIdAvaliacao(id) {
  const idLimpo = String(id || "").trim();

  if (!idLimpo || idLimpo === "undefined" || idLimpo === "null") {
    alert("ID da avaliação inválido. Atualize o painel e tente novamente.");
    return "";
  }

  return idLimpo;
}

async function aprovarAvaliacao(id) {
  const idLimpo = normalizarIdAvaliacao(id);
  if (!idLimpo) return;

  try {
    await apiFetch(`/api/admin/avaliacoes/${encodeURIComponent(idLimpo)}/aprovar`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() }
    });

    alert("Avaliação aprovada.");
    await mostrarAdminAvaliacoes();
    await mostrarAdmin();
  } catch (error) {
    alert(error.message);
    mostrarAdminAvaliacoes();
  }
}

async function recusarAvaliacao(id) {
  const idLimpo = normalizarIdAvaliacao(id);
  if (!idLimpo) return;

  try {
    await apiFetch(`/api/admin/avaliacoes/${encodeURIComponent(idLimpo)}/recusar`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() }
    });

    alert("Avaliação recusada.");
    await mostrarAdminAvaliacoes();
  } catch (error) {
    alert(error.message);
    mostrarAdminAvaliacoes();
  }
}

async function excluirAvaliacao(id) {
  const idLimpo = normalizarIdAvaliacao(id);
  if (!idLimpo) return;
  if (!confirm("Excluir esta avaliação?")) return;

  try {
    await apiFetch(`/api/admin/avaliacoes/${encodeURIComponent(idLimpo)}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPassword() }
    });

    alert("Avaliação excluída.");
    await mostrarAdminAvaliacoes();
    await mostrarAdmin();
  } catch (error) {
    alert(error.message);
    mostrarAdminAvaliacoes();
  }
}

async function mostrarAdmin() {
  const container = document.getElementById("listaAdmin");
  const stats = document.getElementById("adminStats");
  const buscaInput = document.getElementById("adminBusca");
  if (!container) return;

  try {
    mostrarLoading("Carregando painel...");
    const salvos = await buscarAdminProfissionais();
    mostrarAdminAvaliacoes();
    mostrarAdminPagamentos(salvos);
    mostrarAdminIndicacoes();
    mostrarAdminExclusoes();

    const pendentes = salvos.filter(p => p.status === "pendente").length;
    const aprovados = salvos.filter(p => p.status === "aprovado").length;
    const cidadesUnicas = new Set(salvos.map(p => normalizarTextoNorteServic(p.cidade)).filter(Boolean)).size;

    if (stats) {
      stats.innerHTML = `
        <div class="admin-stat-card"><strong>${salvos.length}</strong><span>Cadastros recebidos</span></div>
        <div class="admin-stat-card"><strong>${pendentes}</strong><span>Aguardando aprovação</span></div>
        <div class="admin-stat-card"><strong>${aprovados}</strong><span>Perfis aprovados</span></div>
        <div class="admin-stat-card"><strong>${cidadesUnicas}</strong><span>Cidades cadastradas</span></div>
      `;
    }

    const termoBusca = buscaInput ? normalizarTextoNorteServic(buscaInput.value) : "";
    const listaFiltrada = salvos.filter(p => {
      const cidades = Array.isArray(p.cidadesAtendidas) ? p.cidadesAtendidas.join(" ") : "";
      const texto = normalizarTextoNorteServic(`${p.nome || ""} ${p.tipoProfissional || ""} ${p.categoria || ""} ${p.profissao || ""} ${p.cidade || ""} ${p.bairro || ""} ${cidades} ${p.formaAtendimento || ""} ${p.whatsapp || ""} ${p.instagram || ""} ${p.servicos || ""} ${p.status || ""}`);
      const passaBusca = termoBusca === "" || texto.includes(termoBusca);
      const passaStatus = filtroAdminAtual === "todos" || p.status === filtroAdminAtual;
      return passaBusca && passaStatus;
    });

    container.innerHTML = "";

    if (listaFiltrada.length === 0) {
      container.innerHTML = `<div class="admin-vazio"><h3>Nenhum resultado encontrado</h3><p>Tente ajustar a busca ou alterar o filtro.</p></div>`;
      return;
    }

    container.innerHTML = listaFiltrada.map((p, index) => {
      const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : "?";
      const fotoCard = p.fotoPerfil ? `<img src="${p.fotoPerfil}" alt="Foto de ${p.nome}">` : `<span>${inicial}</span>`;
      const quantidadeFotos = Array.isArray(p.fotosTrabalhos) ? p.fotosTrabalhos.length : 0;
      const statusClasse = p.status === "aprovado" ? "status-aprovado" : "status-pendente";
      const statusTexto = p.status === "aprovado" ? "Aprovado" : "Pendente";
      const linkWhatsApp = criarLinkWhatsApp(p.whatsapp);
      const cidadesTexto = formatarCidadesAtendidas(p);

      return `
        <div class="admin-prof-card" style="animation-delay: ${index * 0.04}s">
          <div class="admin-prof-foto">${fotoCard}</div>
          <div class="admin-prof-info">
            <span class="admin-status ${statusClasse}">${statusTexto}</span>
            <h3 class="nome-profissional-linha admin-nome"><span>${p.nome}</span>${seloVerificadoPlanoHTML(p, "admin")}</h3>
            <p class="profissao">${p.profissao}</p>
            <p><strong>Tipo:</strong> ${p.tipoProfissional || "Não informado"}</p>
            <p><strong>Categoria:</strong> ${p.categoria || "Não informada"}</p>
            <p><strong>Cidade principal:</strong> ${p.cidade} - ${p.bairro}</p>
            <p><strong>Atende:</strong> ${cidadesTexto}</p>
            <p><strong>Forma de atendimento:</strong> ${p.formaAtendimento || "Não informada"}</p>
            <p><strong>WhatsApp:</strong> ${p.whatsapp}</p>
            <p><strong>Instagram:</strong> ${p.instagram || "Não informado"}</p>
            <p><strong>Serviços:</strong> ${p.servicos}</p>
            <p><strong>Descrição:</strong> ${p.descricao}</p>
            <p><strong>Plano:</strong> ${p.planoAtual || "Gratuito"}</p>
            <div class="admin-tags">
              <span>${quantidadeFotos} foto(s)</span>
              <span>${p.verificado ? "Verificado" : "Não verificado"}</span>
              <span>${p.status === "aprovado" ? "Publicado" : "Em análise"}</span>
            </div>
          </div>
          <div class="admin-acoes">
            <button class="aprovar" onclick="aprovarProfissional(${p.id})">Aprovar</button>
            <a class="ver-whatsapp" href="${linkWhatsApp}" target="_blank">WhatsApp</a>
            <button onclick="atualizarPlanoAdmin(${p.id})">Plano</button>
            <button class="senha" onclick="redefinirSenhaAdmin(${p.id})">Senha</button>
            <button class="remover" onclick="removerProfissional(${p.id})">Remover</button>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    container.innerHTML = `<div class="admin-vazio"><h3>Erro no painel</h3><p>${error.message}</p></div>`;
  } finally {
    esconderLoading();
  }
}

async function aprovarProfissional(id) {
  try {
    await apiFetch(`/api/admin/profissionais/${id}/aprovar`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() }
    });
    alert("Profissional aprovado com sucesso!");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

async function removerProfissional(id) {
  if (!confirm("Tem certeza que deseja remover este cadastro?")) return;

  try {
    await apiFetch(`/api/admin/profissionais/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPassword() }
    });
    alert("Cadastro removido.");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}


async function redefinirSenhaAdmin(id) {
  const sugestao = `NS${Math.floor(100000 + Math.random() * 900000)}`;
  const novaSenha = prompt(
    "Digite a nova senha temporária para este profissional.\n\nDica: envie essa senha pelo WhatsApp e oriente o profissional a trocar depois no painel.",
    sugestao
  );

  if (!novaSenha) return;

  if (String(novaSenha).trim().length < 6) {
    alert("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  try {
    const resposta = await apiFetch(`/api/admin/profissionais/${id}/senha`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() },
      body: JSON.stringify({ senha: String(novaSenha).trim() })
    });

    const nome = resposta?.profissional?.nome || "profissional";
    const mensagem = `Senha redefinida com sucesso para ${nome}.\n\nSenha temporária: ${String(novaSenha).trim()}\n\nEnvie essa senha ao profissional e peça para ele alterar depois na Área Profissional.`;

    try {
      await navigator.clipboard.writeText(`Olá! Sua senha temporária da Norte Servic é: ${String(novaSenha).trim()}\n\nEntre na Área Profissional e altere sua senha depois.`);
      alert(`${mensagem}\n\nMensagem copiada para você colar no WhatsApp.`);
    } catch (_) {
      alert(mensagem);
    }
  } catch (error) {
    alert(error.message);
  }
}

async function atualizarPlanoAdmin(id) {
  const planoAtual = prompt("Digite o plano: Gratuito, Destaque, Profissional ou Premium", "Destaque");
  if (!planoAtual) return;

  const planoStatus = prompt("Status do plano:", "ativo") || "ativo";
  const planoVencimento = prompt("Vencimento do plano (opcional, formato 2026-07-04):", "") || null;

  try {
    await apiFetch(`/api/admin/profissionais/${id}/plano`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() },
      body: JSON.stringify({ planoAtual, planoStatus, planoVencimento })
    });
    alert("Plano atualizado.");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

/* ================================================= */
/* EXPERIÊNCIA / TOPO / POPUP */
/* ================================================= */

function ativarTransicoesDeClique() {
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const ehWhatsapp = href.includes("wa.me");

    if (ehWhatsapp) {
      mostrarLoading("Abrindo WhatsApp...");
      setTimeout(esconderLoading, 900);
    }
  });
}

function ativarTopoMenorAoRolar() {
  const topo = document.querySelector(".novo-topo");
  if (!topo) return;

  // No celular o cabeçalho não diminui ao rolar. Isso evita flicker/piscadas
  // em navegadores móveis e deixa a navegação mais estável.
  if (window.matchMedia("(max-width: 820px)").matches) {
    topo.classList.remove("topo-menor");
    return;
  }

  let ticking = false;

  window.addEventListener("scroll", function() {
    if (ticking) return;

    window.requestAnimationFrame(function() {
      if (window.scrollY > 40) topo.classList.add("topo-menor");
      else topo.classList.remove("topo-menor");
      ticking = false;
    });

    ticking = true;
  }, { passive: true });
}

function mostrarPopCadastro() {
  const pop = document.getElementById("popCadastroFlutuante");
  const titulo = document.getElementById("popCadastroTitulo");
  const mensagem = document.getElementById("popCadastroMensagem");
  if (!pop) return;

  const avisos = [
    { titulo: "Novos profissionais chegando", mensagem: "Profissionais da região estão criando seus perfis na Norte Servic." },
    { titulo: "Movimento na plataforma", mensagem: "Pessoas estão buscando profissionais da região neste momento." },
    { titulo: "Cadastros em andamento", mensagem: "Novos prestadores estão preparando seus perfis na plataforma." },
    { titulo: "Oportunidade para profissionais", mensagem: "Seu serviço também pode aparecer para clientes da região." }
  ];

  const escolhido = avisos[Math.floor(Math.random() * avisos.length)];
  if (titulo) titulo.innerText = escolhido.titulo;
  if (mensagem) mensagem.innerText = escolhido.mensagem;

  setTimeout(() => {
    pop.classList.add("ativo");
    setTimeout(fecharPopCadastro, 10000);
  }, 5000);
}

function fecharPopCadastro() {
  const pop = document.getElementById("popCadastroFlutuante");
  if (!pop) return;

  pop.classList.add("saindo");
  setTimeout(() => {
    pop.classList.remove("ativo");
    pop.classList.remove("saindo");
  }, 300);
}


function adicionarAdminNoRodape() {
  const rodapes = document.querySelectorAll("footer");
  if (!rodapes.length) return;

  rodapes.forEach((rodape) => {
    if (rodape.querySelector(".rodape-admin-link")) return;

    const link = document.createElement("a");
    link.href = "admin.html";
    link.className = "rodape-admin-link";
    link.setAttribute("aria-label", "Acessar área administrativa");
    link.textContent = "Área administrativa";
    rodape.appendChild(link);
  });
}

function solicitarPlanoProfissional(plano, valor) {
  const mensagem = encodeURIComponent(
    `Olá! Quero contratar o plano ${plano} da Norte Servic.\n\nValor: R$ ${valor}\nNome:\nProfissão:\nCidade:\nWhatsApp do cadastro:`
  );

  window.open(`https://wa.me/5563992229673?text=${mensagem}`, "_blank");
}


function iniciarRecuperacaoSenha() {
  const form = document.getElementById("formRecuperarSenha");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemRecuperarSenha");
    const botao = form.querySelector("button[type='submit']");
    const textoOriginal = botao ? botao.innerText : "";

    const whatsapp = limparNumero(document.getElementById("recuperarWhatsapp")?.value || "");
    const nome = (document.getElementById("recuperarNome")?.value || "").trim();
    const cidade = (document.getElementById("recuperarCidade")?.value || "").trim();

    if (!whatsapp || whatsapp.length < 10) {
      if (mensagem) mensagem.innerText = "Informe o WhatsApp cadastrado com DDD.";
      return;
    }

    if (!nome || !cidade) {
      if (mensagem) mensagem.innerText = "Preencha nome profissional e cidade para continuar.";
      return;
    }

    const texto = encodeURIComponent(
      `Olá! Preciso recuperar minha senha da Norte Servic.

` +
      `WhatsApp cadastrado: ${whatsapp}
` +
      `Nome profissional: ${nome}
` +
      `Cidade: ${cidade}

` +
      `Confirmo que sou o responsável por este cadastro e preciso de ajuda para redefinir minha senha.`
    );

    if (botao) {
      botao.innerText = "Abrindo WhatsApp...";
      botao.disabled = true;
    }

    if (mensagem) {
      mensagem.innerText = "Solicitação preparada. O WhatsApp será aberto para confirmar seus dados.";
    }

    mostrarLoading("Abrindo WhatsApp...");

    setTimeout(() => {
      window.open(`https://wa.me/5563992229673?text=${texto}`, "_blank");
      esconderLoading();
      if (botao) {
        botao.innerText = textoOriginal;
        botao.disabled = false;
      }
    }, 450);
  });
}


let pagamentoEfiAtual = null;
let pagamentoEfiTimer = null;

function planoEfiNome(plano) {
  const nomes = {
    essencial: 'Essencial Destaque',
    profissional: 'Profissional Plus',
    top: 'Top Norte'
  };
  return nomes[plano] || 'Plano Norte Servic';
}

async function contratarPlanoEfi(plano) {
  const token = getTokenProfissional();
  if (!token) {
    localStorage.setItem("norteServicPlanoPendente", plano);
    alert('Para contratar um plano, entre primeiro na Área Profissional. Depois você volta automaticamente para os planos.');
    window.location.href = 'login.html?voltar=planos';
    return;
  }

  try {
    mostrarLoading('Gerando Pix...');
    const resposta = await apiFetch('/api/pagamentos/efi/criar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plano })
    });

    abrirModalPagamentoEfi(resposta.pagamento, plano);
  } catch (error) {
    console.error("Erro ao gerar Pix Efí", error);
    alert(error.message || 'Erro ao gerar Pix. Confira as variáveis da Efí no Railway.');
  } finally {
    esconderLoading();
  }
}


function prepararPaginaPlanosEfi() {
  if (!document.body.classList.contains("pagina-planos") && !document.querySelector(".premium-planos")) return;

  const token = getTokenProfissional();
  const hero = document.querySelector(".planos-hero-premium");
  if (!hero || document.querySelector(".planos-login-aviso")) return;

  const aviso = document.createElement("div");
  aviso.className = token ? "planos-login-aviso conectado" : "planos-login-aviso";
  aviso.innerHTML = token
    ? `<strong>✓ Profissional conectado.</strong><span>O plano será vinculado ao seu perfil.</span>`
    : `<strong>Entre na Área Profissional para contratar.</strong><span>Assim o pagamento fica vinculado ao perfil correto.</span><a href="login.html?voltar=planos">Entrar agora</a>`;
  hero.appendChild(aviso);
}

function abrirModalPagamentoEfi(pagamento, plano) {
  pagamentoEfiAtual = pagamento;
  const modal = document.getElementById('efiPagamentoModal');
  const titulo = document.getElementById('efiPagamentoTitulo');
  const descricao = document.getElementById('efiPagamentoDescricao');
  const qrBox = document.getElementById('efiQrCodeBox');
  const copia = document.getElementById('efiPixCopiaCola');
  const status = document.getElementById('efiPagamentoStatus');

  if (!modal || !pagamento) return;

  if (titulo) titulo.innerText = planoEfiNome(plano || pagamento.plano_key);
  if (descricao) descricao.innerText = `Valor: R$ ${Number(pagamento.valor || 0).toFixed(2).replace('.', ',')}. Pague com Pix para ativar seu plano.`;
  if (copia) copia.value = pagamento.pix_copia_cola || '';
  if (status) status.innerText = 'Aguardando pagamento...';

  if (qrBox) {
    qrBox.innerHTML = pagamento.qr_code_imagem
      ? `<img src="${pagamento.qr_code_imagem}" alt="QR Code Pix">`
      : `<div class="efi-sem-qrcode">QR Code indisponível. Use o Pix copia e cola.</div>`;
  }

  modal.classList.remove('escondido');
  modal.setAttribute('aria-hidden', 'false');

  clearInterval(pagamentoEfiTimer);
  pagamentoEfiTimer = setInterval(consultarStatusPagamentoEfi, 7000);
}

function fecharModalPagamentoEfi() {
  const modal = document.getElementById('efiPagamentoModal');
  if (modal) {
    modal.classList.add('escondido');
    modal.setAttribute('aria-hidden', 'true');
  }
  clearInterval(pagamentoEfiTimer);
}

async function copiarPixEfi() {
  const campo = document.getElementById('efiPixCopiaCola');
  if (!campo || !campo.value) return;
  await navigator.clipboard.writeText(campo.value);
  const status = document.getElementById('efiPagamentoStatus');
  if (status) status.innerText = 'Código Pix copiado.';
}

async function consultarStatusPagamentoEfi() {
  if (!pagamentoEfiAtual?.id) return;
  const token = getTokenProfissional();
  if (!token) {
    alert("Entre novamente na Área Profissional para confirmar o pagamento.");
    window.location.href = "login.html?voltar=planos";
    return;
  }

  const statusEl = document.getElementById('efiPagamentoStatus');
  const botaoJaPaguei = document.querySelector('.efi-modal-acoes .secundario');

  try {
    if (botaoJaPaguei) {
      botaoJaPaguei.disabled = true;
      botaoJaPaguei.dataset.textoOriginal = botaoJaPaguei.dataset.textoOriginal || botaoJaPaguei.innerText;
      botaoJaPaguei.innerText = "Verificando...";
    }

    if (statusEl) statusEl.innerText = 'Verificando pagamento...';

    const resposta = await apiFetch(`/api/pagamentos/${pagamentoEfiAtual.id}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    pagamentoEfiAtual = resposta.pagamento || pagamentoEfiAtual;

    if (pagamentoEfiAtual.status === 'pago') {
      clearInterval(pagamentoEfiTimer);
      if (statusEl) statusEl.innerText = 'Pagamento confirmado! Seu plano foi ativado.';
      setTimeout(() => { window.location.href = 'painel-profissional.html?v=pagamento-confirmado'; }, 1600);
      return;
    }

    if (statusEl) {
      statusEl.innerText = pagamentoEfiAtual.mensagem_status || 'Pagamento não identificado pela Norte Servic. Tente novamente em alguns instantes.';
    }
  } catch (error) {
    if (statusEl) statusEl.innerText = error.message || 'Erro ao consultar pagamento.';
  } finally {
    if (botaoJaPaguei && pagamentoEfiAtual?.status !== 'pago') {
      botaoJaPaguei.disabled = false;
      botaoJaPaguei.innerText = botaoJaPaguei.dataset.textoOriginal || "Já paguei";
    }
  }
}


/* ================================================= */
/* PERFIL LOGADO NO CABEÇALHO */
/* ================================================= */

function obterIniciaisProfissional(nome = "") {
  const partes = String(nome || "NS").trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] || "N";
  const segunda = partes.length > 1 ? partes[partes.length - 1][0] : "S";
  return `${primeira}${segunda}`.toUpperCase();
}

async function inserirPerfilLogadoCabecalho() {
  const header = document.querySelector(".ns-header");
  const nav = document.querySelector(".ns-nav");
  if (!header || document.querySelector(".ns-header-profile")) return;

  const token = getTokenProfissional();
  if (!token) return;

  try {
    const profissional = await apiFetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profissional || !profissional.id) return;

    const perfil = document.createElement("a");
    perfil.className = "ns-header-profile";
    perfil.href = "painel-profissional.html";
    perfil.title = `Perfil logado: ${profissional.nome || "Profissional"}`;

    const foto = profissional.fotoPerfil || profissional.foto_perfil || "";
    const iniciais = obterIniciaisProfissional(profissional.nome);

    perfil.innerHTML = foto
      ? `<img src="${foto}" alt="${profissional.nome || "Profissional"}"><span>${profissional.nome || "Perfil"}</span>`
      : `<strong>${iniciais}</strong><span>${profissional.nome || "Perfil"}</span>`;

    if (nav) {
      nav.insertAdjacentElement("afterend", perfil);
    } else {
      header.appendChild(perfil);
    }
  } catch (error) {
    // Token antigo ou sessão expirada: não bloqueia a navegação.
    console.warn("Não foi possível carregar perfil logado no cabeçalho.", error.message);
  }
}




/* ================================================= */
/* ANIMAÇÕES SUAVES DE ROLAGEM - JS PURO */
/* ================================================= */
function iniciarAnimacoesSuavesNorteServic() {
  const seletores = [
    '.hero h1',
    '.hero p',
    '.busca-box',
    '.categorias',
    '.destaques-section .badge-destaque-home',
    '.destaques-section h2',
    '.texto-destaque-home',
    '#listaProfissionais .card',
    '.home-banner-card',
    '.por-que-card',
    '.passos > div',
    '.home-planos',
    '.plano-card',
    '.plano-card-premium',
    '.planos-info',
    '.planos-comparativo-premium',
    '.planos-final-premium',
    '.perfil-lateral',
    '.perfil-hero-texto',
    '.perfil-section-clean',
    '.avaliacao-card-publica',
    '.form-avaliacao-card',
    '.painel-profissional-header',
    '.painel-card-principal-premium',
    '.painel-extra-card',
    '.admin-stat-card',
    '.admin-prof-card',
    '.admin-avaliacao-card',
    '.admin-financeiro-dashboard',
    '.finance-card',
    '.admin-grafico-box',
    '.admin-pagamento-card',
    '.cadastro-beneficios',
    '.cadastro-form-card',
    '.grupo-form-premium'
  ];

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzirMovimento) return;

  const observados = new WeakSet();

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('ns-reveal-visivel');
        observer.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  function prepararAnimacoes(raiz = document) {
    seletores.forEach((seletor) => {
      raiz.querySelectorAll(seletor).forEach((el, index) => {
        if (observados.has(el) || el.classList.contains('ns-sem-animacao')) return;

        observados.add(el);
        el.classList.add('ns-reveal');

        const atraso = Math.min((index % 8) * 45, 260);
        el.style.setProperty('--ns-delay', `${atraso}ms`);

        observer.observe(el);
      });
    });
  }

  prepararAnimacoes(document);

  const mutationObserver = new MutationObserver((mutacoes) => {
    mutacoes.forEach((mutacao) => {
      mutacao.addedNodes.forEach((node) => {
        if (node.nodeType === 1) prepararAnimacoes(node);
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}



/* ================================================= */
/* DOCUMENTOS LEGAIS, LGPD E PRIVACIDADE */
/* ================================================= */

function iniciarDocumentosLegais() {
  const botoes = document.querySelectorAll("[data-legal-tab]");
  if (!botoes.length) return;

  function ativar(tab) {
    botoes.forEach(btn => btn.classList.toggle("ativo", btn.dataset.legalTab === tab));
    document.querySelectorAll(".legal-panel").forEach(panel => {
      panel.classList.toggle("ativo", panel.id === `legal-${tab}`);
    });
    if (history.replaceState) history.replaceState(null, "", `#${tab}`);
  }

  botoes.forEach(btn => btn.addEventListener("click", () => ativar(btn.dataset.legalTab)));
  const hash = String(location.hash || "").replace("#", "");
  if (hash && document.getElementById(`legal-${hash}`)) ativar(hash);
}

async function baixarMeusDados() {
  try {
    const dados = await apiFetch("/api/me/dados", { headers: headersAuth() });
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-norte-servic.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message);
  }
}

async function solicitarExclusaoConta() {
  const motivo = prompt("Informe o motivo da solicitação de exclusão da conta:");
  if (motivo === null) return;
  if (!confirm("Enviar solicitação de exclusão para análise do administrador?")) return;

  try {
    await apiFetch("/api/me/solicitar-exclusao", {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({ motivo })
    });
    alert("Solicitação enviada. O administrador analisará seu pedido.");
  } catch (error) {
    alert(error.message);
  }
}

async function buscarAdminExclusoes() {
  return apiFetch("/api/admin/lgpd/exclusoes", { headers: headersAdmin() });
}

function renderizarAdminExclusoes(lista = []) {
  const box = document.getElementById("listaAdminExclusoes");
  if (!box) return;
  box.innerHTML = lista.length ? lista.map(item => `
    <article class="admin-pagamento-card admin-lgpd-card">
      <div>
        <span class="admin-status status-${statusIndicacaoClasse(item.status)}">${item.status}</span>
        <h3>${item.profissional_nome || "Profissional"}</h3>
        <p>WhatsApp: ${item.profissional_whatsapp || "-"} · E-mail: ${item.profissional_email || "-"}</p>
        <p>Motivo: ${item.motivo || "Não informado"}</p>
        <p>Solicitado em: ${formatarDataIndicacao(item.criado_em)}</p>
      </div>
      <div class="admin-card-actions">
        ${item.status === "aguardando" ? `<button onclick="aprovarExclusaoConta(${item.id})">Aprovar/anonimizar</button><button class="alerta" onclick="recusarExclusaoConta(${item.id})">Recusar</button>` : `<small>${item.observacao_admin || "Finalizado"}</small>`}
      </div>
    </article>
  `).join("") : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhuma solicitação de exclusão</h3><p>Pedidos LGPD aparecerão aqui.</p></div>`;
}

async function mostrarAdminExclusoes() {
  const box = document.getElementById("listaAdminExclusoes");
  if (!box) return;
  box.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Carregando solicitações...</h3></div>`;
  try {
    const dados = await buscarAdminExclusoes();
    renderizarAdminExclusoes(dados.solicitacoes || []);
  } catch (error) {
    box.innerHTML = `<div class="admin-vazio"><h3>Erro ao carregar solicitações</h3><p>${error.message}</p></div>`;
  }
}

async function aprovarExclusaoConta(id) {
  const observacao = prompt("Observação do admin:") || "Conta anonimizada conforme solicitação LGPD.";
  if (!confirm("Aprovar a solicitação e anonimizar o cadastro?")) return;
  try {
    await apiFetch(`/api/admin/lgpd/exclusoes/${id}/aprovar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    mostrarAdminExclusoes();
  } catch (error) { alert(error.message); }
}

async function recusarExclusaoConta(id) {
  const observacao = prompt("Motivo da recusa:") || "Solicitação recusada pelo administrador.";
  try {
    await apiFetch(`/api/admin/lgpd/exclusoes/${id}/recusar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    mostrarAdminExclusoes();
  } catch (error) { alert(error.message); }
}

/* ================================================= */
/* INICIALIZAÇÃO */
/* ================================================= */

document.addEventListener("DOMContentLoaded", function() {
  iniciarCarregamentoNorteServic();
  iniciarAnimacoesSuavesNorteServic();
  inserirPerfilLogadoCabecalho();
  ativarTransicoesDeClique();
  ativarBuscaComEnter();
  iniciarBuscaInteligente();
  preencherCategoriasCadastro();
  ativarProfissaoServicos();
  iniciarCidadeInteligente();
  mostrarAvisoIndicacaoCadastro();
  iniciarCadastroBackend();
  iniciarLoginProfissional();
  iniciarRecuperacaoSenha();
  ativarEnterNoAdmin();
  ativarTopoMenorAoRolar();
  mostrarProfissionais();
  carregarPerfilProfissional();
  carregarPainelProfissional();
  iniciarEditarPerfil();
  alternarCidadesAtendidas();
  adicionarAdminNoRodape();
  iniciarDocumentosLegais();
  iniciarCarrosselBannersMobile();
  iniciarAutoScrollFaixasHome();
  prepararPaginaPlanosEfi();

  const adminBusca = document.getElementById("adminBusca");
  if (adminBusca) adminBusca.addEventListener("input", mostrarAdmin);
});

window.addEventListener("load", mostrarPopCadastro);
