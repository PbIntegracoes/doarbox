# DoarBox 5

Caixa de doação embutível (partner-agnostic). O site do lojista só escolhe valor e frequência; o pagamento acontece no [checkout hospedado](https://checkout.pbintegracoes.com) da PB Integrações.

## Instalação

1. Em [pbintegracoes.com/doarbox](https://pbintegracoes.com/doarbox), informe sua Connect Key (`CONVD…`) e copie o snippet.
2. Cole no HTML do seu site:

```html
<doar-box box="dbx_xxxxxxxx" title="Contribua com nosso projeto"></doar-box>
<script src="https://pbintegracoes.com/doarbox/v5/doarbox.js"></script>
```

(Alternativa CDN: `https://cdn.jsdelivr.net/gh/r-martins/pb-doarbox@5/dist/doarbox.js` após o tag `5` no GitHub.)

## Atributos

| Atributo | Descrição |
|----------|-----------|
| `box` | Id público da caixa (`dbx_…`). Obrigatório. |
| `title` | Título abaixo do logo. |
| `logo` | URL https do logo (png/jpg/webp). Vazio = logo DoarBox. |
| `amounts` | Valores em reais, separados por vírgula. Padrão: `10,50,100`. |
| `api` | Base da API (opcional; padrão produção). |

## Frequência

- **Única** — Pix, cartão ou boleto no checkout hospedado.
- **Mensal** — só cartão; o doador cancela pelo link da página de sucesso / e-mail (`/s/{sub_…}/cancel`).

## Desenvolvimento

Arquivo único em `dist/doarbox.js` (custom element + Shadow DOM). Sem build step.

```bash
# servir localmente
npx --yes serve .
```
