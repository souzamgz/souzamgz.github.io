# souzamgz.github.io

Site pessoal e portfólio de **Miguel Souza**, publicado no GitHub Pages em <https://souzamgz.github.io>.

## Recursos

- Estética de galáxia com campo de estrelas em Canvas, nebulosas animadas e meteoros.
- Tema escuro e claro, com preferência salva no navegador e respeito ao tema do sistema.
- Conteúdo em português e inglês, com troca instantânea e preferência persistida.
- Seção de projetos alimentada pela API pública do GitHub, sempre atualizada.
- Layout responsivo, navegação mobile, animações de entrada e efeitos de inclinação.
- Acessibilidade: navegação por teclado, skip link, foco visível, rótulos ARIA e suporte a `prefers-reduced-motion`.
- Sem framework e sem etapa de build: HTML, CSS e JavaScript puros.

## Estrutura

```text
.
├── index.html
├── .nojekyll
├── assets/
│   ├── css/style.css
│   ├── img/
│   │   ├── avatar.jpg
│   │   └── favicon.svg
│   └── js/
│       ├── i18n.js
│       └── main.js
└── README.md
```

## Rodar localmente

```bash
python3 -m http.server 8080
```

Acesse <http://localhost:8080>.

## Personalização

- Textos em português e inglês: `assets/js/i18n.js`.
- Descrições dos repositórios exibidos: mapa `projectDescriptions` em `assets/js/i18n.js`.
- Foto de perfil: `assets/img/avatar.jpg`.
- Cores, tipografia e animações: `assets/css/style.css`.
- Estrutura das seções: `index.html`.

Os projetos são carregados de `https://api.github.com/users/souzamgz/repos`. Se a API falhar ou atingir o limite de requisições, o site usa uma lista de fallback definida em `assets/js/main.js`.

## Publicação

O GitHub Pages serve este repositório diretamente a partir da branch `main`. O arquivo `.nojekyll` desativa o processamento do Jekyll, permitindo publicar os arquivos estáticos como estão.
