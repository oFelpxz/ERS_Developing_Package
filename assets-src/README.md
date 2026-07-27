# assets-src — fontes originais (não servidas)

Fica fora de `public/`, então **não vai para o build**. Guarda os arquivos de origem
usados para gerar os assets tratados que o site consome.

## `clients/` → `public/clients/mono/`

Logos originais coloridos. As versões monocromáticas claras foram geradas assim:

```
grayscale → negate (inverte luminância, preserva alpha) → linear(gain) para média ≈ 208
```

**Por que inverter luminância em vez de aplicar filtro CSS.** Um
`brightness(0) invert(1)` achata a marca na silhueta: o círculo da Volkswagen
vira um disco branco sólido e perde o monograma. Inverter a luminância mantém o
negativo interno — as letras VW continuam legíveis dentro do círculo.

**Exceção — Serangeli.** A arte original já é branca (100% dos pixels opacos são
claros, saturação 0.00). Inverter deixaria a marca preta e invisível no fundo
escuro, então ela é copiada sem tratamento e só recebe a normalização de peso.

A normalização final iguala a média óptica de todas as marcas em ~208 para que
nenhuma grite nem suma. A Volkswagen fecha em 169 porque contém letras pretas
que o ganho linear preserva — isso é correto, mantém o contraste interno.

## `certifications/` → `public/certifications/sap-badge.jpg`

O arquivo original tinha 672×352 com **327px de margem branca morta** (~49% da
largura). O badge servido é o recorte real do cartão: 345×339. A arte em si não
foi alterada — é uma credencial oficial.

## Regerar

Requer `sharp` (já vem como dependência transitiva do Next). Os passos estão
descritos acima; qualquer novo logo deve passar pela mesma análise de luminância
antes de escolher o tratamento, nunca por filtro cego.
