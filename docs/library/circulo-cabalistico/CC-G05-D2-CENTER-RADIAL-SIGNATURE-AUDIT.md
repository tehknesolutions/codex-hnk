# CC-G05-D2 — Center Radial Signature Audit

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte:** SOURCE-RASTER-900 (900×900)  
**Estado:** CANON-ANALYSIS / AUDIT PASS / AK PROMOTION PENDING

## Objetivo

Antes de atribuir COLOR-ID aos 43 AK internos restantes, testar radialmente o centro para localizar onde a lógica setorial externa deixa de ser válida e onde as formas sobrepostas passam a dominar.

## Método

Centro geométrico operacional: aproximadamente (450,450). Foram varridas circunferências com amostragem angular densa em raios sucessivos, registrando cores exatas dominantes.

Raios auditados: 35, 50, 65, 80, 95, 110, 125, 140, 155, 170, 185 e 200 px.

## Resultados principais

### Núcleo interno — r=35–50

As massas dominantes são ciano, vermelho e amarelo, com azul e dourado/bege secundários. Isto confirma que o centro não segue a simples propagação dos 12 setores externos.

### Faixa intermediária — r=65–95

Aparecem de forma forte e recorrente:

- #FF7F00
- #FF0000
- #FFFF00
- #7F007F
- #3F007F
- #3FBF7F
- #0000FF

A alternância angular demonstra regiões/pétalas cromáticas reais, mas glifos e contornos interferem na leitura pontual.

### Faixa de fronteira — r≈110

Há forte presença de #373435 (contorno/ink), mostrando que esta circunferência cruza bordas estruturais em grande quantidade. Portanto r=110 não pode ser usado como amostra única de fundo.

### Faixa externa da Rosa — r=125–140

A paleta dos 12 setores volta a aparecer de forma distribuída, porém ainda misturada com as geometrias da Rosa.

### r≈155

Surgem grandes massas de #00A859, #3E4095, #FF0000 e #FFF212. Esta faixa pertence a outra estrutura gráfica e não deve ser confundida automaticamente com COLOR-ID dos setores externos.

## Conclusão

O audit confirma a regra do CC-G05-D:

> Não é seguro resolver os 43 AK internos por simples amostragem em um único raio ou por herança do setor angular.

É obrigatório usar máscara por região e erosão de borda.

## Estado do checksum cromático

```text
RADIAL-AK COLOR RESOLVED = 432
INNER-AK COLOR PENDING   = 43
TOTAL                    = 475
```

Nenhum dos 43 foi promovido neste gate apenas com base na assinatura radial.

## Próximo gate

CC-G05-D3 — construir máscaras regionais para HEADER-9, TRANSITION-12 e ROSE-22; medir moda cromática interna e dominance ratio por AK; somente então promover cada resultado a COLOR-ID.