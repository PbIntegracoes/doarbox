# DoarBox

Caixa de doação embutível da [PB Integrações](https://pbintegracoes.com). O visitante escolhe o valor; o pagamento acontece numa página segura (Pix, cartão ou boleto).

## Instalação

1. Em [pbintegracoes.com/doarbox](https://pbintegracoes.com/doarbox), informe sua chave de acesso e copie o código.
2. Cole no HTML do seu site:

```html
<doar-box box="dbx_xxxxxxxx" title="Contribua com nosso projeto"></doar-box>
<script src="https://cdn.jsdelivr.net/gh/pbintegracoes/doarbox@5/dist/doarbox.js"></script>
```

## Atributos

| Atributo | Descrição |
|----------|-----------|
| `box` | Id da sua caixa (`dbx_…`). Obrigatório. |
| `title` | Frase abaixo do logo. |
| `logo` | URL https do seu logo (png/jpg/webp). Vazio = logo DoarBox. |
| `amounts` | Valores em reais, separados por vírgula. Padrão: `10,50,100`. |

## Frequência

- **Única** — Pix, cartão ou boleto.
- **Mensal** — cartão; o doador cancela pelo link da página de sucesso.

## Desenvolvimento

Arquivo único em `dist/doarbox.js` (custom element + Shadow DOM). Sem build step.

```bash
npx --yes serve .
```
